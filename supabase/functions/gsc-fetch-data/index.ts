// Google Search Console sync via Lovable connector gateway.
// Actions:
//   - test:        list verified sites for the connection
//   - sync:        pull last 30 days of searchanalytics (page+query) → gsc_search_performance
//   - inspect:     URL Inspection API → gsc_url_index_status (batched, capped)
//   - inspect-all: queue all public URLs from sitemap data for inspection (throttled)
//
// Site URL is read from site_settings.gsc_credentials.site_url, falling back to
// the first verified property returned by the gateway.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function gwHeaders(extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GSC_KEY,
    ...extra,
  };
}

async function gw(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gwHeaders(init.headers as any), ...(init.body ? { "Content-Type": "application/json" } : {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`GSC ${path} ${res.status}: ${text.slice(0, 500)}`);
  return json;
}

async function resolveSiteUrl(supabase: any): Promise<string> {
  const { data } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "gsc_credentials")
    .maybeSingle();
  const stored = (data?.setting_value as any)?.site_url;
  if (stored) return stored;
  const sites = await gw("/webmasters/v3/sites");
  const verified = (sites.siteEntry || []).find((s: any) => s.permissionLevel && s.permissionLevel !== "siteUnverifiedUser");
  if (!verified) throw new Error("No verified GSC sites found. Verify a property first.");
  return verified.siteUrl;
}

async function actionTest() {
  const sites = await gw("/webmasters/v3/sites");
  return { ok: true, sites: sites.siteEntry || [] };
}

async function actionSync(supabase: any) {
  const siteUrl = await resolveSiteUrl(supabase);
  const { data: logRow } = await supabase
    .from("gsc_sync_log")
    .insert({ sync_type: "manual", status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id;

  try {
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const encoded = encodeURIComponent(siteUrl);

    let totalFetched = 0;
    let totalInserted = 0;
    let startRow = 0;
    const ROW_LIMIT = 25000;
    const MAX_PAGES = 4; // up to 100k rows

    for (let page = 0; page < MAX_PAGES; page++) {
      const body = {
        startDate, endDate,
        dimensions: ["date", "page", "query", "device", "country"],
        rowLimit: ROW_LIMIT,
        startRow,
      };
      const res = await gw(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const rows: any[] = res.rows || [];
      if (rows.length === 0) break;
      totalFetched += rows.length;

      const records = rows.map((r) => {
        const [date, pageUrl, query, device, country] = r.keys;
        return {
          page_url: pageUrl,
          page_slug: (() => { try { return new URL(pageUrl).pathname; } catch { return null; } })(),
          query,
          date,
          device,
          country,
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: r.ctr || 0,
          avg_position: r.position || 0,
        };
      });

      // Chunked insert
      const CHUNK = 1000;
      for (let i = 0; i < records.length; i += CHUNK) {
        const slice = records.slice(i, i + CHUNK);
        const { error } = await supabase.from("gsc_search_performance").insert(slice);
        if (error) throw error;
        totalInserted += slice.length;
      }

      if (rows.length < ROW_LIMIT) break;
      startRow += ROW_LIMIT;
    }

    await supabase.from("gsc_sync_log").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      rows_fetched: totalFetched,
      rows_inserted: totalInserted,
    }).eq("id", logId);

    return { ok: true, siteUrl, rowsFetched: totalFetched, rowsInserted: totalInserted };
  } catch (e: any) {
    await supabase.from("gsc_sync_log").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: String(e?.message || e),
    }).eq("id", logId);
    throw e;
  }
}

async function inspectOne(siteUrl: string, urlToInspect: string) {
  const json = await gw(`/v1/urlInspection/index:inspect`, {
    method: "POST",
    body: JSON.stringify({ inspectionUrl: urlToInspect, siteUrl }),
  });
  return json?.inspectionResult || null;
}

async function actionInspect(supabase: any, urls: string[], limit = 100) {
  const siteUrl = await resolveSiteUrl(supabase);
  const targets = urls.slice(0, limit);
  const results: any[] = [];
  let ok = 0, failed = 0;

  for (const u of targets) {
    try {
      const r = await inspectOne(siteUrl, u);
      const idx = r?.indexStatusResult || {};
      const record = {
        page_url: u,
        verdict: idx.verdict ?? null,
        coverage_state: idx.coverageState ?? null,
        indexing_state: idx.indexingState ?? null,
        last_crawl_time: idx.lastCrawlTime ?? null,
        page_fetch_state: idx.pageFetchState ?? null,
        robots_txt_state: idx.robotsTxtState ?? null,
        referring_urls: idx.referringUrls ?? null,
        sitemap: idx.sitemap ?? null,
        google_canonical: idx.googleCanonical ?? null,
        user_canonical: idx.userCanonical ?? null,
        raw_response: r,
        inspected_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("gsc_url_index_status")
        .upsert(record, { onConflict: "page_url" });
      if (error) throw error;
      ok++;
      results.push({ url: u, verdict: record.verdict, coverage: record.coverage_state });
    } catch (e: any) {
      failed++;
      results.push({ url: u, error: String(e?.message || e).slice(0, 200) });
    }
    // Gentle pacing: 600ms between requests (~100/min, well under 2k/day quota planning)
    await new Promise((r) => setTimeout(r, 600));
  }

  return { ok: true, inspected: ok, failed, total: targets.length, results };
}

// Pull a candidate list of URLs from content tables for inspection.
async function gatherCandidateUrls(supabase: any, limit: number): Promise<string[]> {
  const base = "https://visas.guide";
  const urls: string[] = [];

  // Countries
  const { data: countries } = await supabase.from("countries").select("slug").limit(limit);
  for (const c of countries || []) urls.push(`${base}/${c.slug}`);

  // Cities
  const { data: cities } = await supabase.from("cities").select("slug, country_id").limit(limit);
  if (cities?.length) {
    const ids = [...new Set(cities.map((c: any) => c.country_id))];
    const { data: cs } = await supabase.from("countries").select("id, slug").in("id", ids);
    const map = new Map((cs || []).map((c: any) => [c.id, c.slug]));
    for (const city of cities) {
      const cs2 = map.get(city.country_id);
      if (cs2) urls.push(`${base}/${cs2}/${city.slug}`);
    }
  }

  // Content pages
  const { data: pages } = await supabase
    .from("content_pages")
    .select("slug")
    .eq("is_published", true)
    .limit(limit);
  for (const p of pages || []) urls.push(`${base}/${p.slug}`);

  return [...new Set(urls)].slice(0, limit);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GSC_KEY) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY not configured (connect Google Search Console)");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "test";

    let result: any;
    if (action === "test") result = await actionTest();
    else if (action === "sync") result = await actionSync(supabase);
    else if (action === "inspect") {
      let urls: string[] = body.urls || [];
      if (!urls.length) urls = await gatherCandidateUrls(supabase, body.limit || 50);
      result = await actionInspect(supabase, urls, body.limit || 50);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("gsc-fetch-data error:", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
