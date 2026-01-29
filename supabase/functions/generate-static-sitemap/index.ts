import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://visas.guide';
const SITEMAP_BUCKET = 'content-images';
const URLS_PER_SITEMAP = 10000; // Google allows up to 50k, we use 10k to stay safe

// Helper function to fetch all rows with pagination
async function fetchAllRows(
  table: string, 
  selectColumns: string, 
  filters?: { column: string; value: any; operator?: string }[],
  orderBy?: string
): Promise<any[]> {
  const allRows: any[] = [];
  let offset = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(table).select(selectColumns);
    
    if (filters) {
      for (const filter of filters) {
        if (filter.operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        } else if (filter.operator === 'like') {
          query = query.like(filter.column, filter.value);
        }
      }
    }
    
    if (orderBy) {
      query = query.order(orderBy);
    }
    
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      break;
    }
    
    if (data && data.length > 0) {
      allRows.push(...data);
      offset += data.length;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  
  return allRows;
}

function generateSitemapXml(urls: { loc: string; changefreq: string; priority: string }[], currentDate: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function generateSitemapIndex(sitemapUrls: string[], currentDate: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
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
    const urls: { loc: string; changefreq: string; priority: string }[] = [];

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
      { path: '/visa-types/tourist-visa', priority: '0.8', changefreq: 'weekly' },
      { path: '/visa-types/business-visa', priority: '0.8', changefreq: 'weekly' },
      { path: '/visa-types/student-visa', priority: '0.7', changefreq: 'weekly' },
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
    const countries = await fetchAllRows('countries', 'slug', undefined, 'name');
    for (const country of countries) {
      urls.push({
        loc: `${BASE_URL}/countries/${country.slug}`,
        changefreq: 'daily',
        priority: '0.8',
      });
    }
    console.log(`Added ${countries.length} country pages`);

    // Fetch ALL cities with country slugs using pagination
    const cities = await fetchAllRows('cities', 'slug, countries(slug)', undefined, 'name');
    for (const city of cities) {
      const countrySlug = (city.countries as any)?.slug;
      if (countrySlug) {
        urls.push({
          loc: `${BASE_URL}/${countrySlug}/${city.slug}`,
          changefreq: 'weekly',
          priority: '0.6',
        });
      }
    }
    console.log(`Added ${cities.length} city pages`);

    // Fetch ALL published content pages with pagination (includes 38k+ visa requirements)
    const contentPages = await fetchAllRows(
      'content_pages', 
      'slug, updated_at',
      [{ column: 'is_published', value: true, operator: 'eq' }]
    );
    
    for (const page of contentPages) {
      let path = '';
      let priority = '0.7';
      let changefreq = 'weekly';

      if (page.slug.includes('-to-') && page.slug.includes('-visa-requirements')) {
        path = `/visa-requirements/${page.slug}`;
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

      urls.push({
        loc: `${BASE_URL}${path}`,
        changefreq,
        priority,
      });
    }
    console.log(`Added ${contentPages.length} content pages`);

    // Fetch ALL guides with pagination
    const guides = await fetchAllRows('guides', 'slug');
    for (const guide of guides) {
      urls.push({
        loc: `${BASE_URL}/guides/${guide.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
    console.log(`Added ${guides.length} guide pages`);

    // Fetch ALL published news articles with pagination
    const news = await fetchAllRows(
      'news_articles', 
      'slug, published_at',
      [{ column: 'status', value: 'published', operator: 'eq' }]
    );
    for (const article of news) {
      urls.push({
        loc: `${BASE_URL}/blog/${article.slug}`,
        changefreq: 'monthly',
        priority: '0.5',
      });
    }
    console.log(`Added ${news.length} news articles`);

    console.log(`✅ Generated sitemap with ${urls.length} URLs total`);

    const currentDate = new Date().toISOString().split('T')[0];

    if (shouldPublish) {
      // Split URLs into chunks and upload each as a separate sitemap
      const chunks: { loc: string; changefreq: string; priority: string }[][] = [];
      for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
        chunks.push(urls.slice(i, i + URLS_PER_SITEMAP));
      }

      console.log(`Splitting into ${chunks.length} sitemap files (${URLS_PER_SITEMAP} URLs each)`);

      const sitemapUrls: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const sitemapPath = `sitemaps/sitemap-${i + 1}.xml`;
        const sitemapXml = generateSitemapXml(chunk, currentDate);

        console.log(`Uploading ${sitemapPath} with ${chunk.length} URLs...`);

        const { error: uploadError } = await supabase.storage
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

        sitemapUrls.push(`${supabaseUrl}/storage/v1/object/public/${SITEMAP_BUCKET}/${sitemapPath}`);
      }

      // Generate and upload the sitemap index
      const sitemapIndex = generateSitemapIndex(sitemapUrls, currentDate);
      const indexPath = 'sitemaps/sitemap-index.xml';

      console.log(`Uploading sitemap index with ${sitemapUrls.length} sitemaps...`);

      const { error: indexUploadError } = await supabase.storage
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
          urlCount: urls.length,
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
    const sitemapXml = generateSitemapXml(urls, currentDate);

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
