import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeContentTypography } from "../_shared/contentTypography.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 5; // Pages per invocation (parallel AI calls)
const MIN_QUALITY_LENGTH = 6000; // Characters - pages below this get upgraded
const TARGET_WORD_COUNT = '800-1200';

interface CountryInfo {
  name: string;
  slug: string;
  capital?: string;
  currency?: string;
  continent?: string;
}

function extractCountrySlugs(pageSlug: string): { fromSlug: string; toSlug: string } | null {
  // Handle visa-requirements/X-to-Y format
  const match = pageSlug.match(/^visa-requirements\/(.+)-to-(.+)$/);
  if (!match) return null;
  return { fromSlug: match[1], toSlug: match[2] };
}

function buildPrompt(from: CountryInfo, to: CountryInfo, visaType: string | null, existingContent: string): string {
  const visaInfo = visaType ? visaType.replace(/_/g, ' ') : 'standard visa requirements';
  
  return `You are a professional travel journalist writing a comprehensive visa guide. Rewrite and significantly expand the following thin content about ${to.name} visa requirements for ${from.name} citizens.

EXISTING THIN CONTENT (to be replaced with much better version):
${existingContent.substring(0, 1500)}

KNOWN FACTS:
- From: ${from.name} (Capital: ${from.capital || 'N/A'}, Currency: ${from.currency || 'N/A'}, Continent: ${from.continent || 'N/A'})
- To: ${to.name} (Capital: ${to.capital || 'N/A'}, Currency: ${to.currency || 'N/A'}, Continent: ${to.continent || 'N/A'})
- Visa type: ${visaInfo}

CRITICAL WRITING RULES:
- Write ${TARGET_WORD_COUNT} words of flowing, conversational prose
- Use contractions naturally: you'll, don't, it's, can't, we're, there's
- Start some sentences with And, But, So, Plus, Now
- Include helpful parenthetical asides, but never use em dashes or en dashes
- Vary paragraph lengths: some short (1-2 sentences), others longer (4-5 sentences)
- Ask rhetorical questions: "So what does this mean for you?"
- Add practical observations: "Here's what caught my attention...", "The interesting part..."
- Use specific numbers and details, not vague estimates
- FORBIDDEN: "It is important to note", "Furthermore", "Additionally", "In conclusion", "It should be noted", "Moving forward"
- Never start consecutive paragraphs the same way
- Mix sentence rhythm: Short. Then medium. Then occasionally longer.
- MINIMIZE bullet point lists — weave info into flowing paragraphs

CONTENT STRUCTURE:
1. Opening hook — answer the main question immediately (do they need a visa?)
2. Entry details — visa type, allowed stay duration, written conversationally
3. What you'll need — documents described naturally, not as a checklist
4. The application process — steps woven into readable paragraphs
5. Costs and fees — visa fees, hidden costs, payment tips
6. Practical tips — 3-4 insider tips embedded in prose
7. FAQs — 3 questions in Q&A format with <h3> for questions

TARGET KEYWORDS (weave naturally 2-3 times each):
- "${to.name} visa for ${from.name} citizens"
- "${from.name} to ${to.name} visa requirements"

OUTPUT FORMAT: Clean HTML using <h2>, <h3>, <p> tags. Use Tailwind classes: mb-4 on paragraphs, mt-8 mb-4 on h2, mt-6 mb-3 on h3. Minimal <ul>/<li> usage.`;
}

async function generateWithDeepSeek(prompt: string, apiKey: string, authorName: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You are ${authorName}, an experienced travel journalist. Write naturally, conversationally, and with genuine expertise. Never sound like AI.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`DeepSeek error: ${response.status} - ${errBody}`);
      return null;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('DeepSeek call failed:', e);
    return null;
  }
}

