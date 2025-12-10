import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    const campaignId = url.searchParams.get('cid');
    const email = url.searchParams.get('email');
    const linkName = url.searchParams.get('link');

    console.log(`Email click tracked - Campaign: ${campaignId}, Email: ${email}, Link: ${linkName}`);

    if (!targetUrl) {
      return new Response("Missing target URL", { status: 400 });
    }

    if (campaignId && email) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

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
