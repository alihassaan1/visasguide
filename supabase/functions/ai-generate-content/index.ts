import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { requireAdmin } from "../_shared/adminAuth.ts";
import { normalizeContentTypography, normalizeTitleTypography } from "../_shared/contentTypography.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get OpenAI key
async function getOpenAIKey(supabaseClient: any) {
  const { data: openaiSettings } = await supabaseClient
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'openai_api_key')
    .single();
  return openaiSettings?.setting_value?.key || Deno.env.get('OPENAI_API_KEY');
}

// Helper function to log API calls with token breakdown
async function logApiCall(
  supabase: any,
  provider: string,
  taskType: string,
  entityName: string,
  status: 'success' | 'error' | 'timeout',
  startTime: number,
  tokensUsed?: number,
  errorMessage?: string,
  inputTokens?: number,
  outputTokens?: number
) {
  const responseTime = Date.now() - startTime;
  await supabase.from('api_logs').insert({
    api_provider: provider,
    endpoint: provider === 'deepseek' ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions',
    task_type: taskType,
    entity_name: entityName,
    status,
    response_time_ms: responseTime,
    tokens_used: tokensUsed || null,
    input_tokens: inputTokens || null,
    output_tokens: outputTokens || null,
    error_message: errorMessage || null,
    response_summary: { action: taskType }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const unauth = await requireAdmin(req, corsHeaders);
  if (unauth) return unauth;

  const startTime = Date.now();

  try {
    const { prompt, contentType, visaType, country, action = 'generate', provider = 'openai' } = await req.json();
    
    // Get API keys from settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle image generation
    if (action === 'generate_image') {
      const OPENAI_API_KEY = await getOpenAIKey(supabaseClient);
      if (!OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured for image generation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        }),
      });

      if (!imageResponse.ok) {
        const error = await imageResponse.text();
        console.error('Image generation error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to generate image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const imageData = await imageResponse.json();
      const base64Image = imageData.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return new Response(
        JSON.stringify({ imageUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data: deepseekSettings } = await supabaseClient
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    const OPENAI_API_KEY = await getOpenAIKey(supabaseClient);
    const DEEPSEEK_API_KEY = deepseekSettings?.setting_value?.key;
    
    // Choose provider based on parameter
    const useDeepseek = provider === 'deepseek' && DEEPSEEK_API_KEY;
    const API_KEY = useDeepseek ? DEEPSEEK_API_KEY : OPENAI_API_KEY;
    const apiUrl = useDeepseek 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    // Note: API_KEY may be missing — meta path below can fall back to Lovable AI Gateway.


    // Get model settings
    const { data: modelSettings } = await supabaseClient
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_model')
      .single();

    const model = useDeepseek 
      ? 'deepseek-chat'
      : (modelSettings?.setting_value?.model || 'gpt-4o-mini');

    // Handle meta generation actions - prefer Lovable AI Gateway (free, no billing)
    if (action === 'generate_meta' || action === 'generate_keywords') {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

      // Try Lovable AI Gateway first
      if (LOVABLE_API_KEY) {
        const gwResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an SEO expert. Return only the requested content without any additional text or formatting.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (gwResp.ok) {
          const gwData = await gwResp.json();
          const generatedContent = normalizeContentTypography(gwData.choices?.[0]?.message?.content?.trim() ?? '');
          return new Response(
            JSON.stringify({ content: generatedContent, tokensUsed: gwData.usage?.total_tokens || 0, model: 'google/gemini-2.5-flash' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const gwErr = await gwResp.text();
        console.error('Lovable AI Gateway meta error:', gwResp.status, gwErr);
        // fall through to OpenAI/DeepSeek if configured
      }

      if (!API_KEY) {
        return new Response(
          JSON.stringify({ error: 'No AI provider configured. Lovable AI Gateway unavailable and no OpenAI/DeepSeek key set.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an SEO expert. Return only the requested content without any additional text or formatting.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`API Error:`, error);
        return new Response(
          JSON.stringify({ error: `Meta generation failed: ${error}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const generatedContent = normalizeContentTypography(data.choices[0].message.content.trim());

      return new Response(
        JSON.stringify({ 
          content: generatedContent,
          tokensUsed: data.usage?.total_tokens || 0,
          model 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // From here on we require an OpenAI/DeepSeek key
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: `${useDeepseek ? 'DeepSeek' : 'OpenAI'} API key not configured` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }




    let systemPrompt = `You are an expert travel and visa content writer for Visas.Guide.
    Create SEO-optimized, accurate, and helpful content about visa requirements and travel documentation.
    Format your response in HTML with proper headings, paragraphs, lists, and structure.
    Never use em dashes or en dashes. Use commas, parentheses, colons, or standard hyphens instead.`;

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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
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

    // Handle test connection separately
    if (action === 'test_connection') {
      if (!response.ok) {
        const errorText = await response.text();
        let reason = errorText;
        try {
          const parsed = JSON.parse(errorText);
          reason = parsed?.error?.message || parsed?.message || errorText;
        } catch {}
        console.error(`${useDeepseek ? 'DeepSeek' : 'OpenAI'} test failed:`, reason);
        const lowered = String(reason).toLowerCase();
        const isInsufficient = lowered.includes('insufficient balance') || lowered.includes('insufficient_quota') || lowered.includes('insufficient');
        await logApiCall(supabaseClient, useDeepseek ? 'deepseek' : 'openai', 'test_connection', 'api-test', 'error', startTime, undefined, reason);
        return new Response(
          JSON.stringify({ ok: false, reason, code: isInsufficient ? 'insufficient_balance' : 'error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      await logApiCall(supabaseClient, useDeepseek ? 'deepseek' : 'openai', 'test_connection', 'api-test', 'success', startTime);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error(`${useDeepseek ? 'DeepSeek' : 'OpenAI'} API error:`, error);
      await logApiCall(supabaseClient, useDeepseek ? 'deepseek' : 'openai', `content_${action}`, contentType || 'unknown', 'error', startTime, undefined, error);
      return new Response(
        JSON.stringify({ error: `Failed to generate content: ${error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = normalizeContentTypography(data.choices[0].message.content);
    const tokensUsed = data.usage?.total_tokens || 0;
    const inputTokens = data.usage?.prompt_tokens;
    const outputTokens = data.usage?.completion_tokens;
    
    // Log successful content generation with token breakdown
    await logApiCall(supabaseClient, useDeepseek ? 'deepseek' : 'openai', `content_${action}`, contentType || country || visaType || 'content', 'success', startTime, tokensUsed, undefined, inputTokens, outputTokens);

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
        const parsedMetadata = JSON.parse(metaContent);
        metadata = {
          ...parsedMetadata,
          meta_description: normalizeContentTypography(parsedMetadata.meta_description || ''),
          title: normalizeTitleTypography(parsedMetadata.title || ''),
        };
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