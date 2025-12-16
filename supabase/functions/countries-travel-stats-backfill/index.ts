import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get DeepSeek API key from site_settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    const deepseekApiKey = settingsData?.setting_value;
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const { countryId, countryName, batchSize = 5 } = await req.json();

    // If specific country requested
    if (countryId && countryName) {
      const result = await enrichCountryTravelStats(supabase, deepseekApiKey, countryId, countryName);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch mode: get countries without travel stats
    const { data: countries, error: fetchError } = await supabase
      .from('countries')
      .select('id, name')
      .is('annual_tourists', null)
      .limit(batchSize);

    if (fetchError) throw fetchError;

    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'All countries have travel stats populated',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    for (const country of countries) {
      try {
        const result = await enrichCountryTravelStats(supabase, deepseekApiKey, country.id, country.name);
        results.push({ country: country.name, ...result });
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error enriching ${country.name}:`, error);
        results.push({ country: country.name, success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      processed: results.length, 
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in countries-travel-stats-backfill:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function enrichCountryTravelStats(
  supabase: any,
  apiKey: string,
  countryId: string,
  countryName: string
) {
  console.log(`Enriching travel stats for ${countryName}`);

  const prompt = `Provide tourism statistics for ${countryName}. Return ONLY valid JSON with these exact fields:
{
  "annual_tourists": <number of international tourist arrivals per year, use latest available data from UNWTO or World Bank, in millions multiply by 1000000>,
  "tourism_rank": <global ranking by tourist arrivals, 1-200>,
  "tourism_revenue_usd": <annual tourism revenue in USD, in billions multiply by 1000000000>,
  "top_source_countries": ["country1", "country2", "country3", "country4", "country5"],
  "peak_travel_months": "<e.g. 'June to August' or 'December to February'>",
  "tourism_growth_percent": <year-over-year growth percentage, can be negative>
}

Use realistic data based on UNWTO World Tourism Barometer, World Bank tourism statistics, and official tourism board data. For smaller countries with limited tourism, estimate based on regional averages and country characteristics. Return ONLY the JSON object, no explanation.`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a tourism data expert. Provide accurate tourism statistics based on official sources. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from DeepSeek');
  }

  // Parse JSON from response
  let stats;
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, content];
    stats = JSON.parse(jsonMatch[1] || content);
  } catch (parseError) {
    console.error('Failed to parse DeepSeek response:', content);
    throw new Error('Failed to parse travel stats JSON');
  }

  // Update the country with travel stats
  const { error: updateError } = await supabase
    .from('countries')
    .update({
      annual_tourists: Number(stats.annual_tourists) || null,
      tourism_rank: Number(stats.tourism_rank) || null,
      tourism_revenue_usd: Number(stats.tourism_revenue_usd) || null,
      top_source_countries: stats.top_source_countries || [],
      peak_travel_months: String(stats.peak_travel_months || ''),
      tourism_growth_percent: Number(stats.tourism_growth_percent) || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', countryId);

  if (updateError) {
    throw updateError;
  }

  // Log the API call
  await supabase.from('api_logs').insert({
    api_provider: 'deepseek',
    task_type: 'travel_stats_enrichment',
    entity_name: countryName,
    status: 'success',
    input_tokens: data.usage?.prompt_tokens || 0,
    output_tokens: data.usage?.completion_tokens || 0,
    tokens_used: data.usage?.total_tokens || 0,
  });

  console.log(`Successfully enriched travel stats for ${countryName}`);
  return { success: true, stats };
}
