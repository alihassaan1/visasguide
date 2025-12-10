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

  // Use varied opening phrases to avoid repetition
  const openings = [
    "So you're planning a trip",
    "Thinking about visiting",
    "Got your heart set on",
    "Ready to explore",
    "Planning your adventure to"
  ];
  const randomOpening = openings[Math.floor(Math.random() * openings.length)];

  return `You're writing for a travel blog read by real travelers. Write about ${toCTR} visa requirements for ${fromCTR} citizens.

CRITICAL - HUMAN WRITING RULES (Google will penalize AI-sounding content):
- Write like a travel blogger sharing personal experience, not an encyclopedia
- Use contractions ALWAYS: "you'll", "don't", "it's", "can't", "won't", "there's"
- Start sentences with "And", "But", "So", "Plus" occasionally - humans do this
- Include slight imperfections - use dashes, parenthetical asides (like this), ellipses...
- Vary paragraph length dramatically - some 1 sentence, some 4-5 sentences
- Use informal phrases: "honestly", "to be fair", "here's the thing", "quick heads up"
- Add specific details that feel researched: embassy addresses, exact fees, real timelines
- Include first-person touches: "I've seen travelers...", "What works best is...", "A lot of people miss this..."
- NEVER use: "It is important to note", "Furthermore", "Additionally", "In conclusion", "One should", "It is recommended"
- NEVER start paragraphs with "When" or "If" repeatedly
- Avoid passive voice - say "You need" not "It is required"

SENTENCE VARIETY (mix these):
- Short punchy: "Simple enough."
- Questions: "Sound complicated? It's really not."
- Commands: "Make sure you..."
- Fragments: "The good news? No visa needed."

KNOWN VISA INFO:
- Visa Type: ${visaType}
- Fee: ${fee}
- Processing: ${processing}
- Max Stay: ${maxStay}
${visaData?.notes ? `- Notes: ${visaData.notes}` : ''}

STRUCTURE (600-800 words):

1. **Hook** - ${randomOpening} ${toCTR}? Let's break down what ${fromCTR} passport holders need.

2. **Quick Answer** (2-3 sentences) - Do ${fromCTR} citizens need a visa? Answer immediately.

3. **What You're Looking At** - Entry type, stay duration, written conversationally

4. **The Paperwork** - Documents needed, written like you're telling a friend

5. **Step by Step** - Application process in casual language

6. **What It'll Cost** - Fees, payment methods, hidden costs to watch for

7. **Pro Tips** - 3-4 insider tips that feel like real experience

8. **Quick FAQs** - 3 questions in Q&A format

TARGET KEYWORDS (weave naturally, don't force):
- "${toCTR} visa for ${fromCTR} citizens"
- "${fromCTR} passport ${toCTR} entry requirements"
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

    // Generate destination image using Lovable AI
    let featuredImageUrl: string | null = null;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (lovableApiKey) {
      try {
        console.log('Generating destination image for', toCountry.name);
        
        const imagePrompt = `Create a stunning, high-quality travel photograph of ${toCountry.name}'s most iconic landmark or scenic destination. 
The image should:
- Feature the most famous tourist attraction or natural wonder of ${toCountry.name}
- Have golden hour or blue hour lighting for maximum visual appeal
- Be landscape orientation suitable for a hero banner
- Look like a professional travel magazine cover photo
- Include architectural details, nature, or cityscape that instantly identifies ${toCountry.name}
- Be ultra high resolution, photorealistic quality
- Evoke wanderlust and inspire travel to ${toCountry.name}

Examples of landmarks by country:
- France: Eiffel Tower, Provence lavender fields
- Japan: Mount Fuji, Tokyo skyline, Kyoto temples
- Italy: Colosseum, Venice canals, Amalfi coast
- UAE: Burj Khalifa, Dubai Marina
- India: Taj Mahal, Jaipur palaces

Create the most visually stunning image representing ${toCountry.name}.`;

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
            console.log('✅ Destination image generated successfully');
          }
        } else {
          console.log('Image generation failed:', await imageResponse.text());
        }
      } catch (imageError) {
        console.error('Image generation error:', imageError);
        // Continue without image - content is more important
      }
    }

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
          { role: 'system', content: 'You are a veteran travel blogger who has visited 50+ countries. Your writing is casual, helpful, and based on real travel experience. You write like you are talking to a friend over coffee - natural, occasionally imperfect, but always genuinely useful. Never sound like a corporate FAQ or AI assistant.' },
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
        featured_image_url: featuredImageUrl,
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
