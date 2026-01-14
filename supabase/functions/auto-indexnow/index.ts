import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = '4e987242e9884f69b076157c7064eec3';
const SITE_HOST = 'visas.guide';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; submitted: number; error?: string }> {
  if (!urls || urls.length === 0) {
    return { success: true, submitted: 0 };
  }

  // Normalize URLs to full URLs
  const fullUrls = urls.map(url => {
    if (url.startsWith('http')) return url;
    return `https://${SITE_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  console.log(`📤 Submitting ${fullUrls.length} URLs to IndexNow:`, fullUrls);

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: fullUrls
      })
    });

    const status = response.status;
    console.log(`IndexNow response status: ${status}`);

    // IndexNow returns 200 or 202 for success
    if (status === 200 || status === 202) {
      console.log(`✅ Successfully submitted ${fullUrls.length} URLs to IndexNow`);
      return { success: true, submitted: fullUrls.length };
    } else {
      const errorText = await response.text();
      console.error(`❌ IndexNow error: ${status} - ${errorText}`);
      return { success: false, submitted: 0, error: `Status ${status}: ${errorText}` };
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return { success: false, submitted: 0, error: error.message };
  }
}

serve(async (req) => {
  console.log('Auto-IndexNow function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'urls array is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await submitToIndexNow(urls);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500
      }
    );

  } catch (error) {
    console.error('Auto-IndexNow error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
