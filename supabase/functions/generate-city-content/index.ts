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
    const { cityId, cityName, countryName, countryId, generateCities } = await req.json();

    console.log('Generate city content request:', { cityId, cityName, countryName, countryId, generateCities });

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
2. A brief description (2-3 sentences about why tourists visit)
3. Top 5 attractions/places to visit
4. Approximate population
5. Whether it's the capital city (true/false)

Return ONLY a valid JSON array with this exact structure, no markdown:
[
  {
    "name": "City Name",
    "description": "Brief description",
    "attractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
    "population": 1000000,
    "is_capital": false
  }
]`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a travel expert. Always respond with valid JSON only, no markdown formatting.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '[]';
      
      // Clean up the response
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('DeepSeek response:', content);

      let cities;
      try {
        cities = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse cities JSON:', e);
        return new Response(JSON.stringify({ error: 'Failed to parse city data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert cities into database
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
            meta_title: `${city.name}, ${countryName} - Tours & Activities`,
            meta_description: `Discover the best tours, activities, and things to do in ${city.name}, ${countryName}. ${city.description}`,
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

    // If cityId is provided, update a single city's content
    if (cityId && cityName && countryName) {
      console.log(`Generating content for ${cityName}, ${countryName}`);
      
      const prompt = `Write a compelling 2-3 paragraph description of ${cityName}, ${countryName} for tourists. 
Include:
- What makes the city special for visitors
- Key highlights and experiences
- Best time to visit
- Cultural aspects

Also list the top 5 must-visit attractions.

Return ONLY valid JSON with this structure, no markdown:
{
  "description": "Your description here...",
  "attractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"]
}`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a travel expert. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '{}';
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let cityContent;
      try {
        cityContent = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse city content JSON:', e);
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
          meta_description: `Discover ${cityName}, ${countryName}. ${cityContent.description?.substring(0, 120)}...`,
        })
        .eq('id', cityId);

      if (updateError) {
        throw updateError;
      }

      console.log(`Updated content for ${cityName}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Updated content for ${cityName}`
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
