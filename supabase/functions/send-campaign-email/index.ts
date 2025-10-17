import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailRequest {
  subject: string;
  content: string;
  from_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, content, from_name = "Visas.Guide" }: CampaignEmailRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true);

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          const personalizedContent = content.replace(/\{name\}/g, subscriber.name);
          
          const emailResponse = await resend.emails.send({
            from: `${from_name} <onboarding@resend.dev>`,
            to: [subscriber.email],
            subject: subject,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
                    a { color: #1e40af; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin: 0; font-size: 24px;">Visas.Guide</h1>
                    </div>
                    <div class="content">
                      ${personalizedContent}
                    </div>
                    <div class="footer">
                      <p>You're receiving this because you subscribed to Visas.Guide newsletter.</p>
                      <p>
                        <a href="https://visas.guide">Visit Website</a> | 
                        <a href="https://visas.guide/contact">Contact Us</a> | 
                        <a href="https://visas.guide/privacy-policy">Privacy Policy</a>
                      </p>
                      <p style="margin-top: 20px;">© 2025 Visas.Guide. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          
          return { email: subscriber.email, status: 'sent', id: emailResponse.id };
        } catch (error: any) {
          return { email: subscriber.email, status: 'failed', error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    console.log(`Campaign sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Campaign sent successfully",
        total: subscribers.length,
        successful: successCount,
        failed: failureCount,
        details: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-campaign-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
