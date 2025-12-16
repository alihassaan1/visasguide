import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function logApiCall(
  supabase: any,
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
  try {
    await supabase.from('api_logs').insert({
      api_provider: 'deepseek',
      endpoint: 'https://api.deepseek.com/chat/completions',
      task_type: taskType,
      entity_name: entityName,
      status,
      response_time_ms: responseTime,
      tokens_used: tokensUsed,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      error_message: errorMessage,
      retry_count: 0,
      response_summary: { mode: taskType }
    });
    console.log(`API call logged: ${taskType} - ${entityName} - ${status}`);
  } catch (logError) {
    console.error('Failed to log API call:', logError);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cityId, cityName, countryName, countryId, generateCities, enhancedContent } = await req.json();

    console.log('Generate city content request:', { cityId, cityName, countryName, countryId, generateCities, enhancedContent });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // If generateCities is true, generate top cities for a country
    if (generateCities && countryId && countryName) {
      console.log(`Generating top cities for ${countryName}`);
      
      const prompt = `List the top 5 most visited cities in ${countryName} for tourists. For each city, provide:
1. City name
2. A comprehensive description (4-5 sentences about why tourists visit, key attractions, culture)
3. Top 5 attractions/places to visit
4. Approximate population
5. Whether it's the capital city (true/false)
6. Best time to visit (e.g., "March to May for pleasant weather")
7. Safety tips (2-3 practical safety tips)
8. Getting around tips (transportation options)
9. Latitude and longitude coordinates

Return ONLY a valid JSON array with this exact structure, no markdown:
[
  {
    "name": "City Name",
    "description": "Comprehensive description here...",
    "attractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
    "population": 1000000,
    "is_capital": false,
    "best_time_to_visit": "March to May for pleasant weather and fewer crowds",
    "safety_tips": "Keep valuables secure in crowded areas. Use licensed taxis. Be aware of common tourist scams.",
    "getting_around": "Metro system covers major areas. Taxis are affordable. Walking is great for central districts.",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
]`;

      const startTime = Date.now();
      let response;
      try {
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a travel expert with deep knowledge of cities worldwide. Always respond with valid JSON only, no markdown formatting. Provide accurate, helpful information for tourists.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          await logApiCall(supabase, 'city_generation', countryName, 'error', startTime, undefined, `DeepSeek API error: ${response.status}`);
          throw new Error(`DeepSeek API error: ${response.status}`);
        }
      } catch (fetchError) {
        await logApiCall(supabase, 'city_generation', countryName, 'error', startTime, undefined, fetchError.message);
        throw fetchError;
      }

      const data = await response.json();
      const usage = data.usage || {};
      let content = data.choices[0]?.message?.content || '[]';
      
      // Clean up the response
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('DeepSeek response:', content);

      let cities;
      try {
        cities = JSON.parse(content);
        await logApiCall(
          supabase,
          'city_generation',
          countryName,
          'success',
          startTime,
          usage.total_tokens,
          undefined,
          usage.prompt_tokens,
          usage.completion_tokens
        );
      } catch (e) {
        console.error('Failed to parse cities JSON:', e);
        await logApiCall(supabase, 'city_generation', countryName, 'error', startTime, usage.total_tokens, 'Failed to parse JSON response', usage.prompt_tokens, usage.completion_tokens);
        return new Response(JSON.stringify({ error: 'Failed to parse city data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert cities into database with enhanced fields
      const insertedCities = [];
      for (const city of cities) {
        const slug = city.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        const { data: insertedCity, error } = await supabase
          .from('cities')
          .upsert({
            country_id: countryId,
            name: city.name,
            slug: slug,
            description: city.description,
            attractions: city.attractions || [],
            population: city.population,
            is_capital: city.is_capital || false,
            is_featured: true,
            best_time_to_visit: city.best_time_to_visit,
            safety_tips: city.safety_tips,
            getting_around: city.getting_around,
            latitude: city.latitude,
            longitude: city.longitude,
            meta_title: `${city.name}, ${countryName} - Tours, Activities & Travel Guide 2025`,
            meta_description: `Discover the best tours, activities, and things to do in ${city.name}, ${countryName}. ${city.description?.substring(0, 100)}...`,
          }, {
            onConflict: 'slug'
          })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting city ${city.name}:`, error);
        } else {
          insertedCities.push(insertedCity);
          console.log(`Inserted city: ${city.name}`);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        cities: insertedCities,
        message: `Generated ${insertedCities.length} cities for ${countryName}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If cityId is provided, update a single city's content (enhanced version)
    if (cityId && cityName && countryName) {
      console.log(`Generating enhanced content for ${cityName}, ${countryName}`);
      
      const prompt = `Write a comprehensive travel guide for ${cityName}, ${countryName}. This should be 800-1000 words covering:

1. **City Overview** (3-4 paragraphs): What makes this city special, its history, culture, and atmosphere. Why tourists love visiting.

2. **Top Attractions**: List the top 5-7 must-visit places with brief descriptions.

3. **Best Time to Visit**: When to go for optimal weather, fewer crowds, or special events.

4. **Safety Tips**: 3-4 practical safety tips for tourists.

5. **Getting Around**: Transportation options (metro, taxis, walking, bikes, etc.)

6. **Local Tips**: Insider tips that tourists should know.

Return ONLY valid JSON with this structure, no markdown:
{
  "description": "Your comprehensive city overview (800-1000 words, use natural paragraphs)...",
  "attractions": ["Attraction 1 - brief description", "Attraction 2 - brief description", ...],
  "best_time_to_visit": "Detailed best time info (2-3 sentences)",
  "safety_tips": "Detailed safety information (3-4 tips in paragraph form)",
  "getting_around": "Transportation guide (3-4 sentences covering options)",
  "latitude": 40.7128,
  "longitude": -74.0060
}`;

      const startTime = Date.now();
      const entityName = `${cityName}, ${countryName}`;
      let response;
      try {
        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a professional travel writer with deep knowledge of cities worldwide. Write engaging, helpful content for tourists. Use a friendly, conversational tone. Avoid generic phrases - be specific and helpful. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        });

        if (!response.ok) {
          await logApiCall(supabase, 'city_content_enhanced', entityName, 'error', startTime, undefined, `DeepSeek API error: ${response.status}`);
          throw new Error(`DeepSeek API error: ${response.status}`);
        }
      } catch (fetchError) {
        await logApiCall(supabase, 'city_content_enhanced', entityName, 'error', startTime, undefined, fetchError.message);
        throw fetchError;
      }

      const data = await response.json();
      const usage = data.usage || {};
      let content = data.choices[0]?.message?.content || '{}';
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let cityContent;
      try {
        cityContent = JSON.parse(content);
        await logApiCall(
          supabase,
          'city_content_enhanced',
          entityName,
          'success',
          startTime,
          usage.total_tokens,
          undefined,
          usage.prompt_tokens,
          usage.completion_tokens
        );
      } catch (e) {
        console.error('Failed to parse city content JSON:', e);
        await logApiCall(supabase, 'city_content_enhanced', entityName, 'error', startTime, usage.total_tokens, 'Failed to parse JSON response', usage.prompt_tokens, usage.completion_tokens);
        return new Response(JSON.stringify({ error: 'Failed to parse content' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: updateError } = await supabase
        .from('cities')
        .update({
          description: cityContent.description,
          attractions: cityContent.attractions || [],
          best_time_to_visit: cityContent.best_time_to_visit,
          safety_tips: cityContent.safety_tips,
          getting_around: cityContent.getting_around,
          latitude: cityContent.latitude,
          longitude: cityContent.longitude,
          meta_description: `Discover ${cityName}, ${countryName}. ${cityContent.description?.substring(0, 120)}...`,
        })
        .eq('id', cityId);

      if (updateError) {
        throw updateError;
      }

      console.log(`Updated enhanced content for ${cityName}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Updated enhanced content for ${cityName}`,
        content: cityContent
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-city-content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