async function generateWithLovableAI(prompt: string, apiKey: string, authorName: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: `You are ${authorName}, an experienced travel journalist. Write naturally, conversationally, and with genuine expertise. Never sound like AI.` },
          { role: 'user', content: prompt }
        ],
      }),
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Lovable AI error: ${response.status} - ${errBody}`);
      return null;
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('Lovable AI call failed:', e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API keys
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['deepseek_api_key']);

    let deepseekKey: string | null = null;
    for (const s of settings || []) {
      if (s.setting_key === 'deepseek_api_key' && typeof s.setting_value === 'object') {
        deepseekKey = (s.setting_value as any).key;
      }
    }
    if (!deepseekKey) deepseekKey = Deno.env.get('DEEPSEEK_API_KEY') ?? null;
    
    const lovableKey = Deno.env.get('LOVABLE_API_KEY') ?? null;

    if (!deepseekKey && !lovableKey) {
      throw new Error('No AI API keys configured');
    }

    // Get active authors
    const { data: authors } = await supabase
      .from('authors')
      .select('id, name, slug')
      .eq('is_active', true);
    const authorsList = authors || [];

    // Fetch batch of thin pages (prioritize shortest content first)
    const { data: thinPages, error: fetchError } = await supabase
      .from('content_pages')
      .select('id, slug, content, title, writer_id')
      .like('slug', 'visa-requirements/%')
      .eq('is_published', true)
      .lt('content', new Array(MIN_QUALITY_LENGTH).fill('z').join('')) // length proxy
      .order('updated_at', { ascending: true }) // oldest first = least recently touched
      .limit(BATCH_SIZE);

    // Actually filter by content length properly
    // The above lt trick doesn't work well, use a different approach
    // Fetch more and filter client-side
    const { data: candidates } = await supabase
      .from('content_pages')
      .select('id, slug, content, title, writer_id')
      .like('slug', 'visa-requirements/%')
      .eq('is_published', true)
      .order('updated_at', { ascending: true })
      .limit(100);

    const thinCandidates = (candidates || [])
      .filter(p => p.content.length < MIN_QUALITY_LENGTH)
      .slice(0, BATCH_SIZE);

    if (thinCandidates.length === 0) {
      console.log('✅ No more thin pages to upgrade!');
      return new Response(JSON.stringify({ success: true, message: 'No thin pages remaining', upgraded: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📝 Upgrading ${thinCandidates.length} thin pages...`);

    // Extract all unique country slugs
    const countrySlugs = new Set<string>();
    for (const page of thinCandidates) {
      const parsed = extractCountrySlugs(page.slug);
      if (parsed) {
        countrySlugs.add(parsed.fromSlug);
        countrySlugs.add(parsed.toSlug);
      }
    }

    // Fetch country data
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, slug, capital, currency, continent')
      .in('slug', Array.from(countrySlugs));

    const countryMap = new Map<string, CountryInfo>();
    for (const c of countries || []) {
      countryMap.set(c.slug, c);
    }

    // Fetch visa requirement types
    const countryIdMap = new Map<string, string>();
    for (const c of countries || []) {
      countryIdMap.set(c.slug, c.id);
    }

    // Process pages in parallel
    const results = await Promise.allSettled(
      thinCandidates.map(async (page) => {
        const parsed = extractCountrySlugs(page.slug);
        if (!parsed) return { id: page.id, success: false, reason: 'invalid slug' };

        const from = countryMap.get(parsed.fromSlug);
        const to = countryMap.get(parsed.toSlug);
        if (!from || !to) return { id: page.id, success: false, reason: 'country not found' };

        // Get visa type
        const fromId = countryIdMap.get(parsed.fromSlug);
        const toId = countryIdMap.get(parsed.toSlug);
        let visaType: string | null = null;
        if (fromId && toId) {
          const { data: vr } = await supabase
            .from('visa_requirements')
            .select('requirement_type')
            .eq('from_country_id', fromId)
            .eq('to_country_id', toId)
            .maybeSingle();
          visaType = vr?.requirement_type || null;
        }

        // Pick random author
        const author = authorsList.length > 0
          ? authorsList[Math.floor(Math.random() * authorsList.length)]
          : { id: null, name: 'Visas.Guide Editorial', slug: 'editorial' };

        const prompt = buildPrompt(from, to, visaType, page.content);

        // Try DeepSeek first, fallback to Lovable AI
        let newContent: string | null = null;
        let provider = 'deepseek';
        
        if (deepseekKey) {
          newContent = await generateWithDeepSeek(prompt, deepseekKey, author.name);
        }
        
        if (!newContent && lovableKey) {
          provider = 'lovable-ai';
          newContent = await generateWithLovableAI(prompt, lovableKey, author.name);
        }

        if (!newContent) {
          return { id: page.id, success: false, reason: 'AI generation failed' };
        }

        // Strip markdown code fences if present
        newContent = newContent
          .replace(/^```\w*\s*\n?/gm, '')
          .replace(/```\s*$/gm, '')
          .trim();
        newContent = normalizeContentTypography(newContent);

        // Update the page
        const { error: updateError } = await supabase
          .from('content_pages')
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
            writer_id: author.id || page.writer_id,
          })
          .eq('id', page.id);

        if (updateError) {
          return { id: page.id, success: false, reason: updateError.message };
        }

        // Log API call
        await supabase.from('api_logs').insert({
          api_provider: provider,
          endpoint: provider === 'deepseek' ? 'https://api.deepseek.com/v1/chat/completions' : 'https://ai.gateway.lovable.dev/v1/chat/completions',
          task_type: 'content-upgrade',
          entity_name: page.slug,
          status: 'success',
          response_time_ms: 0,
        });

        return { id: page.id, success: true, slug: page.slug, provider, oldLen: page.content.length, newLen: newContent.length };
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - succeeded;

    console.log(`✅ Upgraded: ${succeeded}, Failed: ${failed}`);

    // Count remaining thin pages
    const { data: remaining } = await supabase
      .from('content_pages')
      .select('id', { count: 'exact', head: true })
      .like('slug', 'visa-requirements/%')
      .eq('is_published', true);

    return new Response(JSON.stringify({
      success: true,
      upgraded: succeeded,
      failed,
      details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, reason: 'promise rejected' }),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Bulk upgrade error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
