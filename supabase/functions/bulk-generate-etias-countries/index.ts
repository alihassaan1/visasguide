import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeContentTypography } from "../_shared/contentTypography.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Full ETIAS visa-waiver list (~60 nationalities).
// 5 already seeded (united-states, united-kingdom, canada, australia, japan) are kept here for completeness;
// the function skips any slug that already exists.
const COUNTRIES: Array<{ slug: string; name: string; nationality: string }> = [
  { slug: "albania", name: "Albania", nationality: "Albanian" },
  { slug: "andorra", name: "Andorra", nationality: "Andorran" },
  { slug: "antigua-and-barbuda", name: "Antigua and Barbuda", nationality: "Antiguan" },
  { slug: "argentina", name: "Argentina", nationality: "Argentine" },
  { slug: "australia", name: "Australia", nationality: "Australian" },
  { slug: "bahamas", name: "Bahamas", nationality: "Bahamian" },
  { slug: "barbados", name: "Barbados", nationality: "Barbadian" },
  { slug: "bosnia-and-herzegovina", name: "Bosnia and Herzegovina", nationality: "Bosnian" },
  { slug: "brazil", name: "Brazil", nationality: "Brazilian" },
  { slug: "brunei", name: "Brunei", nationality: "Bruneian" },
  { slug: "canada", name: "Canada", nationality: "Canadian" },
  { slug: "chile", name: "Chile", nationality: "Chilean" },
  { slug: "colombia", name: "Colombia", nationality: "Colombian" },
  { slug: "costa-rica", name: "Costa Rica", nationality: "Costa Rican" },
  { slug: "dominica", name: "Dominica", nationality: "Dominican" },
  { slug: "el-salvador", name: "El Salvador", nationality: "Salvadoran" },
  { slug: "georgia", name: "Georgia", nationality: "Georgian" },
  { slug: "grenada", name: "Grenada", nationality: "Grenadian" },
  { slug: "guatemala", name: "Guatemala", nationality: "Guatemalan" },
  { slug: "honduras", name: "Honduras", nationality: "Honduran" },
  { slug: "hong-kong", name: "Hong Kong", nationality: "Hong Kong SAR" },
  { slug: "israel", name: "Israel", nationality: "Israeli" },
  { slug: "japan", name: "Japan", nationality: "Japanese" },
  { slug: "kiribati", name: "Kiribati", nationality: "I-Kiribati" },
  { slug: "malaysia", name: "Malaysia", nationality: "Malaysian" },
  { slug: "marshall-islands", name: "Marshall Islands", nationality: "Marshallese" },
  { slug: "mauritius", name: "Mauritius", nationality: "Mauritian" },
  { slug: "mexico", name: "Mexico", nationality: "Mexican" },
  { slug: "micronesia", name: "Micronesia", nationality: "Micronesian" },
  { slug: "moldova", name: "Moldova", nationality: "Moldovan" },
  { slug: "montenegro", name: "Montenegro", nationality: "Montenegrin" },
  { slug: "new-zealand", name: "New Zealand", nationality: "New Zealander" },
  { slug: "nicaragua", name: "Nicaragua", nationality: "Nicaraguan" },
  { slug: "north-macedonia", name: "North Macedonia", nationality: "North Macedonian" },
  { slug: "palau", name: "Palau", nationality: "Palauan" },
  { slug: "panama", name: "Panama", nationality: "Panamanian" },
  { slug: "paraguay", name: "Paraguay", nationality: "Paraguayan" },
  { slug: "peru", name: "Peru", nationality: "Peruvian" },
  { slug: "saint-kitts-and-nevis", name: "Saint Kitts and Nevis", nationality: "Kittitian or Nevisian" },
  { slug: "saint-lucia", name: "Saint Lucia", nationality: "Saint Lucian" },
  { slug: "saint-vincent-and-the-grenadines", name: "Saint Vincent and the Grenadines", nationality: "Vincentian" },
  { slug: "samoa", name: "Samoa", nationality: "Samoan" },
  { slug: "serbia", name: "Serbia", nationality: "Serbian" },
  { slug: "seychelles", name: "Seychelles", nationality: "Seychellois" },
  { slug: "singapore", name: "Singapore", nationality: "Singaporean" },
  { slug: "solomon-islands", name: "Solomon Islands", nationality: "Solomon Islander" },
  { slug: "south-korea", name: "South Korea", nationality: "South Korean" },
  { slug: "taiwan", name: "Taiwan", nationality: "Taiwanese" },
  { slug: "timor-leste", name: "Timor-Leste", nationality: "Timorese" },
  { slug: "tonga", name: "Tonga", nationality: "Tongan" },
  { slug: "trinidad-and-tobago", name: "Trinidad and Tobago", nationality: "Trinidadian" },
  { slug: "tuvalu", name: "Tuvalu", nationality: "Tuvaluan" },
  { slug: "ukraine", name: "Ukraine", nationality: "Ukrainian" },
  { slug: "united-arab-emirates", name: "United Arab Emirates", nationality: "Emirati" },
  { slug: "united-kingdom", name: "United Kingdom", nationality: "British" },
  { slug: "united-states", name: "United States", nationality: "American" },
  { slug: "uruguay", name: "Uruguay", nationality: "Uruguayan" },
  { slug: "vanuatu", name: "Vanuatu", nationality: "Ni-Vanuatu" },
  { slug: "venezuela", name: "Venezuela", nationality: "Venezuelan" },
];

