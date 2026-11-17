import { fetchSitemapRows, sitemapLastmod as toLastmod, type SitemapFilter } from "../_shared/sitemap-data.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
if (!supabaseUrl || !supabaseKey) throw new Error('Public sitemap configuration missing');
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
// Storage publishing remains privileged, but every content query uses public access.
const publisher = () => { const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); if (!key) throw new Error('Sitemap publishing configuration missing'); return createClient(supabaseUrl, key); };

const BASE_URL = 'https://visas.guide';
const SITEMAP_BUCKET = 'content-images';
const URLS_PER_SITEMAP = 10000; // Google allows up to 50k, we use 10k to stay safe

const fetchAllRows = (table: string, columns: string, filters?: SitemapFilter[], orderBy?: string) => fetchSitemapRows(supabase, table, columns, filters, orderBy);

type SitemapUrl = { loc: string; changefreq: string; priority: string; lastmod?: string };

function generateSitemapXml(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function generateSitemapIndex(sitemapUrls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <sitemap>
    <loc>${url}</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shouldPublish = url.searchParams.get('publish') === '1' || url.searchParams.get('publish') === 'true';

    console.log('Starting comprehensive sitemap generation...');
    const urls: SitemapUrl[] = [];
    const blogUrls: SitemapUrl[] = [];
    const newsUrls: SitemapUrl[] = [];
    const nowIso = new Date().toISOString();

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/countries', priority: '0.9', changefreq: 'daily' },
      { path: '/visa-search', priority: '0.9', changefreq: 'daily' },
      { path: '/guides', priority: '0.8', changefreq: 'daily' },
      { path: '/blog', priority: '0.7', changefreq: 'hourly' },
      { path: '/passport-index', priority: '0.8', changefreq: 'weekly' },
      { path: '/processing-times', priority: '0.6', changefreq: 'weekly' },
      { path: '/requirements', priority: '0.6', changefreq: 'weekly' },
      { path: '/visa-types/tourist', priority: '0.8', changefreq: 'weekly' },
      { path: '/visa-types/business', priority: '0.8', changefreq: 'weekly' },
      { path: '/visa-types/student', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias', priority: '0.8', changefreq: 'weekly' },
      ...['vs-schengen-visa','faq','after-brexit','for-families','renewal','denied','vs-esta','schengen-itineraries'].map(slug=>({path:`/etias/${slug}`,priority:'0.7',changefreq:'weekly'})),
      { path: '/etias/countries', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/requirements', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/application', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/cost', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/processing-time', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/schengen-countries', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/timeline', priority: '0.7', changefreq: 'weekly' },
      { path: '/etias/news', priority: '0.7', changefreq: 'daily' },
      { path: '/schengen-visa-guide', priority: '0.8', changefreq: 'weekly' },
      { path: '/schengen-calculator', priority: '0.8', changefreq: 'weekly' },
      { path: '/policy-updates', priority: '0.7', changefreq: 'daily' },
      { path: '/things-to-do', priority: '0.7', changefreq: 'weekly' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
      { path: '/terms-of-service', priority: '0.3', changefreq: 'monthly' },
      { path: '/affiliate-disclosure', priority: '0.3', changefreq: 'monthly' },
      { path: '/cookie-policy', priority: '0.3', changefreq: 'monthly' },
      { path: '/editorial-policy', priority: '0.3', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      urls.push({
        loc: `${BASE_URL}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }
    console.log(`Added ${staticPages.length} static pages`);

    // Fetch ALL countries with pagination
    const countries = await fetchAllRows('countries', 'id, slug, updated_at', undefined, 'name');
    const countryById = new Map(countries.map(country => [country.id, country]));
    const countrySlugs = new Set(countries.map(country => country.slug));
    const countryGuides = await fetchAllRows('content_pages', 'slug,updated_at,seo_index', [{column:'is_published',value:true,operator:'eq'},{column:'slug',value:'countries/%',operator:'like'}]);
    const guideBySlug = new Map(countryGuides.map(guide => [guide.slug,guide]));
    for (const country of countries) {
      const guide = guideBySlug.get(`countries/${country.slug}`);
      if (guide?.seo_index === false) continue;
      urls.push({
        loc: `${BASE_URL}/countries/${country.slug}`,
        changefreq: 'daily',
        priority: '0.8',
        lastmod: toLastmod(guide?.updated_at || country.updated_at),
      });
    }
    console.log(`Added ${countries.length} country pages`);

    // Fetch ALL cities with country slugs using pagination
    const cities = await fetchAllRows('cities', 'slug, updated_at, countries(slug)', undefined, 'name');
    for (const city of cities) {
      const countrySlug = (city.countries as any)?.slug;
      if (countrySlug) {
        urls.push({
          loc: `${BASE_URL}/${countrySlug}/${city.slug}`,
          changefreq: 'weekly',
          priority: '0.6',
          lastmod: toLastmod(city.updated_at),
        });
      }
    }
    console.log(`Added ${cities.length} city pages`);

    // Fetch ALL published content pages with pagination (includes 38k+ visa requirements)
    const contentPages = await fetchAllRows(
      'content_pages', 
      'slug, updated_at',
      [{ column: 'is_published', value: true, operator: 'eq' }, { column: 'seo_index', value: true, operator: 'eq' }]
    );
    
    const seenPaths = new Set<string>(urls.map(url => url.loc));
    const blockedPages = await fetchAllRows('content_pages', 'slug', [{column:'seo_index',value:false,operator:'eq'}]);
    const blockedPairs = new Set(blockedPages.map(page => page.slug.replace(/^visa-requirements\//,'').replace(/-visa-requirements$/,'')));
    const pairs = await fetchAllRows('visa_requirements','from_country_id,to_country_id,last_updated');
    for (const pair of pairs) {
      const from = countryById.get(pair.from_country_id);
      const to = countryById.get(pair.to_country_id);
      if (!from || !to || from.id === to.id || blockedPairs.has(`${from.slug}-to-${to.slug}`)) continue;
      urls.push({loc:`${BASE_URL}/visa-requirements/${from.slug}-to-${to.slug}`,changefreq:'weekly',priority:'0.7',lastmod:toLastmod(pair.last_updated)});
    }
    const pairByLoc = new Map(urls.map(url => [url.loc,url]));
    for (const page of contentPages) {
      let path = '';
      let priority = '0.7';
      let changefreq = 'weekly';

      if (page.slug.includes('-to-')) {
        const normalized = page.slug
          .replace(/^visa-requirements\//, '')
          .replace(/-visa-requirements$/, '');
        const [fromSlug,toSlug] = normalized.split('-to-');
        if (!countrySlugs.has(fromSlug) || !countrySlugs.has(toSlug) || fromSlug === toSlug || blockedPairs.has(normalized)) continue;
        path = `/visa-requirements/${normalized}`;
        priority = '0.7';
        changefreq = 'weekly';
      } else if (page.slug.startsWith('countries/')) {
        continue;
      } else if (page.slug.startsWith('blog/')) {
        path = `/${page.slug}`;
        priority = '0.6';
        changefreq = 'monthly';
      } else if (page.slug.endsWith('-visa-free-countries')) {
        path = `/${page.slug}`;
        priority = '0.7';
        changefreq = 'weekly';
      } else {
        path = `/${page.slug}`;
        priority = '0.6';
        changefreq = 'weekly';
      }

      const fullLoc = `${BASE_URL}${path}`;
      const existingPair = pairByLoc.get(fullLoc);
      if (existingPair) {
        const contentDate = toLastmod(page.updated_at);
        if (contentDate && (!existingPair.lastmod || contentDate > existingPair.lastmod)) existingPair.lastmod = contentDate;
        continue;
      }
      if (seenPaths.has(fullLoc)) continue;
      seenPaths.add(fullLoc);

      (page.slug.startsWith('blog/') ? blogUrls : urls).push({
        loc: fullLoc,
        changefreq,
        priority,
        lastmod: toLastmod(page.updated_at),
      });
    }
    console.log(`Added ${contentPages.length} content pages`);

    // Fetch ALL guides with pagination
    const guides = await fetchAllRows('guides', 'slug, updated_at', [{column:'published_at',value:null,operator:'not-null'},{column:'published_at',value:nowIso,operator:'lte'}]);
    for (const guide of guides) {
      urls.push({
        loc: `${BASE_URL}/guides/${guide.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: toLastmod(guide.updated_at),
      });
    }
    console.log(`Added ${guides.length} guide pages`);

    // Fetch ALL published news articles with pagination
    const news = await fetchAllRows(
      'news_articles', 
      'slug, published_at, updated_at',
      [{ column: 'status', value: 'published', operator: 'eq' }, {column:'published_at',value:null,operator:'not-null'}, {column:'published_at',value:nowIso,operator:'lte'}]
    );
    for (const article of news) {
      newsUrls.push({
        loc: `${BASE_URL}/blog/${article.slug}`,
        changefreq: 'monthly',
        priority: '0.5',
        lastmod: toLastmod(article.updated_at),
      });
    }
    console.log(`Added ${news.length} news articles`);

    console.log(`✅ Generated sitemap with ${urls.length} URLs total`);

    const etias = await fetchAllRows('etias_country_pages','country_slug,updated_at',[{column:'is_published',value:true,operator:'eq'}]);
    for (const page of etias) urls.push({loc:`${BASE_URL}/etias/for/${page.country_slug}`,changefreq:'weekly',priority:'0.7',lastmod:toLastmod(page.updated_at)});
    const authors = await fetchAllRows('authors','slug,updated_at',[{column:'is_active',value:true,operator:'eq'}]);
    for (const author of authors) urls.push({loc:`${BASE_URL}/author/${author.slug}`,changefreq:'monthly',priority:'0.5',lastmod:toLastmod(author.updated_at)});
    const urlCount = urls.length + blogUrls.length + newsUrls.length;

    if (shouldPublish) {
      const chunks: { name: string; urls: SitemapUrl[] }[] = [];
      for (const [prefix, entries] of [['sitemap',urls],['sitemap-blog',blogUrls],['sitemap-news',newsUrls]] as const) {
        for (let i=0;i<entries.length;i+=URLS_PER_SITEMAP) chunks.push({name:`${prefix}-${Math.floor(i/URLS_PER_SITEMAP)+1}.xml`,urls:entries.slice(i,i+URLS_PER_SITEMAP)});
      }
      console.log(`Splitting into ${chunks.length} sitemap files (${URLS_PER_SITEMAP} URLs each)`);

      const sitemapUrls: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].urls;
        const sitemapPath = `sitemaps/${chunks[i].name}`;
        const sitemapXml = generateSitemapXml(chunk);

        console.log(`Uploading ${sitemapPath} with ${chunk.length} URLs...`);

        const { error: uploadError } = await publisher().storage
          .from(SITEMAP_BUCKET)
          .upload(
            sitemapPath,
            new Blob([sitemapXml], { type: 'application/xml' }),
            {
              upsert: true,
              contentType: 'application/xml',
              cacheControl: '3600',
            }
          );

        if (uploadError) {
          console.error(`Failed to upload ${sitemapPath}:`, uploadError);
          throw new Error(`Storage upload failed for ${sitemapPath}: ${uploadError.message}`);
        }

        sitemapUrls.push(`${BASE_URL}/sitemaps/${chunks[i].name}`);
      }

      // Generate and upload the sitemap index
      const sitemapIndex = generateSitemapIndex(sitemapUrls);
      const indexPath = 'sitemaps/sitemap-index.xml';

      console.log(`Uploading sitemap index with ${sitemapUrls.length} sitemaps...`);

      const { error: indexUploadError } = await publisher().storage
        .from(SITEMAP_BUCKET)
        .upload(
          indexPath,
          new Blob([sitemapIndex], { type: 'application/xml' }),
          {
            upsert: true,
            contentType: 'application/xml',
            cacheControl: '3600',
          }
        );

      if (indexUploadError) {
        console.error('Failed to upload sitemap index:', indexUploadError);
        throw new Error(`Storage upload failed for sitemap index: ${indexUploadError.message}`);
      }

      const indexUrl = `${supabaseUrl}/storage/v1/object/public/${SITEMAP_BUCKET}/${indexPath}`;

      console.log(`✅ Published ${chunks.length} sitemaps and 1 index`);

      return new Response(
        JSON.stringify({
          ok: true,
          urlCount,
          sitemapCount: chunks.length,
          indexUrl,
          sitemapUrls,
          generatedAt: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For non-publish requests, return the full sitemap XML directly
    const sitemapXml = generateSitemapXml([...urls,...blogUrls,...newsUrls]);

    return new Response(sitemapXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="sitemap.xml"',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
