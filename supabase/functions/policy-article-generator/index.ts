// Generates SEO article from a visa_policy_changes row and links it back
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const TYPE_LABELS: Record<string, string> = {
  visa_free_added: "Visa-Free Access Granted",
  visa_free_removed: "Visa-Free Access Revoked",
  evisa_launched: "eVisa Launched",
  fee_change: "Visa Fee Update",
  processing_time_change: "Processing Time Update",
  entry_ban: "Entry Ban Imposed",
  requirement_change: "Visa Requirement Change",
  policy_announcement: "Visa Policy Announcement",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function generateArticle(change: any, countryName: string) {
  const prompt = `Write a 600-900 word SEO-optimized news article about this visa policy change.

Country: ${countryName}
Change type: ${TYPE_LABELS[change.change_type]}
Summary: ${change.summary}
Effective date: ${change.effective_date || "Not specified"}
Source: ${change.source_name || "Official announcement"}
Source URL: ${change.source_url || ""}

Background context:
${change.full_description?.slice(0, 2000) || change.summary}

Requirements:
- Start with a compelling lead paragraph (who, what, when, why it matters).
- Use H2 subheadings: "What Changed", "Who Is Affected", "Effective Date & Timeline", "What Travelers Should Do", "Background".
- End with 3-4 FAQ entries as H3s with concise answers.
- Cite the source at the end.
- Tone: authoritative, journalistic, concise.
- Output clean HTML (no <html>/<body>, just content tags: <p>, <h2>, <h3>, <ul>, <li>, <a>).
- Do NOT include any <script> or JSON-LD tags.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert immigration journalist writing for visas.guide. Output clean HTML only." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const { policy_change_id } = body;
    if (!policy_change_id) {
      return new Response(JSON.stringify({ error: "policy_change_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: change, error } = await supabase
      .from("visa_policy_changes")
      .select("*, countries(name, slug)")
      .eq("id", policy_change_id)
      .single();
    if (error || !change) throw error || new Error("Not found");
    if (change.news_article_id) {
      return new Response(JSON.stringify({ ok: true, skipped: "already_has_article" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const countryName = (change as any).countries?.name || "Global";
    const countrySlug = (change as any).countries?.slug || "global";
    const dateStr = change.effective_date || change.announcement_date;
    const slug = slugify(`${countrySlug}-visa-policy-${dateStr}-${change.title}`);
    const title = `${countryName} ${TYPE_LABELS[change.change_type]}: ${change.title}`;
    const content = await generateArticle(change, countryName);
    const seoDescription = change.summary.slice(0, 155);

    const isAutoPublish = change.severity === "info" || change.severity === "update";
    const publishedAt = isAutoPublish ? new Date().toISOString() : null;

    const { data: article, error: artErr } = await supabase
      .from("news_articles")
      .insert({
        slug,
        title,
        content,
        excerpt: change.summary,
        seo_title: title.slice(0, 60),
        seo_description: seoDescription,
        ai_generated: true,
        source_type: "ai_generated",
        source_url: change.source_url,
        source_name: change.source_name,
        status: isAutoPublish ? "published" : "draft",
        published_at: publishedAt,
        tags: ["visa policy", "policy update", countryName].filter(Boolean),
        categories: ["Policy Updates"],
      })
      .select("id, slug")
      .single();
    if (artErr) throw artErr;

    await supabase
      .from("visa_policy_changes")
      .update({
        news_article_id: article.id,
        is_published: isAutoPublish,
        published_at: publishedAt,
      })
      .eq("id", policy_change_id);

    if (isAutoPublish) {
      fetch(`${SUPABASE_URL}/functions/v1/auto-indexnow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [`https://visas.guide/blog/${article.slug}`, `https://visas.guide/policy-updates`] }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true, article_id: article.id, slug: article.slug, published: isAutoPublish }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
