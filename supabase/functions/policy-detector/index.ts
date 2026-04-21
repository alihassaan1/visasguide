// Detects visa policy changes from rss_article_queue using Lovable AI
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const EXTRACTION_SCHEMA = {
  name: "extract_visa_policy_change",
  description: "Extract structured visa policy change data from a news article",
  parameters: {
    type: "object",
    properties: {
      is_policy_change: { type: "boolean", description: "True if the article describes a visa/immigration policy change" },
      country_name: { type: "string", description: "The country making the policy change (e.g. 'United Arab Emirates')" },
      affected_countries: { type: "array", items: { type: "string" }, description: "Countries whose citizens are affected. Empty array = all." },
      change_type: {
        type: "string",
        enum: ["visa_free_added","visa_free_removed","evisa_launched","fee_change","processing_time_change","entry_ban","requirement_change","policy_announcement"],
      },
      title: { type: "string", description: "Short SEO-friendly title (max 80 chars)" },
      summary: { type: "string", description: "1-2 sentence summary (max 200 chars)" },
      effective_date: { type: "string", description: "ISO date YYYY-MM-DD if mentioned, else empty string" },
      severity: { type: "string", enum: ["info","update","warning","critical"] },
    },
    required: ["is_policy_change","change_type","title","summary","severity"],
  },
};

async function extractPolicyChange(title: string, content: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert visa policy analyst. Extract structured data only. Return is_policy_change=false for general travel news without a specific government policy change." },
        { role: "user", content: `Title: ${title}\n\nContent: ${content?.slice(0, 4000) || ""}` },
      ],
      tools: [{ type: "function", function: EXTRACTION_SCHEMA }],
      tool_choice: { type: "function", function: { name: "extract_visa_policy_change" } },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return args ? JSON.parse(args) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const results = { processed: 0, detected: 0, errors: 0 };

  try {
    // Pull recent unprocessed queue items that haven't been scanned for policy changes
    const { data: queueItems, error } = await supabase
      .from("rss_article_queue")
      .select("id, original_title, original_content, original_url, source_name, original_pub_date")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    // Get existing rss_queue_ids already detected to avoid dupes
    const ids = (queueItems || []).map((i) => i.id);
    const { data: existing } = await supabase
      .from("visa_policy_changes")
      .select("rss_queue_id")
      .in("rss_queue_id", ids);
    const seen = new Set((existing || []).map((e: any) => e.rss_queue_id));
    const todo = (queueItems || []).filter((i) => !seen.has(i.id));

    // Country lookup
    const { data: countries } = await supabase.from("countries").select("id, name, slug");
    const cmap = new Map((countries || []).map((c: any) => [c.name.toLowerCase(), c]));

    for (const item of todo) {
      results.processed++;
      try {
        const ext = await extractPolicyChange(item.original_title, item.original_content || "");
        if (!ext?.is_policy_change) continue;

        const country = ext.country_name ? cmap.get(ext.country_name.toLowerCase()) : null;
        const affectedIds = (ext.affected_countries || [])
          .map((n: string) => cmap.get(n.toLowerCase())?.id)
          .filter(Boolean);

        const autoVerify = ext.severity === "info" || ext.severity === "update";

        const { data: inserted, error: insErr } = await supabase
          .from("visa_policy_changes")
          .insert({
            country_id: country?.id || null,
            affected_country_ids: affectedIds.length > 0 ? affectedIds : null,
            change_type: ext.change_type,
            title: ext.title,
            summary: ext.summary,
            full_description: item.original_content?.slice(0, 5000) || null,
            effective_date: ext.effective_date || null,
            announcement_date: item.original_pub_date ? item.original_pub_date.split("T")[0] : new Date().toISOString().split("T")[0],
            severity: ext.severity,
            source_url: item.original_url,
            source_name: item.source_name,
            source_type: "news",
            rss_queue_id: item.id,
            is_verified: autoVerify,
            verified_at: autoVerify ? new Date().toISOString() : null,
            is_published: false,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        results.detected++;

        // Trigger article generation for verified ones
        if (autoVerify && inserted) {
          fetch(`${SUPABASE_URL}/functions/v1/policy-article-generator`, {
            method: "POST",
            headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ policy_change_id: inserted.id }),
          }).catch(() => {});
        }
      } catch (e: any) {
        results.errors++;
        console.error("Detection error:", e.message);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
