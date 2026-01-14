import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = '4e987242e9884f69b076157c7064eec3';
const SITE_HOST = 'visas.guide';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function getAllIndexableUrls(): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const urls: string[] = [];
  
  // Static pages
  const staticPages = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/editorial-policy',
    '/affiliate-disclosure',
    '/news',
    '/visa-guides',
    '/countries',
    '/passport-rankings',
    '/visa-finder',
    '/visa-types/tourist',
    '/visa-types/business',
    '/visa-types/student',
    '/processing-times',
    '/schengen-visa-guide',
  ];
  
  staticPages.forEach(page => {
    urls.push(`https://${SITE_HOST}${page}`);
  });

  // Fetch content pages
  const { data: contentPages } = await supabase
    .from('content_pages')
    .select('slug')
    .eq('is_published', true);
  
  contentPages?.forEach(page => {
    urls.push(`https://${SITE_HOST}/${page.slug}`);
  });

  // Fetch news articles
  const { data: newsArticles } = await supabase
    .from('news_articles')
    .select('slug')
    .eq('status', 'published');
  
  newsArticles?.forEach(article => {
    urls.push(`https://${SITE_HOST}/news/${article.slug}`);
  });

  // Fetch countries
  const { data: countries } = await supabase
    .from('countries')
    .select('slug');
  
  countries?.forEach(country => {
    urls.push(`https://${SITE_HOST}/countries/${country.slug}`);
  });

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('slug, countries!inner(slug)')
    .limit(1000);
  
  cities?.forEach((city: any) => {
    if (city.countries?.slug) {
      urls.push(`https://${SITE_HOST}/countries/${city.countries.slug}/${city.slug}`);
    }
  });

  // Fetch guides
  const { data: guides } = await supabase
    .from('guides')
    .select('slug');
  
  guides?.forEach(guide => {
    urls.push(`https://${SITE_HOST}/guides/${guide.slug}`);
  });

  // Fetch authors
  const { data: authors } = await supabase
    .from('authors')
    .select('slug')
    .eq('is_active', true);
  
  authors?.forEach(author => {
    urls.push(`https://${SITE_HOST}/author/${author.slug}`);
  });

  console.log(`Collected ${urls.length} total indexable URLs`);
  return urls;
}

async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; submitted: number; errors: string[] }> {
  const errors: string[] = [];
  let totalSubmitted = 0;
  
  // IndexNow accepts up to 10,000 URLs per request, but we'll batch at 1,000 for safety
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch
    };

    console.log(`Submitting batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} URLs`);

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log(`IndexNow response for batch: status=${response.status}, body=${responseText}`);

      if (response.status === 200 || response.status === 202) {
        totalSubmitted += batch.length;
      } else {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error(`Error submitting batch:`, error);
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    success: errors.length === 0,
    submitted: totalSubmitted,
    errors
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { urls, submitAll } = body;

    let urlsToSubmit: string[] = [];

    // Handle submitAll mode - fetch all URLs from database
    if (submitAll) {
      console.log('Fetching all indexable URLs from database...');
      urlsToSubmit = await getAllIndexableUrls();
    } else if (urls && Array.isArray(urls) && urls.length > 0) {
      // Handle explicit URL list
      urlsToSubmit = urls.map((url: string) => 
        url.startsWith('http') ? url : `https://${SITE_HOST}${url}`
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of URLs or set submitAll: true' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (urlsToSubmit.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No URLs found to submit' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Submitting ${urlsToSubmit.length} URLs to IndexNow...`);
    
    const result = await submitToIndexNow(urlsToSubmit);

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        message: `Successfully submitted ${result.submitted} of ${urlsToSubmit.length} URLs to IndexNow`,
        totalUrls: urlsToSubmit.length,
        submittedUrls: result.submitted,
        errors: result.errors.length > 0 ? result.errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in indexnow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
