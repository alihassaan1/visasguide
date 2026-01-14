import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country name abbreviations for CTR optimization
const COUNTRY_ABBREVIATIONS: Record<string, string[]> = {
  'saint-kitts-and-nevis': ['St Kitts', 'Saint Kitts', 'St Kitts and Nevis'],
  'united-states': ['USA', 'US', 'United States', 'America'],
  'united-kingdom': ['UK', 'Britain', 'United Kingdom', 'Great Britain'],
  'united-arab-emirates': ['UAE', 'Dubai', 'United Arab Emirates'],
  'czech-republic': ['Czech Republic', 'Czechia'],
  'south-korea': ['South Korea', 'Korea'],
  'new-zealand': ['New Zealand', 'NZ'],
  'hong-kong': ['Hong Kong', 'HK'],
  'saudi-arabia': ['Saudi Arabia', 'KSA'],
  'trinidad-and-tobago': ['Trinidad', 'Trinidad and Tobago'],
  'antigua-and-barbuda': ['Antigua', 'Antigua and Barbuda'],
};

interface Author {
  id: string;
  name: string;
  slug: string;
}

function getCTROptimizedName(slug: string, name: string): string {
  const abbrevs = COUNTRY_ABBREVIATIONS[slug];
  if (abbrevs && abbrevs.length > 0) {
    return abbrevs[0];
  }
  return name;
}

