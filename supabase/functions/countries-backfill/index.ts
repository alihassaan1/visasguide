// Deno Deploy / Supabase Edge Function: Backfill missing country details
// Fetches data from REST Countries API and updates missing fields in public.countries

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

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
  const url = new URL(req.url);
  const dry = url.searchParams.get("dryRun") === "true";

  try {
    // 1) Load countries needing backfill
    const { data: countries, error: cErr } = await supabase
      .from("countries")
      .select("id, name, code, slug, flag_emoji, capital, currency, continent, region, language, passport_rank, visa_free_destinations, passport_score")
      .or("flag_emoji.is.null,capital.is.null,currency.is.null,continent.is.null,region.is.null,language.is.null");
    if (cErr) throw cErr;

    if (!countries || countries.length === 0) {
      return new Response(JSON.stringify({ updated: 0, message: "No missing fields detected." }), {
        headers: { "content-type": "application/json" },
      });
    }

    // 2) Fetch reference data
    const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,subregion,continents,languages,currencies,flag");
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

      const patch: any = { id: c.id };

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
        const langs = refC.languages ? Object.values(refC.languages) as string[] : [];
        patch.language = langs[0] || null;
      }

      // Only add if something to update
      const keys = Object.keys(patch);
      if (keys.length > 1) {
        updates.push(patch);
      }
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ updated: 0, message: "Nothing to update." }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (dry) {
      return new Response(JSON.stringify({ to_update: updates.length, sample: updates.slice(0, 5) }), {
        headers: { "content-type": "application/json" },
      });
    }

    // 3) Batch update (chunked)
    const chunkSize = 200;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      const { error: uErr } = await supabase.from("countries").upsert(chunk, { onConflict: "id" });
      if (uErr) throw uErr;
      updated += chunk.length;
    }

    return new Response(JSON.stringify({ updated, total_missing: countries.length }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
