import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PageRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

function parseSlug(slug: string): { from: string; to: string } | null {
  // Accept "visa-requirements/x-to-y" OR "x-to-y-visa-requirements"
  let core = slug.replace(/^visa-requirements\//, "").replace(/-visa-requirements$/, "");
  const idx = core.indexOf("-to-");
  if (idx === -1) return null;
  return { from: core.slice(0, idx), to: core.slice(idx + 4) };
}

function buildPrompt(args: {
  from: { name: string; slug: string; code: string };
  to: { name: string; slug: string; code: string; capital?: string | null };
  visa: any;
  processing: any[];
  authorName: string;
}): string {
  const { from, to, visa, processing, authorName } = args;
  const visaType = visa?.requirement_type?.replace(/_/g, " ") || "varies by purpose";
  const fee = visa?.fee_usd ? `$${visa.fee_usd} USD` : "varies";
  const procDays = visa?.processing_time_days ? `${visa.processing_time_days} business days` : "varies";
  const stay = visa?.max_stay_days ? `${visa.max_stay_days} days` : "varies";

  const ptLines = processing.length
    ? processing
        .map(
          (p) =>
            `- ${p.visa_type}: ${p.processing_time_days} days${p.embassy_location ? ` (via ${p.embassy_location})` : ""}${p.source ? ` [source: ${p.source}]` : ""}`,
        )
        .join("\n")
    : "- No third-party data on file; rely on official channels only.";

  return `You are ${authorName}, a senior visa journalist. You are rewriting a corridor-specific page that Google currently sees as a near-duplicate of 38,000 other visa pages. Your job is to make THIS page about ${from.name} → ${to.name} feel unmistakably unique with corridor-only signals that no template could fake.

NON-NEGOTIABLE RULES:
1. Write 850–1100 words of flowing prose. No filler.
2. Reference the SPECIFIC corridor at least 6 times — name both countries together, mention typical traveler profiles (e.g. ${from.name} business travelers, students, tourists going to ${to.name}'s key cities).
3. Include these UNIQUE structured signals — at least 4 of them must be visible:
   a) "Where to apply" — embassy or consulate context: name the ${to.name} embassy/consulate located in or nearest to ${from.name}. If unknown, name the typical regional hub (e.g. ${to.capital || to.name} embassy if no presence). Be specific.
   b) "Fee table" — a small <table> with columns "Item / Cost / Notes". Include the visa fee (${fee}), typical service/biometrics fee, and one corridor-specific cost (courier, translation, apostille).
   c) "Realistic timeline" — break ${procDays} into stages (document gathering, appointment wait, processing, passport return).
   d) "If denied / alternatives" — what ${from.name} citizens typically do next: ETA, transit visa, third-country routing, or appealing.
   e) "Common mistakes on this corridor" — 2 specific pitfalls ${from.name} applicants make when applying for ${to.name}.
   f) "Two FAQs unique to ${from.name}→${to.name}" — questions that would only matter on this exact corridor.
4. Write in YOUR voice — contractions, "I've checked", "what I keep seeing", em-dashes—like this. Vary sentence rhythm.
5. FORBIDDEN: "It is important to note", "Furthermore", "Additionally", "In conclusion", "It should be noted", generic "always check with the embassy" closers.
6. End with a single-sentence source line: "Last verified against official ${to.name} immigration sources, ${new Date().getFullYear()}."

KNOWN DATA (use exactly, do not invent contradicting numbers):
- Requirement: ${visaType}
- Fee: ${fee}
- Processing: ${procDays}
- Max stay: ${stay}
- Country codes: ${from.code} → ${to.code}
${visa?.notes ? `- Official notes: ${visa.notes}` : ""}

THIRD-PARTY PROCESSING DATA ON FILE:
${ptLines}

OUTPUT: Clean semantic HTML. Use <h2>, <h3>, <p>, ONE <table> with <thead>/<tbody>, occasional <strong>. No <html>/<head>/<body> wrappers. No code fences.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(25, Math.max(1, Number(body.limit) || 5));
    const dryRun = !!body.dryRun;
    // Strategy: pick pages whose updated_at is oldest AND content doesn't yet contain the differentiation marker
    const MARKER = "data-differentiated=\"v1\"";

    const { data: pages, error: pagesErr } = await supabase
      .from("content_pages")
      .select("id, slug, title, content, updated_at")
      .or("slug.like.visa-requirements/%,slug.like.%-to-%-visa-requirements")
      .not("content", "ilike", `%${MARKER}%`)
      .eq("is_published", true)
      .order("updated_at", { ascending: true })
      .limit(limit);

    if (pagesErr) throw pagesErr;

    const { count: remaining } = await supabase
      .from("content_pages")
      .select("id", { count: "exact", head: true })
      .or("slug.like.visa-requirements/%,slug.like.%-to-%-visa-requirements")
      .not("content", "ilike", `%${MARKER}%`)
      .eq("is_published", true);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          wouldEnrich: (pages ?? []).map((p: PageRow) => p.slug),
          remaining: remaining ?? 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // API key
    const { data: settings } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "deepseek_api_key")
      .single();
    let apiKey: string | undefined;
    if (settings?.setting_value && typeof settings.setting_value === "object") {
      apiKey = (settings.setting_value as any).key;
    }
    if (!apiKey) apiKey = Deno.env.get("DEEPSEEK_API_KEY") ?? undefined;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY missing");

    const { data: authors } = await supabase
      .from("authors")
      .select("id, name")
      .eq("is_active", true);
    const pickAuthor = () =>
      authors && authors.length
        ? authors[Math.floor(Math.random() * authors.length)]
        : { id: null, name: "Visas.Guide Editorial" };

    const results: any[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const page of (pages ?? []) as PageRow[]) {
      const parsed = parseSlug(page.slug);
      if (!parsed) {
        results.push({ id: page.id, slug: page.slug, status: "err", error: "unparseable slug" });
        failed++;
        continue;
      }

      try {
        const { data: countries } = await supabase
          .from("countries")
          .select("id, name, slug, code, capital")
          .in("slug", [parsed.from, parsed.to]);
        const from = countries?.find((c) => c.slug === parsed.from);
        const to = countries?.find((c) => c.slug === parsed.to);
        if (!from || !to) throw new Error("countries not found");

        const { data: visa } = await supabase
          .from("visa_requirements")
          .select("*")
          .eq("from_country_id", from.id)
          .eq("to_country_id", to.id)
          .maybeSingle();

        const { data: processing } = await supabase
          .from("processing_times")
          .select("visa_type, processing_time_days, embassy_location, source")
          .eq("country_id", to.id)
          .limit(8);

        const author = pickAuthor();
        const prompt = buildPrompt({
          from,
          to,
          visa,
          processing: processing ?? [],
          authorName: author.name,
        });

        const start = Date.now();
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60_000);
        const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `You are ${author.name}, a visa expert writing differentiated corridor-specific content. Every page must look unique even when neighboring pages share a template.`,
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 2400,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(t);

        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`deepseek ${resp.status}: ${txt.slice(0, 180)}`);
        }
        const data = await resp.json();
        let html = data.choices?.[0]?.message?.content ?? "";
        html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();
        // Mark as differentiated so we don't re-run it
        const wrapped = `<div ${MARKER} data-corridor="${from.slug}-to-${to.slug}">\n${html}\n</div>`;
        const wordCount = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

        const { error: upErr } = await supabase
          .from("content_pages")
          .update({
            content: wrapped,
            updated_at: new Date().toISOString(),
            writer_id: author.id || null,
          })
          .eq("id", page.id);
        if (upErr) throw upErr;

        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          endpoint: "https://api.deepseek.com/v1/chat/completions",
          task_type: "visa_page_differentiation",
          entity_name: page.slug,
          status: "success",
          response_time_ms: Date.now() - start,
          tokens_used: data.usage?.total_tokens,
          input_tokens: data.usage?.prompt_tokens,
          output_tokens: data.usage?.completion_tokens,
        });

        results.push({ id: page.id, slug: page.slug, status: "ok", words: wordCount });
        succeeded++;
      } catch (e: any) {
        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          task_type: "visa_page_differentiation",
          entity_name: page.slug,
          status: "error",
          error_message: e?.message?.slice(0, 500),
        });
        results.push({ id: page.id, slug: page.slug, status: "err", error: e?.message });
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        processed: (pages ?? []).length,
        succeeded,
        failed,
        remaining: Math.max(0, (remaining ?? 0) - succeeded),
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
