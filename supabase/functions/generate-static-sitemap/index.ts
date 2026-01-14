import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://visas.guide';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sitemap generation...');
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

    // Fetch all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('slug')
      .order('name');
    
    if (countriesError) {
      console.error('Error fetching countries:', countriesError);
    } else if (countries) {
      for (const country of countries) {
        urls.push({
          loc: `${BASE_URL}/countries/${country.slug}`,
          changefreq: 'daily',
          priority: '0.8',
        });
      }
      console.log(`Added ${countries.length} country pages`);
    }

    // Fetch all cities with country slugs
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('slug, countries(slug)')
      .order('name');
    
    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
    } else if (cities) {
      for (const city of cities) {
        const countrySlug = (city.countries as any)?.slug;
        if (countrySlug) {
          urls.push({
            loc: `${BASE_URL}/countries/${countrySlug}/${city.slug}`,
            changefreq: 'weekly',
            priority: '0.6',
          });
        }
      }
      console.log(`Added ${cities.length} city pages`);
    }

    // Fetch all published content pages
    const { data: contentPages, error: contentError } = await supabase
      .from('content_pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });
    
    if (contentError) {
      console.error('Error fetching content pages:', contentError);
    } else if (contentPages) {
      for (const page of contentPages) {
        // Determine URL path based on slug pattern
        let path = '';
        let priority = '0.7';
        let changefreq = 'weekly';

        if (page.slug.includes('-to-') && page.slug.includes('-visa-requirements')) {
          // Visa requirements pages
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
          changefreq: 'weekly';
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
    }

    // Fetch all guides
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('slug')
      .order('created_at', { ascending: false });
    
    if (guidesError) {
      console.error('Error fetching guides:', guidesError);
    } else if (guides) {
      for (const guide of guides) {
        urls.push({
          loc: `${BASE_URL}/guides/${guide.slug}`,
          changefreq: 'monthly',
          priority: '0.7',
        });
      }
      console.log(`Added ${guides.length} guide pages`);
    }

    // Fetch all published news articles
    const { data: news, error: newsError } = await supabase
      .from('news_articles')
      .select('slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (newsError) {
      console.error('Error fetching news:', newsError);
    } else if (news) {
      for (const article of news) {
        urls.push({
          loc: `${BASE_URL}/blog/${article.slug}`,
          changefreq: 'monthly',
          priority: '0.5',
        });
      }
      console.log(`Added ${news.length} news articles`);
    }

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

    console.log(`Generated sitemap with ${urls.length} URLs`);

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
