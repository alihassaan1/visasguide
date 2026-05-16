// Batch-enrich cities with thin or missing descriptions via DeepSeek.
// Picks cities with description IS NULL OR length(description) < 600 and rewrites
// them with the same prompt used by generate-city-content's enhancedContent path.
//
// POST body: { limit?: number (default 10, max 25), dryRun?: boolean }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_API_KEY");

async function enrichOne(supabase: any, city: any) {
  const cityName = city.name;
  const countryName = city.country_name;
  const prompt = `Write a comprehensive travel guide for ${cityName}, ${countryName}. 800-1000 words covering:

1. City Overview (3-4 paragraphs): what makes it special, history, culture, atmosphere, why tourists love visiting.
2. Top Attractions: 5-7 must-visit places with brief descriptions.
3. Best Time to Visit: weather, crowds, special events.
4. Safety Tips: 3-4 practical tips.
5. Getting Around: transportation options.
6. Local Tips: insider knowledge.

Return ONLY valid JSON, no markdown:
{
  "description": "800-1000 word overview with natural paragraphs",
  "attractions": ["Name - brief desc", ...],
  "best_time_to_visit": "2-3 sentences",
  "safety_tips": "3-4 tips in paragraph form",
  "getting_around": "3-4 sentences",
  "latitude": 0.0,
  "longitude": 0.0
}`;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional travel writer. Specific, helpful, conversational. Avoid generic phrases like 'In conclusion'. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content || "{}";
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(content);

  const { error } = await supabase
    .from("cities")
    .update({
      description: parsed.description,
      attractions: parsed.attractions || city.attractions || [],
      best_time_to_visit: parsed.best_time_to_visit ?? city.best_time_to_visit,
      safety_tips: parsed.safety_tips ?? city.safety_tips,
      getting_around: parsed.getting_around ?? city.getting_around,
      latitude: parsed.latitude ?? city.latitude,
      longitude: parsed.longitude ?? city.longitude,
      meta_description: `Discover ${cityName}, ${countryName}. ${(parsed.description || "").substring(0, 120)}...`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", city.id);

  if (error) throw error;

  await supabase.from("api_logs").insert({
    api_provider: "deepseek",
    endpoint: "https://api.deepseek.com/chat/completions",
    task_type: "city_enrichment_batch",
    entity_name: `${cityName}, ${countryName}`,
    status: "success",
    tokens_used: data.usage?.total_tokens,
    input_tokens: data.usage?.prompt_tokens,
    output_tokens: data.usage?.completion_tokens,
  });

  return { id: city.id, name: cityName, words: (parsed.description || "").split(/\s+/).length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!DEEPSEEK_KEY) throw new Error("DEEPSEEK_API_KEY not configured");
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 25);
    const dryRun = !!body.dryRun;

    // Find thin cities, oldest-updated first so we round-robin
    const { data: cities, error } = await supabase
      .from("cities")
      .select("id, name, country_id, description, attractions, best_time_to_visit, safety_tips, getting_around, latitude, longitude, updated_at")
      .order("updated_at", { ascending: true })
      .limit(500);

    if (error) throw error;

    const thin = (cities || []).filter((c: any) => !c.description || c.description.length < 600);
    const targets = thin.slice(0, limit);

    if (targets.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No thin cities found", remaining: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve country names in one shot
    const countryIds = [...new Set(targets.map((c: any) => c.country_id))];
    const { data: countries } = await supabase.from("countries").select("id, name").in("id", countryIds);
    const countryMap = new Map((countries || []).map((c: any) => [c.id, c.name]));
    for (const t of targets) (t as any).country_name = countryMap.get(t.country_id) || "Unknown";

    if (dryRun) {
      return new Response(JSON.stringify({
        ok: true, dryRun: true, remaining: thin.length,
        wouldEnrich: targets.map((t: any) => `${t.name}, ${t.country_name}`),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    let succeeded = 0, failed = 0;

    for (const city of targets) {
      try {
        const r = await enrichOne(supabase, city);
        succeeded++;
        results.push({ ...r, status: "ok" });
      } catch (e: any) {
        failed++;
        results.push({ id: city.id, name: city.name, status: "error", error: String(e?.message || e).slice(0, 200) });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: targets.length,
      succeeded,
      failed,
      remaining: Math.max(0, thin.length - succeeded),
      results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("enrich-thin-cities error:", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
