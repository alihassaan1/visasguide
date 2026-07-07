import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 8;

interface Row { id: string; slug: string; title: string; content: string; }

const SYSTEM = `You produce a concise "Quick Facts" HTML table for a visa guide article.
Return ONLY raw HTML — no markdown fences, no commentary — in this EXACT structure:

<h2>Quick Facts</h2>
<table>
<tr><th>Visa type</th><td>...</td></tr>
<tr><th>Stay per entry</th><td>...</td></tr>
<tr><th>Total stay allowed</th><td>...</td></tr>
<tr><th>Cost</th><td>...</td></tr>
<tr><th>Eligible countries</th><td>...</td></tr>
<tr><th>Where to apply</th><td>...</td></tr>
<tr><th>Processing time</th><td>...</td></tr>
</table>

Rules:
- Values must be specific, factual, and reflect 2026 policy for the visa named in the title.
- Keep each value under 90 characters.
- If a field genuinely doesn't apply, write "Varies by nationality" or a similarly honest short value — never "N/A".
- No links, no emojis, no bold/italic tags inside cells.`;

async function callLovable(apiKey: string, title: string, excerpt: string): Promise<string | null> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Article title: ${title}\n\nArticle excerpt:\n${excerpt}\n\nProduce the Quick Facts table now.` },
      ],
    }),
  });
  if (!res.ok) { console.error('Lovable AI error', res.status, await res.text()); return null; }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function callDeepSeek(apiKey: string, title: string, excerpt: string): Promise<string | null> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Article title: ${title}\n\nArticle excerpt:\n${excerpt}\n\nProduce the Quick Facts table now.` },
      ],
    }),
  });
  if (!res.ok) { console.error('DeepSeek error', res.status, await res.text()); return null; }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function generateTable(keys: { lovable?: string; deepseek?: string }, title: string, content: string): Promise<string | null> {
  const excerpt = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2500);
  let out: string | null = null;
  if (keys.deepseek) out = await callDeepSeek(keys.deepseek, title, excerpt);
  if (!out && keys.lovable) out = await callLovable(keys.lovable, title, excerpt);
  if (!out) return null;
  out = out.replace(/^```\w*\s*/gm, '').replace(/```\s*$/gm, '').trim();
  if (!/<table[\s\S]*<\/table>/i.test(out)) return null;
  return out;
}

function inject(content: string, table: string): string {
  // Insert after the first </p> or after the first </h1>, whichever comes first.
  const lower = content.toLowerCase();
  const pEnd = lower.indexOf('</p>');
  const hEnd = lower.indexOf('</h1>');
  let idx = -1;
  if (pEnd !== -1 && (hEnd === -1 || pEnd < hEnd)) idx = pEnd + 4;
  else if (hEnd !== -1) idx = hEnd + 5;
  if (idx === -1) return `${table}\n\n${content}`;
  return content.slice(0, idx) + `\n\n${table}\n\n` + content.slice(idx);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) throw new Error('LOVABLE_API_KEY missing');

    const body = await req.json().catch(() => ({}));
    const table: 'content_pages' | 'news_articles' = body.table === 'news_articles' ? 'news_articles' : 'content_pages';
    const limit = Math.min(Number(body.limit) || BATCH_SIZE, 20);

    let query = supabase.from(table).select('id, slug, title, content').not('content', 'ilike', '%Quick Facts%');
    if (table === 'content_pages') query = query.like('slug', 'blog/%');
    else query = query.or('title.ilike.%visa%,title.ilike.%evisa%,title.ilike.%eta%');
    const { data: rows, error } = await query.limit(limit);
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ success: true, done: true, processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.allSettled((rows as Row[]).map(async (r) => {
      const tableHtml = await generateTable(lovableKey, r.title, r.content);
      if (!tableHtml) return { slug: r.slug, ok: false, reason: 'generation failed' };
      const newContent = inject(r.content, tableHtml);
      const { error: uerr } = await supabase.from(table).update({ content: newContent }).eq('id', r.id);
      if (uerr) return { slug: r.slug, ok: false, reason: uerr.message };
      return { slug: r.slug, ok: true };
    }));

    const details = results.map(r => r.status === 'fulfilled' ? r.value : { ok: false, reason: 'rejected' });
    const ok = details.filter((d: any) => d.ok).length;

    return new Response(JSON.stringify({ success: true, processed: rows.length, ok, details }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
