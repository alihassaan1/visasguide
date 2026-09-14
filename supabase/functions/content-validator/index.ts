// Content Validator: audits and (optionally) fixes visa-requirements pages
// whose article body contradicts the canonical visa_requirements row.
//
// Detects the classic Australia→Portugal class of error: a visa-free or
// visa-on-arrival pair where the article tells readers they "need a visa".
//
// POST body:
//   { mode: 'audit' | 'fix', batchSize?: number, offset?: number, dryRun?: boolean }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeContentTypography } from "../_shared/contentTypography.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ReqType = 'visa_free' | 'visa_on_arrival' | 'e_visa' | 'visa_required' | 'generic';

// Phrases that assert "a visa is required" — these should NOT appear on
// visa-free or visa-on-arrival pages without strong qualifying context.
const REQUIRED_PHRASES = [
  /\bdo\s+need\s+a\s+visa\b/i,
  /\bneed\s+to\s+(apply\s+for|obtain|get)\s+a\s+visa\b/i,
  /\bmust\s+(apply\s+for|obtain|get)\s+a\s+visa\b/i,
  /\brequire\s+a\s+visa\b/i,
  /\ba\s+visa\s+is\s+required\b/i,
  /\bvisa\s+is\s+mandatory\b/i,
  /\bvisa-required\b/i,
];

const VISA_FREE_HINTS = /(visa[- ]free|no\s+visa\s+(?:is\s+)?(?:required|needed)|visa\s+exempt|without\s+a\s+visa)/i;
const VOA_HINTS = /(visa\s+on\s+arrival)/i;
const EVISA_HINTS = /(e-?visa|electronic\s+visa)/i;

function parsePair(slug: string): { from: string; to: string } | null {
  // visa-requirements/<from>-to-<to>
  let m = slug.match(/^visa-requirements\/([a-z-]+)-to-([a-z-]+)$/);
  if (m) return { from: m[1], to: m[2] };
  // <from>-to-<to>-visa-requirements
  m = slug.match(/^([a-z-]+)-to-([a-z-]+)-visa-requirements$/);
  if (m) return { from: m[1], to: m[2] };
  return null;
}

function detectMismatch(content: string, truth: ReqType): { mismatched: boolean; reason: string } {
  if (!content) return { mismatched: false, reason: '' };
  const hasRequired = REQUIRED_PHRASES.some((re) => re.test(content));

  if (truth === 'visa_free') {
    if (hasRequired && !VISA_FREE_HINTS.test(content)) {
      return { mismatched: true, reason: 'visa_free truth but content asserts visa required' };
    }
  } else if (truth === 'visa_on_arrival') {
    if (hasRequired && !VOA_HINTS.test(content) && !VISA_FREE_HINTS.test(content)) {
      return { mismatched: true, reason: 'visa_on_arrival truth but content asserts pre-arrival visa required' };
    }
  } else if (truth === 'e_visa') {
    if (hasRequired && !EVISA_HINTS.test(content)) {
      return { mismatched: true, reason: 'e_visa truth but content does not mention electronic visa' };
    }
  } else if (truth === 'visa_required') {
    // Inverse problem: page incorrectly says visa-free.
    if (VISA_FREE_HINTS.test(content) && !hasRequired) {
      return { mismatched: true, reason: 'visa_required truth but content says visa-free' };
    }
  }
  return { mismatched: false, reason: '' };
}

