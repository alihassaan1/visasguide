import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = '4e987242e9884f69b076157c7064eec3';
const SITE_HOST = 'visas.guide';
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of URLs to submit' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Submitting ${urls.length} URLs to IndexNow:`, urls);

    // IndexNow API endpoint (using Bing's endpoint)
    const indexNowUrl = 'https://api.indexnow.org/indexnow';

    // For multiple URLs, use the batch submission format
    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.map(url => url.startsWith('http') ? url : `https://${SITE_HOST}${url}`)
    };

    console.log('IndexNow payload:', JSON.stringify(payload));

    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log(`IndexNow response status: ${response.status}, body: ${responseText}`);

    // IndexNow returns 200 for success, 202 for accepted
    if (response.status === 200 || response.status === 202) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
          status: response.status,
          urlsSubmitted: payload.urlList
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.error('IndexNow submission failed:', response.status, responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `IndexNow returned status ${response.status}`,
          details: responseText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
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
