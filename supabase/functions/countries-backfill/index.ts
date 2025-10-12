// Deno Deploy / Supabase Edge Function: Backfill missing country details
// Fetches data from REST Countries API and updates missing fields in public.countries

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "", {
  auth: { persistSession: false }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Utility: derive flag emoji from ISO code
function flagFromCode(code?: string) {
  if (!code) return null;
  const cc = code.toUpperCase();
  if (cc.length !== 2) return null;
  try {
    const cps = [...cc].map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...cps);
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("countries-backfill missing env", { hasUrl: !!SUPABASE_URL, hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY });
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment" }),
      { status: 500, headers: { "content-type": "application/json", ...corsHeaders } }
    );
  }

  const url = new URL(req.url);
  const dry = url.searchParams.get("dryRun") === "true";

  try {
    let filterCode: string | null = null;
    let filterId: string | null = null;
    let forceAll: boolean = false;
    try {
      const body = await req.json();
      filterCode = body?.code ?? null;
      filterId = body?.id ?? null;
      forceAll = Boolean(body?.all) || Boolean(body?.forceAll);
    } catch (_) {
      // no body
    }
    filterCode = filterCode ?? url.searchParams.get('code');
    if (!forceAll) {
      forceAll = url.searchParams.get('all') === 'true' || url.searchParams.get('forceAll') === 'true';
    }

    // 1) Load countries needing backfill (optionally limited to one)
    let query = supabase
      .from("countries")
      .select("id, name, code, slug, flag_emoji, capital, currency, continent, region, language, passport_rank, visa_free_destinations, passport_score, population");

    if (filterId) query = query.eq('id', filterId);
    if (filterCode) query = query.eq('code', String(filterCode).toUpperCase());

    if (!filterId && !filterCode && !forceAll) {
      query = query.or("flag_emoji.is.null,capital.is.null,currency.is.null,continent.is.null,region.is.null,language.is.null,population.is.null,visa_free_destinations.is.null");
    }

    const { data: countries, error: cErr } = await query;
    if (cErr) throw new Error(cErr.message || JSON.stringify(cErr));

    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ updated: 0, message: "No countries to update." }), {
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // 2) Fetch reference data
const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,subregion,continents,languages,currencies,flag,population");
if (!resp.ok) {
  const text = await resp.text();
  throw new Error(`restcountries_failed: ${resp.status} ${resp.statusText} - ${text.slice(0, 200)}`);
}
const ref = await resp.json();

    // Index by cca2
    const byCCA2 = new Map<string, any>();
    for (const r of ref) {
      if (r?.cca2) byCCA2.set(String(r.cca2).toUpperCase(), r);
    }

    let updated = 0;
    const updates: any[] = [];

    for (const c of countries) {
      const refC = c.code ? byCCA2.get(String(c.code).toUpperCase()) : null;
      if (!refC) continue;

      const patch: any = { id: c.id, name: c.name, code: c.code, slug: c.slug };
      if (!c.slug && c.name) {
        const slug = String(c.name)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        patch.slug = slug || c.slug;
      }

      if (!c.flag_emoji) {
        patch.flag_emoji = refC.flag || flagFromCode(c.code);
      }
      if (!c.capital) {
        patch.capital = Array.isArray(refC.capital) ? refC.capital[0] : refC.capital || null;
      }
      if (!c.currency) {
        const currKeys = refC.currencies ? Object.keys(refC.currencies) : [];
        patch.currency = currKeys[0] || null;
      }
      if (!c.continent) {
        patch.continent = Array.isArray(refC.continents) ? refC.continents[0] : refC.continents || null;
      }
      if (!c.region) {
        patch.region = refC.subregion || refC.region || null;
      }
      if (!c.language) {
        const langs = refC.languages ? (Object.values(refC.languages) as string[]) : [];
        patch.language = langs[0] || null;
      }
      if (!c.population) {
        patch.population = refC.population ?? null;
      }

      // Compute visa-free destinations if not set
      if (c.visa_free_destinations == null || c.visa_free_destinations === 0) {
        const { count, error: cntErr } = await supabase
          .from('visa_requirements')
          .select('id', { count: 'exact', head: true })
          .eq('from_country_id', c.id)
          .in('requirement_type', ['visa_free', 'visa_on_arrival', 'eTA_required', 'evisa_required']);
        if (!cntErr && typeof count === 'number') {
          patch.visa_free_destinations = count;
        }
      }

      // Only add if something to update
      const keys = Object.keys(patch);
      if (keys.length > 1) {
        updates.push(patch);
      }
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ updated: 0, message: "Nothing to update." }), {
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    if (dry) {
      return new Response(JSON.stringify({ to_update: updates.length, sample: updates.slice(0, 5) }), {
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // 3) Batch update (chunked)
    const chunkSize = 200;
    const errors: string[] = [];
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      const { error: uErr } = await supabase.from("countries").upsert(chunk, { onConflict: "id" });
      if (uErr) {
        // Fallback: try row-by-row to salvage successes
        for (const row of chunk) {
          const { error: rowErr } = await supabase.from("countries").upsert(row, { onConflict: "id" });
          if (rowErr) {
            errors.push(rowErr.message || JSON.stringify(rowErr));
          } else {
            updated += 1;
          }
        }
      } else {
        updated += chunk.length;
      }
    }

    return new Response(JSON.stringify({ updated, total_candidates: countries.length, errors_count: errors.length, errors: errors.slice(0, 5) }), {
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  } catch (e) {
const errPayload = e instanceof Error ? { error: e.message, stack: e.stack } : { error: String(e) };
console.error("countries-backfill error", errPayload);
return new Response(JSON.stringify(errPayload), { status: 500, headers: { "content-type": "application/json", ...corsHeaders } });
  }
});
