import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://visas.guide';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        // Visa requirements pages - the bulk of our content
        path = `/visa-requirements/${page.slug}`;
        priority = '0.7';
        changefreq = 'weekly';
      } else if (page.slug.startsWith('countries/')) {
        // Country overview pages - already handled above
        continue;
      } else if (page.slug.startsWith('blog/')) {
        // Blog posts
        path = `/${page.slug}`;
        priority = '0.6';
        changefreq = 'monthly';
      } else if (page.slug.endsWith('-visa-free-countries')) {
        // Visa-free country lists
        path = `/${page.slug}`;
        priority = '0.7';
        changefreq = 'weekly';
      } else {
        // Other content pages
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

    // Generate sitemap XML
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log(`✅ Generated sitemap with ${urls.length} URLs total`);

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
