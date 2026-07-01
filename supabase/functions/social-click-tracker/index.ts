import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAllowedRedirect } from "../_shared/adminAuth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAFE_FALLBACK = 'https://visas.guide';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const params = url.searchParams;

    // Extract UTM parameters
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const destination = params.get('url') || params.get('dest');
    const postId = params.get('post_id');

    // Get request metadata
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Extract content slug from destination or campaign
    let contentSlug = '';
    if (destination) {
      try {
        const destUrl = new URL(destination);
        contentSlug = destUrl.pathname.replace(/^\//, '');
      } catch {
        contentSlug = destination;
      }
    } else if (utmCampaign) {
      // Campaign format: contentType_slug
      const parts = utmCampaign.split('_');
      if (parts.length > 1) {
        contentSlug = parts.slice(1).join('_').replace(/-/g, '/');
      }
    }

    // Get geo info from IP (placeholder - in production use a geo-IP service)
    let country = 'Unknown';
    let city = 'Unknown';

    // Try to get geo info from a free service
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'visas.guide-social-tracker' },
      });
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        country = geoData.country_name || 'Unknown';
        city = geoData.city || 'Unknown';
      }
    } catch (geoError) {
      console.log('Geo lookup failed:', geoError);
    }

    // Record the click
    const { error: insertError } = await supabase
      .from('marketing_clicks')
      .insert({
        social_post_id: postId || null,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        content_slug: contentSlug,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
        country,
        city,
      });

    if (insertError) {
      console.error('Error recording click:', insertError);
    }

    // Update click count on social post if post_id provided
    if (postId) {
      const { data: post } = await supabase
        .from('social_posts')
        .select('link_clicks')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('social_posts')
          .update({ link_clicks: (post.link_clicks || 0) + 1 })
          .eq('id', postId);
      }
    }

    // If destination URL provided, redirect to it (allowlist-checked)
    if (destination) {
      const safe = isAllowedRedirect(destination) ? destination : SAFE_FALLBACK;
      if (safe !== destination) console.warn('Blocked open-redirect attempt:', destination);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': safe,
        },
      });
    }

    // Otherwise return success response
    return new Response(
      JSON.stringify({
        success: true,
        tracked: {
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
          slug: contentSlug,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Click tracker error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
