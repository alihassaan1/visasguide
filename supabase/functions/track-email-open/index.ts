import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 
  0x01, 0x00, 0x3b
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("cid");
    const email = url.searchParams.get("email");
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "";

    console.log(`Email open tracked: campaign=${campaignId}, email=${email}`);

    if (campaignId && email) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Record the email open
      await supabase.from("email_opens").insert({
        campaign_id: campaignId,
        subscriber_email: email,
        user_agent: userAgent,
        ip_address: ipAddress,
      });

      // Increment opened_count in campaign
      await supabase.rpc("increment_email_opens", { p_campaign_id: campaignId }).catch(() => {
        // If RPC doesn't exist, update directly
        supabase
          .from("email_campaigns")
          .update({ opened_count: supabase.from("email_campaigns").select("opened_count").eq("id", campaignId).single() })
          .eq("id", campaignId);
      });

      // Alternative: Direct increment
      const { data: campaign } = await supabase
        .from("email_campaigns")
        .select("opened_count")
        .eq("id", campaignId)
        .single();
      
      if (campaign) {
        await supabase
          .from("email_campaigns")
          .update({ opened_count: (campaign.opened_count || 0) + 1 })
          .eq("id", campaignId);
      }
    }

    // Return tracking pixel
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error tracking email open:", error);
    // Still return the pixel even on error
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
