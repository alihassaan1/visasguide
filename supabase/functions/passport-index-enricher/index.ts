import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get DeepSeek API key from site_settings (same pattern as other working functions)
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "deepseek_api_key")
      .single();

    const deepseekApiKey = settingsData?.setting_value;
    
    if (!deepseekApiKey) {
      throw new Error("DeepSeek API key not configured in site_settings");
    }

    const { batchSize = 10 } = await req.json().catch(() => ({}));

    // Fetch countries missing passport data
    const { data: countries, error: fetchError } = await supabase
      .from("countries")
      .select("id, name, code, passport_rank, passport_score, visa_free_destinations")
      .or("passport_rank.is.null,visa_free_destinations.is.null,visa_free_destinations.eq.0")
      .order("name")
      .limit(batchSize);

    if (fetchError) {
      console.error("Error fetching countries:", fetchError);
      throw fetchError;
    }

    if (!countries || countries.length === 0) {
      return new Response(
        JSON.stringify({ message: "All countries have passport data", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${countries.length} countries for passport index data`);

    const results: any[] = [];

    for (const country of countries) {
      try {
        console.log(`Enriching passport data for: ${country.name}`);

        const prompt = `You are a travel and visa expert. Provide accurate passport index data for ${country.name} as of 2024-2025.

Return ONLY a valid JSON object with these exact fields (numbers only, no text):
{
  "passport_rank": <number 1-199 based on global passport strength>,
  "passport_score": <number, total destinations accessible without advance visa>,
  "visa_free_destinations": <number of countries allowing visa-free entry>
}

Use real 2024-2025 passport index data from sources like Henley Passport Index. Be accurate.`;

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${deepseekApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "You are a visa and travel data expert. Return only valid JSON, no markdown or explanations." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`DeepSeek API error for ${country.name}:`, response.status, errorText);
          
          if (response.status === 429) {
            console.log("Rate limited, waiting 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        console.log(`Raw response for ${country.name}:`, content);

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`No JSON found for ${country.name}:`, content);
          continue;
        }

        const passportData = JSON.parse(jsonMatch[0]);
        console.log(`Parsed data for ${country.name}:`, passportData);

        // Update country with passport data
        const { error: updateError } = await supabase
          .from("countries")
          .update({
            passport_rank: Number(passportData.passport_rank) || country.passport_rank,
            passport_score: Number(passportData.passport_score) || country.passport_score,
            visa_free_destinations: Number(passportData.visa_free_destinations) || 0,
          })
          .eq("id", country.id);

        if (updateError) {
          console.error(`Error updating ${country.name}:`, updateError);
          continue;
        }

        results.push({
          country: country.name,
          success: true,
          data: passportData,
        });

        // Log to api_logs
        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          task_type: "passport_index_enrichment",
          entity_name: country.name,
          status: "success",
          tokens_used: data.usage?.total_tokens || 0,
          input_tokens: data.usage?.prompt_tokens || 0,
          output_tokens: data.usage?.completion_tokens || 0,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.error(`Error processing ${country.name}:`, err);
        results.push({
          country: country.name,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        message: `Processed ${countries.length} countries`,
        successful: successCount,
        failed: results.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Passport index enricher error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