// Minimal correct article body keyed to the truth. Deterministic, no AI.
function buildCorrectContent(from: string, to: string, truth: ReqType): {
  content: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
} {
  const year = new Date().getFullYear();
  const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const blocks: Record<ReqType, { heading: string; lead: string; body: string }> = {
    visa_free: {
      heading: `${to} is visa-free for ${from} passport holders`,
      lead: `Good news: ${from} citizens do <strong>not</strong> need a visa to enter ${to} for short tourist or business stays. You can board a flight with just a valid passport.`,
      body: `
        <h3 class="text-xl font-semibold mt-8 mb-3">How long can ${from} citizens stay?</h3>
        <p>Visa-free stays in ${to} typically last up to 90 days within a 180-day period for tourism, family visits, or short business trips. Always confirm the exact allowance with the ${to} embassy before you travel, as bilateral agreements occasionally change.</p>
        <h3 class="text-xl font-semibold mt-8 mb-3">What you still need at the border</h3>
        <ul>
          <li>A ${from} passport valid for at least 6 months beyond your planned exit date.</li>
          <li>Proof of onward or return travel.</li>
          <li>Evidence of accommodation (hotel booking or host address).</li>
          <li>Proof of sufficient funds for the duration of your stay.</li>
          <li>Travel insurance (recommended, sometimes required).</li>
        </ul>
        <h3 class="text-xl font-semibold mt-8 mb-3">When you <em>do</em> need a visa</h3>
        <p>A visa is required only if you intend to work, study, or stay longer than the visa-free allowance. In that case, apply for the appropriate long-stay visa at the ${to} embassy or consulate in ${from} before you travel.</p>
      `,
    },
    visa_on_arrival: {
      heading: `${to} offers visa on arrival for ${from} passport holders`,
      lead: `${from} citizens can obtain a visa on arrival at major ${to} ports of entry. There is no need to visit an embassy before you fly — you complete the formalities at the immigration counter when you land.`,
      body: `
        <h3 class="text-xl font-semibold mt-8 mb-3">What to bring</h3>
        <ul>
          <li>${from} passport valid for at least 6 months with blank pages.</li>
          <li>Confirmed return or onward ticket.</li>
          <li>Proof of accommodation in ${to}.</li>
          <li>Visa fee in cash (USD or local currency).</li>
          <li>Passport-sized photos (bring two to be safe).</li>
        </ul>
        <h3 class="text-xl font-semibold mt-8 mb-3">At the airport</h3>
        <p>Follow signs to the "Visa on Arrival" counter <em>before</em> joining the main immigration queue. Submit your documents and fee, wait 10–30 minutes for processing, then proceed to passport control for your entry stamp.</p>
        <h3 class="text-xl font-semibold mt-8 mb-3">Typical cost and duration</h3>
        <p>Visa-on-arrival fees for ${to} usually range from USD 20 to 50, and the permit normally covers 15 to 30 days. Extensions are sometimes possible at a local immigration office.</p>
      `,
    },
    e_visa: {
      heading: `${from} citizens need an e-visa for ${to}`,
      lead: `${to} requires ${from} passport holders to apply online for an electronic visa (e-visa) before travel. The process is entirely digital — no embassy visit required.`,
      body: `
        <h3 class="text-xl font-semibold mt-8 mb-3">How to apply</h3>
        <ol>
          <li>Visit the official ${to} e-visa portal.</li>
          <li>Complete the application using details that exactly match your ${from} passport.</li>
          <li>Upload a high-resolution passport scan and a compliant digital photo.</li>
          <li>Pay the fee online with a credit or debit card.</li>
          <li>Receive the approved e-visa by email — print a copy to present at immigration.</li>
        </ol>
        <h3 class="text-xl font-semibold mt-8 mb-3">Processing time and cost</h3>
        <p>Most e-visas are issued within 3–5 business days. Standard tourist e-visa fees usually fall between USD 25 and 75 depending on validity and the number of entries.</p>
        <h3 class="text-xl font-semibold mt-8 mb-3">At the border</h3>
        <p>Bring your passport plus a printed copy of the e-visa approval. Immigration officers will scan or stamp the document and admit you for the period authorized on the visa.</p>
      `,
    },
    visa_required: {
      heading: `${from} citizens need a visa to enter ${to}`,
      lead: `${from} passport holders must obtain a visa from a ${to} embassy or consulate before travelling. Apply at least 4–6 weeks ahead of your trip to allow for processing.`,
      body: `
        <h3 class="text-xl font-semibold mt-8 mb-3">Documents you will need</h3>
        <ul>
          <li>${from} passport valid 6+ months beyond your stay, with blank pages.</li>
          <li>Completed visa application form.</li>
          <li>Recent passport-style photographs to specification.</li>
          <li>Confirmed round-trip flight itinerary.</li>
          <li>Hotel reservation or invitation letter.</li>
          <li>Bank statements (typically the last 3–6 months).</li>
          <li>Employment letter or business documents.</li>
          <li>Travel insurance covering the full stay.</li>
        </ul>
        <h3 class="text-xl font-semibold mt-8 mb-3">Application process</h3>
        <p>Book an appointment at the ${to} embassy or visa application centre serving ${from}. Attend in person, submit your documents, give biometrics if required, and pay the fee. Processing usually takes 2–4 weeks.</p>
        <h3 class="text-xl font-semibold mt-8 mb-3">Typical fees</h3>
        <p>Tourist visa fees range from USD 50 to 160, with additional service-centre and biometric charges of USD 20–40 where applicable.</p>
      `,
    },
    generic: {
      heading: `Entry requirements for ${from} citizens visiting ${to}`,
      lead: `Visa rules between ${from} and ${to} depend on your purpose of travel and length of stay. Always confirm the latest requirements with the ${to} embassy before booking.`,
      body: `
        <h3 class="text-xl font-semibold mt-8 mb-3">Plan ahead</h3>
        <p>Check whether your trip qualifies for visa-free entry, visa on arrival, an e-visa, or whether an embassy visa is required. Allow extra time for any application and gather standard travel documents in advance.</p>
      `,
    },
  };

  const b = blocks[truth];
  const content = `
<article class="prose prose-lg max-w-none">
  <h2 class="text-2xl font-bold mb-4">${b.heading}</h2>
  <p class="mb-4">${b.lead}</p>
  ${b.body}
  <div class="mt-8 p-4 bg-muted rounded-lg">
    <p class="text-sm text-muted-foreground"><strong>Disclaimer:</strong> Visa requirements can change at short notice. Verify the latest rules with the official ${to} embassy or consulate before you travel. Last reviewed: ${today}.</p>
  </div>
</article>`.trim();

  let title: string;
  let metaTitle: string;
  let metaDescription: string;
  let excerpt: string;

  switch (truth) {
    case 'visa_free':
      title = `${to} Visa-Free for ${from} Citizens — Entry Rules ${year}`;
      metaTitle = `${to} Visa-Free for ${from} Passport Holders | ${year}`;
      metaDescription = `${from} citizens can visit ${to} visa-free for short stays. Length of stay, passport rules, and what to bring at the border.`;
      excerpt = `${from} passport holders enjoy visa-free entry to ${to}. Here is what you need to know before you fly.`;
      break;
    case 'visa_on_arrival':
      title = `${to} Visa on Arrival for ${from} Citizens — ${year} Guide`;
      metaTitle = `${to} Visa on Arrival for ${from} Passport Holders | ${year}`;
      metaDescription = `${from} citizens can get a visa on arrival in ${to}. Fees, documents, processing time, and what to expect at the airport.`;
      excerpt = `${from} travellers can obtain a ${to} visa on arrival. Documents, cost, and step-by-step process.`;
      break;
    case 'e_visa':
      title = `${to} e-Visa for ${from} Citizens — How to Apply ${year}`;
      metaTitle = `${to} e-Visa for ${from} Passport Holders | ${year}`;
      metaDescription = `${from} citizens can apply online for a ${to} e-visa. Step-by-step process, fees, processing time, and required documents.`;
      excerpt = `${from} travellers need an online e-visa for ${to}. Application steps, costs, and what to present at immigration.`;
      break;
    case 'visa_required':
      title = `${to} Visa Requirements for ${from} Citizens ${year}`;
      metaTitle = `${to} Visa for ${from} Citizens | Requirements & How to Apply ${year}`;
      metaDescription = `${from} citizens need an embassy visa for ${to}. Documents, application steps, fees, and processing times explained.`;
      excerpt = `Complete embassy-visa guide for ${from} passport holders travelling to ${to}.`;
      break;
    default:
      title = `${to} Entry Requirements for ${from} Citizens ${year}`;
      metaTitle = `${to} Entry Requirements for ${from} Passport Holders | ${year}`;
      metaDescription = `Visa and entry rules for ${from} passport holders visiting ${to}. Check the latest requirements before you book.`;
      excerpt = `Visa and entry rules for ${from} citizens travelling to ${to}.`;
  }

  return {
    content: normalizeContentTypography(content),
    title: normalizeContentTypography(title),
    metaTitle: normalizeContentTypography(metaTitle),
    metaDescription: normalizeContentTypography(metaDescription),
    excerpt: normalizeContentTypography(excerpt),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const mode: 'audit' | 'fix' = body.mode === 'fix' ? 'fix' : 'audit';
    const batchSize: number = Math.min(Math.max(Number(body.batchSize) || 500, 1), 2000);
    const offset: number = Math.max(Number(body.offset) || 0, 0);
    const dryRun: boolean = !!body.dryRun;

    // Load countries lookup once
    const { data: countries, error: cErr } = await supabase
      .from('countries')
      .select('id, name, slug');
    if (cErr) throw cErr;
    const bySlug = new Map<string, { id: string; name: string; slug: string }>();
    (countries || []).forEach((c: any) => bySlug.set((c.slug || '').toLowerCase(), c));

    // Load visa requirements truth table (paginated to bypass 1k limit)
    const truthMap = new Map<string, ReqType>(); // key: fromId|toId
    {
      let from = 0;
      const step = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('visa_requirements')
          .select('from_country_id, to_country_id, requirement_type')
          .range(from, from + step - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        for (const r of data) {
          const t = String(r.requirement_type || '').toLowerCase() as ReqType;
          truthMap.set(`${r.from_country_id}|${r.to_country_id}`, t);
        }
        if (data.length < step) break;
        from += step;
      }
    }

    // Fetch a page of candidate content_pages matching visa-requirements slug shapes
    const { data: pages, error: pErr } = await supabase
      .from('content_pages')
      .select('id, slug, content, is_published')
      .or('slug.like.visa-requirements/%,slug.like.%-visa-requirements')
      .order('id', { ascending: true })
      .range(offset, offset + batchSize - 1);
    if (pErr) throw pErr;

    let scanned = 0;
    let mismatched = 0;
    let fixed = 0;
    const samples: any[] = [];
    const byTruth: Record<string, number> = {};

    for (const page of pages || []) {
      const parsed = parsePair(page.slug);
      if (!parsed) continue;
      const fromC = bySlug.get(parsed.from);
      const toC = bySlug.get(parsed.to);
      if (!fromC || !toC) continue;
      const truth = (truthMap.get(`${fromC.id}|${toC.id}`) || 'generic') as ReqType;
      scanned++;

      const { mismatched: bad, reason } = detectMismatch(page.content || '', truth);
      if (!bad) continue;
      mismatched++;
      byTruth[truth] = (byTruth[truth] || 0) + 1;

      if (samples.length < 10) {
        samples.push({ slug: page.slug, truth, reason });
      }

      if (mode === 'fix' && !dryRun) {
        const rebuilt = buildCorrectContent(fromC.name, toC.name, truth);
        const { error: uErr } = await supabase
          .from('content_pages')
          .update({
            content: rebuilt.content,
            title: rebuilt.title,
            meta_title: rebuilt.metaTitle,
            meta_description: rebuilt.metaDescription,
            excerpt: rebuilt.excerpt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', page.id);
        if (!uErr) fixed++;
      }
    }

    const nextOffset = offset + (pages?.length || 0);
    const exhausted = (pages?.length || 0) < batchSize;

    // Log run
    await supabase.from('activity_log').insert({
      action: 'content_validator_run',
      entity_type: 'content_pages',
      metadata: {
        mode, dryRun, offset, batchSize,
        scanned, mismatched, fixed, byTruth,
        nextOffset, exhausted,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({
      success: true,
      mode,
      dryRun,
      offset,
      batchSize,
      scanned,
      mismatched,
      fixed,
      byTruth,
      samples,
      nextOffset,
      exhausted,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('content-validator error:', err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
