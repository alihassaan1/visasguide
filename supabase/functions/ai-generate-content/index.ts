import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType, visaType, country, action = 'generate' } = await req.json();
    
    // Get OpenAI API key from settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings } = await supabaseClient
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_api_key')
      .single();

    const OPENAI_API_KEY = settings?.setting_value?.key || Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get model settings
    const { data: modelSettings } = await supabaseClient
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_model')
      .single();

    const model = modelSettings?.setting_value?.model || 'gpt-4o-mini';

    let systemPrompt = `You are an expert travel and visa content writer for Visas.Guide. 
    Create SEO-optimized, accurate, and helpful content about visa requirements and travel documentation.
    Format your response in HTML with proper headings, paragraphs, lists, and structure.`;

    let userPrompt = prompt;

    // Action-based prompts
    if (action === 'improve_seo') {
      userPrompt = `Improve the SEO of this content while maintaining accuracy:\n\n${prompt}`;
    } else if (action === 'make_concise') {
      userPrompt = `Make this content more concise and direct:\n\n${prompt}`;
    } else if (action === 'add_intro') {
      userPrompt = `Add an engaging introduction to this content:\n\n${prompt}`;
    } else if (action === 'add_summary') {
      userPrompt = `Add a comprehensive summary at the end of this content:\n\n${prompt}`;
    } else {
      // Generate based on content type
      if (contentType === 'Evergreen Guide') {
        userPrompt = `Create a comprehensive evergreen visa guide for ${country || visaType}. 
        Include: requirements, application process, fees, processing times, tips, and FAQs.
        Topic: ${prompt}`;
      } else if (contentType === 'News Update') {
        userPrompt = `Write a news update about: ${prompt}. 
        Make it timely, factual, and include the latest changes or developments.`;
      } else if (contentType === 'FAQ Page') {
        userPrompt = `Create a detailed FAQ page about ${country || visaType}. 
        Include 10-15 common questions and comprehensive answers.
        Topic: ${prompt}`;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Generate meta description and keywords
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Generate SEO metadata. Respond in JSON format with keys: meta_description (max 160 chars), keywords (array of 5-8 keywords), title (max 60 chars)' 
          },
          { role: 'user', content: `Generate SEO metadata for this content:\n\n${generatedContent}` }
        ],
        max_tokens: 200,
      }),
    });

    let metadata = { meta_description: '', keywords: [], title: '' };
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const metaContent = metaData.choices[0].message.content;
      try {
        metadata = JSON.parse(metaContent);
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }

    return new Response(
      JSON.stringify({
        content: generatedContent,
        metadata,
        tokensUsed: data.usage?.total_tokens || 0,
        model,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});