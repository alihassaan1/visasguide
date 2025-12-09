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
  visaData: { requirement_type?: string; fee_usd?: number; processing_time_days?: number; max_stay_days?: number; notes?: string } | null
): string {
  const fromCTR = getCTROptimizedName(fromCountry.slug, fromCountry.name);
  const toCTR = getCTROptimizedName(toCountry.slug, toCountry.name);
  
  const visaType = visaData?.requirement_type?.replace(/_/g, ' ') || 'visa requirements vary';
  const fee = visaData?.fee_usd ? `$${visaData.fee_usd}` : 'varies';
  const processing = visaData?.processing_time_days ? `${visaData.processing_time_days} days` : 'varies';
  const maxStay = visaData?.max_stay_days ? `${visaData.max_stay_days} days` : 'varies';

  return `You're a friendly travel advisor helping a friend plan their trip. Write about ${toCTR} visa requirements for ${fromCTR} citizens.

WRITING STYLE - CRITICAL (must feel human, NOT AI):
- Write like you're chatting with a friend planning their trip
- Use contractions naturally: "you'll need", "don't worry", "it's pretty straightforward"
- NEVER use these AI phrases: "It is important to note", "In conclusion", "Furthermore", "Additionally", "It should be noted"
- Start with a direct answer - "Good news!" or "Here's the deal" or "Short answer:"
- Include practical, experience-based tips like a friend would share
- Vary sentence length - mix short punchy sentences with longer explanations
- Use "you" and "your" constantly - speak directly to the reader
- Add personality: "Pro tip:", "Here's what most people don't know:", "Trust me on this one:"
- Be conversational but accurate

KNOWN VISA INFO:
- Visa Type: ${visaType}
- Fee: ${fee}
- Processing: ${processing}
- Max Stay: ${maxStay}
${visaData?.notes ? `- Notes: ${visaData.notes}` : ''}

STRUCTURE (600-800 words total):

1. **Quick Answer** (2-3 sentences) - Do ${fromCTR} citizens need a visa for ${toCTR}? Answer IMMEDIATELY in your opening line.

2. **The Basics** - What type of visa/entry is available, how long can you stay

3. **What You'll Actually Need** - Documents in practical terms, not bureaucratic language

4. **How to Get It** - Step-by-step process, written conversationally

5. **Money Talk** - Costs, payment methods, any hidden fees to watch for

6. **Pro Tips** - 3-4 practical tips from "experience"

7. **Common Questions** - 3 FAQs people actually ask

KEYWORDS TO WEAVE IN NATURALLY:
- "${toCTR} visa for ${fromCTR} citizens"
- "${fromCTR} citizens ${toCTR} visa requirements"
- "do ${fromCTR} citizens need visa for ${toCTR}"

OUTPUT: Clean HTML with h2, h3, p, ul tags. Use Tailwind classes for spacing (mb-4, mt-6). NO border classes.`;
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

    // Generate content using DeepSeek
    const prompt = generateVisaRequirementsPrompt(fromCountry, toCountry, visaData);
    
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
          { role: 'system', content: 'You are a helpful travel advisor who writes engaging, human-like content about visa requirements. Your writing should feel natural, friendly, and helpful - never robotic or AI-like.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
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

    // Save the content to database
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
        meta_title: `${toCTR} Visa for ${fromCTR} Citizens 2025 | Visas Guide`,
        meta_description: metaDescription,
        excerpt: metaDescription,
        is_published: true,
        ai_generated: true,
        status: 'published',
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
      
      // Submit to IndexNow
      try {
        await fetch(`${supabaseUrl}/functions/v1/indexnow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            urls: [`https://visas.guide/visa-requirements/${fromSlug}-to-${toSlug}`] 
          })
        });
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
      responseTime
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