function generateVisaRequirementsPrompt(
  fromCountry: { name: string; slug: string },
  toCountry: { name: string; slug: string },
  visaData: { requirement_type?: string; fee_usd?: number; processing_time_days?: number; max_stay_days?: number; notes?: string } | null,
  authorName: string
): string {
  const fromCTR = getCTROptimizedName(fromCountry.slug, fromCountry.name);
  const toCTR = getCTROptimizedName(toCountry.slug, toCountry.name);
  
  const visaType = visaData?.requirement_type?.replace(/_/g, ' ') || 'visa requirements vary';
  const fee = visaData?.fee_usd ? `$${visaData.fee_usd}` : 'varies';
  const processing = visaData?.processing_time_days ? `${visaData.processing_time_days} days` : 'varies';
  const maxStay = visaData?.max_stay_days ? `${visaData.max_stay_days} days` : 'varies';

  return `You are ${authorName}, a travel journalist writing about ${toCTR} visa requirements for ${fromCTR} citizens.

CRITICAL ANTI-AI DETECTION (Google penalizes AI content):
- Write in YOUR personal voice - "I've researched...", "What I've found...", "In my experience covering visa policies..."
- Use contractions naturally: you'll, don't, it's, can't, we're, there's, that's, won't
- Start some sentences with And, But, So, Plus, Now - real writers do this
- Include parenthetical asides (readers find these helpful) and em-dashes for emphasis—like this
- Vary paragraph lengths dramatically: some very short, others 4-5 sentences
- AVOID bullet point lists - weave information into flowing prose instead
- Ask rhetorical questions: "So what does this actually mean for you?"
- Add personal observations: "Here's what caught my attention...", "The interesting part..."
- Use specific numbers and details (not rounded estimates)
- FORBIDDEN phrases: "It is important to note", "Furthermore", "Additionally", "In conclusion", "One should", "It should be noted", "Moving forward", "It is worth mentioning"
- Never start consecutive paragraphs with the same word or structure
- Mix sentence rhythm: Short and punchy. Then medium length. Occasionally a longer, more complex sentence that builds on the previous ideas.

KNOWN VISA INFO:
- Visa Type: ${visaType}
- Fee: ${fee}
- Processing: ${processing}
- Max Stay: ${maxStay}
${visaData?.notes ? `- Notes: ${visaData.notes}` : ''}

CONTENT STRUCTURE (600-800 words, flowing prose):
1. Hook - Answer the main question immediately (do they need a visa?)
2. The Details - Entry type, stay duration, written conversationally in paragraphs
3. What You'll Need - Documents, written like explaining to a friend (NO bullet lists)
4. The Process - Application steps woven into flowing paragraphs
5. Costs - Fees, payment info, hidden costs to watch for
6. Insider Tips - 3-4 practical tips embedded in prose
7. Common Questions - 2-3 FAQs in Q&A format at the end

TARGET KEYWORDS (weave naturally):
- "${toCTR} visa for ${fromCTR} citizens"
- "${fromCTR} passport ${toCTR} entry requirements"

OUTPUT: Clean HTML with <h2> (sparingly), <h3>, <p> tags. Minimize <ul>/<li> lists. Use Tailwind spacing classes (mb-4, mt-6).`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fromSlug, toSlug } = await req.json();
    
    if (!fromSlug || !toSlug) {
      throw new Error('fromSlug and toSlug are required');
    }

    console.log(`🌍 Generating visa content for ${fromSlug} → ${toSlug}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get DeepSeek API key
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    let apiKey = null;
    if (settings?.setting_value && typeof settings.setting_value === 'object') {
      apiKey = (settings.setting_value as any).key;
    }
    
    if (!apiKey) {
      apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    }
    
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Fetch all active authors for random assignment
    const { data: authors } = await supabase
      .from('authors')
      .select('id, name, slug')
      .eq('is_active', true);

    const authorsList: Author[] = authors || [];
    const randomAuthor = authorsList.length > 0 
      ? authorsList[Math.floor(Math.random() * authorsList.length)]
      : { id: null, name: 'Visas.Guide Editorial', slug: 'editorial' };

    console.log(`📝 Content will be written by: ${randomAuthor.name}`);

    // Get country data
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, slug, code')
      .in('slug', [fromSlug, toSlug]);

    if (!countries || countries.length !== 2) {
      throw new Error('Countries not found');
    }

    const fromCountry = countries.find(c => c.slug === fromSlug);
    const toCountry = countries.find(c => c.slug === toSlug);

    if (!fromCountry || !toCountry) {
      throw new Error('Could not match countries');
    }

    // Check if content already exists
    const contentSlug = `${fromSlug}-to-${toSlug}-visa-requirements`;
    const { data: existingContent } = await supabase
      .from('content_pages')
      .select('id, content')
      .eq('slug', contentSlug)
      .maybeSingle();

    if (existingContent?.content) {
      console.log('Content already exists, returning existing content');
      return new Response(JSON.stringify({ 
        success: true, 
        content: existingContent.content,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get any existing visa requirement data
    const { data: visaData } = await supabase
      .from('visa_requirements')
      .select('*')
      .eq('from_country_id', fromCountry.id)
      .eq('to_country_id', toCountry.id)
      .maybeSingle();

    // Generate destination image using Lovable AI
    let featuredImageUrl: string | null = null;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (lovableApiKey) {
      try {
        console.log('Generating destination image for', toCountry.name);
        
        const imagePrompt = `Create a stunning travel photograph of ${toCountry.name}'s most iconic landmark.
Style: Professional travel magazine cover, golden hour lighting, photorealistic, landscape orientation.
Feature: The most famous tourist attraction that instantly identifies ${toCountry.name}.
Quality: Ultra high resolution, suitable for hero banner.`;

        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{ role: 'user', content: imagePrompt }],
            modalities: ['image', 'text'],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          featuredImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (featuredImageUrl) {
            console.log('✅ Destination image generated');
          }
        }
      } catch (imageError) {
        console.error('Image generation error:', imageError);
      }
    }

    // Generate content using DeepSeek with author's voice
    const prompt = generateVisaRequirementsPrompt(fromCountry, toCountry, visaData, randomAuthor.name);
    
    console.log('Calling DeepSeek API...');
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You are ${randomAuthor.name}, an experienced travel journalist with 10+ years covering visa and immigration topics. Your writing is conversational, insightful, and reads like it was written by a real person sharing their expertise. You never sound like AI or a corporate FAQ. You avoid bullet point lists and prefer flowing prose.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens;
    const responseTime = Date.now() - startTime;

    console.log(`Content generated in ${responseTime}ms, tokens: ${tokensUsed}`);

    // Save the content to database with author
    const fromCTR = getCTROptimizedName(fromCountry.slug, fromCountry.name);
    const toCTR = getCTROptimizedName(toCountry.slug, toCountry.name);
    const title = `${toCTR} Visa Requirements for ${fromCTR} Citizens`;
    const metaDescription = `Complete ${toCTR} visa guide for ${fromCTR} passport holders. Check if you need a visa, requirements, fees, and application process for traveling from ${fromCountry.name} to ${toCountry.name}.`;

    const { error: insertError } = await supabase
      .from('content_pages')
      .upsert({
        slug: contentSlug,
        title,
        content: generatedContent,
        meta_title: `${toCTR} Visa for ${fromCTR} Citizens 2026 | Visas Guide`,
        meta_description: metaDescription,
        excerpt: metaDescription,
        featured_image_url: featuredImageUrl,
        is_published: true,
        ai_generated: true,
        status: 'published',
        writer_id: randomAuthor.id || null,
        keywords: [
          `${toCountry.name} visa`,
          `${toCountry.name} visa for ${fromCountry.name}`,
          `${fromCountry.name} to ${toCountry.name} visa`,
          `${toCountry.name} visa requirements`
        ]
      }, { onConflict: 'slug' });

    if (insertError) {
      console.error('Error saving content:', insertError);
    } else {
      console.log('Content saved successfully');
      
      // Submit to IndexNow using auto-indexnow function
      try {
        await fetch(`${supabaseUrl}/functions/v1/auto-indexnow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            urls: [`/${contentSlug}`] 
          })
        });
        console.log('✅ Submitted to IndexNow:', contentSlug);
      } catch (indexError) {
        console.error('IndexNow error:', indexError);
      }
    }

    // Log API call
    await supabase.from('api_logs').insert({
      api_provider: 'deepseek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      task_type: 'on-demand-visa-content',
      entity_name: contentSlug,
      status: 'success',
      response_time_ms: responseTime,
      tokens_used: tokensUsed,
      input_tokens: data.usage?.prompt_tokens,
      output_tokens: data.usage?.completion_tokens,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      content: generatedContent,
      cached: false,
      tokensUsed,
      responseTime,
      author: randomAuthor.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating visa content:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