const FACTS = {
  fee: "€20",
  validityYears: 3,
  maxStayDays: 90,
  maxStayWindow: 180,
  launchWindow: "Q4 2026",
};

function buildPrompt(c: { name: string; nationality: string }) {
  return `You are a senior travel journalist writing for visas.guide.

Write an ETIAS country guide for ${c.nationality} passport holders (citizens of ${c.name}).

FACTS (use these exactly, never invent different numbers):
- ETIAS fee: ${FACTS.fee} (free for applicants under 18 and over 70)
- Validity: ${FACTS.validityYears} years, or until passport expires
- Allowed stay: ${FACTS.maxStayDays} days within any ${FACTS.maxStayWindow}-day period in the Schengen area
- Launch window: ${FACTS.launchWindow}
- ETIAS is a travel authorization, NOT a visa
- Only apply via the official EU portal travel-europe.europa.eu — never trust look-alike sites

VOICE: human, conversational, first-person where natural. Use contractions. Vary sentence length. No "In conclusion", no "It is important to note", no "Furthermore". Never use em dashes or en dashes. Avoid bullet lists inside prose fields, write flowing paragraphs.

Return STRICT JSON with this exact shape (no markdown, no commentary):
{
  "intro": "1 short paragraph (~60-90 words) confirming ${c.nationality} citizens need ETIAS for Schengen travel from launch.",
  "who_qualifies": "2-3 paragraphs on which ${c.name} passport holders are eligible, edge cases (dual nationals, permanent residents of EU, diplomatic passports), and who is exempt.",
  "special_notes": "2 paragraphs covering anything specific to ${c.nationality} travellers — common entry points, embassy guidance, frequent traveller patterns, scam warnings relevant to ${c.name}.",
  "processing_details": "2 paragraphs on realistic processing time for ${c.nationality} applicants, what to do if delayed, and tips that improve approval odds.",
  "faqs": [
    { "question": "Do ${c.nationality} citizens need ETIAS?", "answer": "..." },
    { "question": "How much does ETIAS cost for ${c.nationality} passport holders?", "answer": "..." },
    { "question": "How long is ETIAS valid for ${c.nationality} travellers?", "answer": "..." },
    { "question": "Can I use ETIAS to work in Europe?", "answer": "..." },
    { "question": "What if my ${c.name} passport expires before my ETIAS?", "answer": "..." }
  ],
  "seo_title": "ETIAS for ${c.nationality} Citizens 2026 — Fee, Rules & How to Apply",
  "seo_description": "Full ETIAS guide for ${c.nationality} passport holders. ${FACTS.fee} fee, ${FACTS.validityYears}-year validity, eligibility, application steps, and processing time for ${FACTS.launchWindow} launch."
}`;
}

async function generateOne(country: { slug: string; name: string; nationality: string }, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a senior travel journalist. Always respond with valid JSON only." },
        { role: "user", content: buildPrompt(country) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(normalizeContentTypography(raw));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: { slugs?: string[]; force?: boolean; limit?: number } = {};
    try { body = await req.json(); } catch { /* allow empty */ }
    const { slugs, force = false, limit } = body;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find existing slugs
    const { data: existing } = await supabase
      .from("etias_country_pages")
      .select("country_slug");
    const existingSet = new Set((existing ?? []).map((r: any) => r.country_slug));

    let queue = COUNTRIES.filter((c) =>
      (!slugs || slugs.includes(c.slug)) && (force || !existingSet.has(c.slug))
    );
    if (typeof limit === "number") queue = queue.slice(0, limit);

    const results: Array<{ slug: string; status: string; error?: string }> = [];

    for (const country of queue) {
      try {
        const ai = await generateOne(country, apiKey);
        const row = {
          country_slug: country.slug,
          country_name: country.name,
          nationality: country.nationality,
          intro: ai.intro ?? null,
          who_qualifies: ai.who_qualifies ?? null,
          special_notes: ai.special_notes ?? null,
          processing_details: ai.processing_details ?? null,
          faqs: Array.isArray(ai.faqs) ? ai.faqs : [],
          seo_title: ai.seo_title ?? null,
          seo_description: ai.seo_description ?? null,
          is_published: true,
          published_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("etias_country_pages")
          .upsert(row, { onConflict: "country_slug" });
        if (error) throw error;
        results.push({ slug: country.slug, status: "ok" });
      } catch (e: any) {
        console.error(`Failed ${country.slug}:`, e.message);
        results.push({ slug: country.slug, status: "error", error: String(e.message ?? e) });
      }
      // small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 800));
    }

    // Ping IndexNow for new URLs (best-effort)
    try {
      const urls = results.filter(r => r.status === "ok").map(r => `https://visas.guide/etias/for/${r.slug}`);
      if (urls.length) {
        await supabase.functions.invoke("auto-indexnow", { body: { urls } });
      }
    } catch (e) { console.warn("IndexNow ping failed", e); }

    return new Response(JSON.stringify({
      total: COUNTRIES.length,
      attempted: queue.length,
      succeeded: results.filter(r => r.status === "ok").length,
      failed: results.filter(r => r.status === "error").length,
      results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("bulk-generate-etias-countries error:", e);
    return new Response(JSON.stringify({ error: String(e.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
