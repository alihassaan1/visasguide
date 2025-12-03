import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to log API calls
async function logApiCall(
  supabase: any,
  taskType: string,
  status: 'success' | 'error' | 'timeout',
  startTime: number,
  tokensUsed?: number,
  errorMessage?: string
) {
  const responseTime = Date.now() - startTime;
  await supabase.from('api_logs').insert({
    api_provider: 'deepseek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    task_type: taskType,
    entity_name: 'site-review-chat',
    status,
    response_time_ms: responseTime,
    tokens_used: tokensUsed || null,
    error_message: errorMessage || null,
    response_summary: { task: 'site_review' }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { messages } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get DeepSeek API key from site_settings
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
      console.error('DeepSeek API key not found in site_settings or environment variables');
      throw new Error('DeepSeek API key not configured. Please add it in API Settings.');
    }

    console.log('DeepSeek API key found, making request...');

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web analyst and UX consultant. Review the visas.guide website and provide actionable improvement suggestions for SEO, user experience, content strategy, and technical optimization. Be specific and practical in your recommendations.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      await logApiCall(supabase, 'site_review_chat', 'error', startTime, undefined, `${response.status}: ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const tokensUsed = data.usage?.total_tokens || null;
    
    // Log successful API call with tokens
    await logApiCall(supabase, 'site_review_chat', 'success', startTime, tokensUsed);
    console.log(`DeepSeek chat tokens used: ${tokensUsed}`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in deepseek-chat function:', error);
    // Log error if not already logged
    if (!error.message?.includes('DeepSeek API error')) {
      await logApiCall(supabase, 'site_review_chat', 'error', startTime, undefined, error.message);
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});