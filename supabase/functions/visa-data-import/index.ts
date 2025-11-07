import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source, from_country_code } = await req.json();

    if (source === 'passport-index') {
      return await importFromPassportIndex(supabase, from_country_code);
    } else if (source === 'travel-buddy') {
      const rapidApiKey = Deno.env.get('TRAVELBUDDY_API_KEY');
      if (!rapidApiKey) {
        return new Response(
          JSON.stringify({ error: 'TRAVELBUDDY_API_KEY not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return await importFromTravelBuddy(supabase, rapidApiKey, from_country_code);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid source. Use "passport-index" or "travel-buddy"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function importFromPassportIndex(supabase: any, fromCountryCodeFilter?: string) {
  console.log('Importing from Passport Index Dataset...', fromCountryCodeFilter ? `for ${fromCountryCodeFilter}` : 'for all countries');
  
  // Fetch the CSV from GitHub
  const response = await fetch(
    'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-matrix.csv'
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch passport index data');
  }

  const csvText = await response.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Get all countries from database
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, code');

  const countryMap = new Map(countries.map((c: any) => [c.code, c]));
  
  let importedCount = 0;
  let skippedCount = 0;

  // Process each row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    const fromCountryCode = values[0];
    
    // Skip if filtering by country and this isn't the one
    if (fromCountryCodeFilter && fromCountryCode !== fromCountryCodeFilter) {
      continue;
    }
    
    const fromCountry = countryMap.get(fromCountryCode);
    
    if (!fromCountry) {
      console.log(`Skipping unknown country: ${fromCountryCode}`);
      skippedCount++;
      continue;
    }

    // Process each destination (starting from column 1)
    for (let j = 1; j < values.length && j < headers.length; j++) {
      const toCountryCode = headers[j];
      const toCountry = countryMap.get(toCountryCode);
      const value = values[j];

      if (!toCountry || !value || value === '-1') continue;

      // Map visa requirement codes to types
      let requirementType = 'visa_required';
      let maxStayDays: number | null = null;

      if (value === '3') {
        requirementType = 'visa_free';
        maxStayDays = 90; // Default assumption
      } else if (value === '2') {
        requirementType = 'e_visa';
        maxStayDays = 90;
      } else if (value === '1') {
        requirementType = 'visa_on_arrival';
        maxStayDays = 30;
      } else if (value === '0') {
        requirementType = 'visa_required';
      }

      // Check if requirement already exists
      const { data: existing } = await supabase
        .from('visa_requirements')
        .select('id')
        .eq('from_country_id', fromCountry.id)
        .eq('to_country_id', toCountry.id)
        .maybeSingle();

      if (existing) continue; // Skip if already exists

      // Insert new requirement
      const { error } = await supabase
        .from('visa_requirements')
        .insert({
          from_country_id: fromCountry.id,
          to_country_id: toCountry.id,
          requirement_type: requirementType,
          max_stay_days: maxStayDays,
          notes: 'Imported from Passport Index Dataset'
        });

      if (error) {
        console.error(`Error inserting ${fromCountryCode} -> ${toCountryCode}:`, error);
        skippedCount++;
      } else {
        importedCount++;
      }
    }
  }

  console.log(`Import complete. Imported: ${importedCount}, Skipped: ${skippedCount}`);

  return new Response(
    JSON.stringify({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      source: 'passport-index'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function importFromTravelBuddy(supabase: any, rapidApiKey: string, fromCountryCodeFilter?: string) {
  console.log('Importing from Travel Buddy AI API...', fromCountryCodeFilter ? `for ${fromCountryCodeFilter}` : 'for all countries');
  
  // Get all countries from database
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name, code');

  // Filter source countries if specified
  const sourceCountries = fromCountryCodeFilter 
    ? countries.filter((c: any) => c.code === fromCountryCodeFilter)
    : countries;

  if (fromCountryCodeFilter && sourceCountries.length === 0) {
    return new Response(
      JSON.stringify({ error: `Country with code ${fromCountryCodeFilter} not found` }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const apiHeaders = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': 'visa-requirement.p.rapidapi.com'
  };

  // Retry helper with exponential backoff to avoid 429 rate limits
  const fetchWithRetry = async (passport: string, destination: string) => {
    let attempt = 0;
    let delayMs = 800; // start conservative

    while (attempt < 5) {
      const res = await fetch('https://visa-requirement.p.rapidapi.com/v2/visa/check', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ passport, destination })
      });

      if (res.ok) return res;

      // Retry on 429 or server errors
      if (res.status === 429 || res.status >= 500) {
        attempt++;
        const retryAfter = parseInt(res.headers.get('retry-after') || '0', 10);
        const wait = retryAfter ? retryAfter * 1000 : delayMs;
        await new Promise((r) => setTimeout(r, wait));
        delayMs = Math.min(8000, Math.floor(delayMs * 1.8));
        continue;
      }

      // Non-retryable error
      return res;
    }

    // Exhausted retries
    return new Response(null, { status: 429, statusText: 'Too Many Requests' });
  };
  for (const fromCountry of sourceCountries) {
    for (const toCountry of countries) {
      if (fromCountry.id === toCountry.id) continue; // Skip same country

      try {
        // Check if requirement already exists
        const { data: existing } = await supabase
          .from('visa_requirements')
          .select('id')
          .eq('from_country_id', fromCountry.id)
          .eq('to_country_id', toCountry.id)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          continue;
        }

        // Call Travel Buddy API with retry/backoff
        const response = await fetchWithRetry(fromCountry.code, toCountry.code);

        if (!response.ok) {
          console.error(`API error for ${fromCountry.code} -> ${toCountry.code}: ${response.status}`);
          errorCount++;
          continue;
        }

        const apiData = await response.json();
        const data = apiData.data;

        // Map visa rule to requirement type
        let requirementType = 'visa_required';
        const primaryRule = data.visa_rules?.primary_rule?.name?.toLowerCase() || '';
        
        if (primaryRule.includes('visa free') || primaryRule.includes('visa-free')) {
          requirementType = 'visa_free';
        } else if (primaryRule.includes('visa on arrival')) {
          requirementType = 'visa_on_arrival';
        } else if (primaryRule.includes('evisa') || primaryRule.includes('eta')) {
          requirementType = 'e_visa';
        }

        // Parse duration
        const duration = data.visa_rules?.primary_rule?.duration || data.visa_rules?.secondary_rule?.duration;
        let maxStayDays = null;
        if (duration) {
          const match = duration.match(/(\d+)\s*days?/i);
          if (match) {
            maxStayDays = parseInt(match[1]);
          }
        }

        // Extract requirements
        const requirements = [];
        if (data.destination?.passport_validity) {
          requirements.push(`Passport valid for ${data.destination.passport_validity}`);
        }

        // Insert visa requirement
        const { error } = await supabase
          .from('visa_requirements')
          .insert({
            from_country_id: fromCountry.id,
            to_country_id: toCountry.id,
            requirement_type: requirementType,
            max_stay_days: maxStayDays,
            requirements,
            notes: data.visa_rules?.secondary_rule?.name || null
          });

        if (error) {
          console.error(`Error inserting ${fromCountry.code} -> ${toCountry.code}:`, error);
          errorCount++;
        } else {
          importedCount++;
        }

        // Rate limiting - wait between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`Error processing ${fromCountry.code} -> ${toCountry.code}:`, error);
        errorCount++;
      }
    }
  }

  console.log(`Import complete. Imported: ${importedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

  return new Response(
    JSON.stringify({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      errors: errorCount,
      source: 'travel-buddy'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
