// Streams sitemap chunks from Supabase Storage so they appear on the visas.guide domain.
// Public URL is wired via Lovable hosting / nginx rewrite to point /sitemaps/sitemap-N.xml here.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const BUCKET = 'content-images';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Accept ?name=sitemap-1.xml OR last path segment
    const nameParam = url.searchParams.get('name');
    const segment = url.pathname.split('/').filter(Boolean).pop() || '';
    const name = (nameParam || segment).trim();

    // Strict whitelist: only sitemap-<digits>.xml or sitemap-index.xml
    if (!/^sitemap-(\d+|index)\.xml$/.test(name)) {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/sitemaps/${name}`;
    const upstream = await fetch(storageUrl);

    if (!upstream.ok) {
      return new Response('Sitemap not found', { status: 404, headers: corsHeaders });
    }

    const xml = await upstream.text();
    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('serve-sitemap error', err);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
