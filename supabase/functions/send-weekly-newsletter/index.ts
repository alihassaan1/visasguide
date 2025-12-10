import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly newsletter send...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true);

    if (subError) {
      throw new Error(`Failed to fetch subscribers: ${subError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found");
      return new Response(
        JSON.stringify({ success: true, message: "No active subscribers", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // Create campaign for this batch
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        subject: 'Weekly Visa Updates from Visas.Guide',
        content: 'Automated weekly newsletter',
        sent_count: 0,
        opened_count: 0,
        clicked_count: 0,
      })
      .select('id')
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    const campaignId = campaign.id;
    let sentCount = 0;
    let errorCount = 0;

    // Send to each subscriber with a small delay to avoid rate limits
    for (const subscriber of subscribers) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-newsletter-template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: subscriber.email,
            name: subscriber.name || 'Traveler',
            isTest: false,
            campaignId: campaignId,
          }),
        });

        if (response.ok) {
          sentCount++;
          console.log(`Sent to: ${subscriber.email}`);
        } else {
          errorCount++;
          console.error(`Failed to send to: ${subscriber.email}`);
        }

        // Small delay between sends (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        errorCount++;
        console.error(`Error sending to ${subscriber.email}:`, err);
      }
    }

    // Update campaign with final sent count
    await supabase
      .from('email_campaigns')
      .update({ 
        sent_count: sentCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    console.log(`Newsletter complete: ${sentCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${sentCount} subscribers`,
        campaignId,
        sent: sentCount,
        failed: errorCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending weekly newsletter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
