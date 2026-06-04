import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    const campaignId = url.searchParams.get('cid');
    const email = url.searchParams.get('email');
    const linkName = url.searchParams.get('link') || '';

    console.log(`Email click tracked - Campaign: ${campaignId}, Email: ${email}, Link: ${linkName}`);

    if (!targetUrl) {
      return new Response("Missing target URL", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (campaignId && email) {
      // Record the click
      await supabase
        .from('email_clicks')
        .insert({
          campaign_id: campaignId,
          subscriber_email: email,
          link_url: targetUrl,
          user_agent: req.headers.get('user-agent') || null,
          ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
        });

      // Increment clicked_count in campaign
      await supabase.rpc('increment_email_clicks', { p_campaign_id: campaignId });
    }

    // If this is an affiliate/sponsored banner click from the newsletter,
    // also log it as an affiliate_click in analytics_events and bump the
    // banner's click_count so it shows up in Ad Performance with source=newsletter.
    if (linkName.startsWith('aff_')) {
      const bannerName = linkName.slice(4);
      try {
        const { data: banner } = await supabase
          .from('settings_affiliates')
          .select('id, name, target_url')
          .eq('name', bannerName)
          .maybeSingle();

        await supabase.from('analytics_events').insert({
          event_type: 'affiliate_click',
          page_slug: 'newsletter',
          search_term: bannerName,
          referrer_source: targetUrl,
          visitor_location: {
            source: 'newsletter',
            position: 'newsletter-sponsored',
            campaign_id: campaignId || null,
          },
          user_agent: req.headers.get('user-agent') || null,
        });

        if (banner?.id) {
          await supabase.rpc('increment_affiliate_click', { p_banner_id: banner.id });
        }
      } catch (e) {
        console.error('Failed to log newsletter affiliate click:', e);
      }
    }

    // Redirect to target URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error("Error tracking email click:", error);
    // Try to redirect anyway
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url') || 'https://visas.guide';
    return new Response(null, {
      status: 302,
      headers: { 'Location': targetUrl },
    });
  }
});
