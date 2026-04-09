import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterConfirmationRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: NewsletterConfirmationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Visas Guide <newsletter@visas.guide>",
      to: [email],
      subject: "Welcome to Visas.Guide Newsletter! 🌍",
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
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Visas.Guide!</h1>
              </div>
              <div class="content">
                <h2 style="color: #1e40af;">Hi ${name},</h2>
                <p>Thank you for subscribing to the Visas.Guide newsletter! We're thrilled to have you join our community of global travelers.</p>
                
                <p><strong>What you'll receive:</strong></p>
                <ul style="line-height: 1.8;">
                  <li>📰 Weekly visa policy updates and changes</li>
                  <li>✈️ Expert travel tips and destination guides</li>
                  <li>📋 Step-by-step visa application guides</li>
                  <li>🌍 Country-specific visa requirements</li>
                  <li>⚡ Breaking immigration news</li>
                </ul>

                <div style="text-align: center;">
                  <a href="https://visas.guide" class="button">Explore Visa Guides</a>
                </div>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #6b7280;">
                  <strong>Next Steps:</strong><br>
                  • Browse our comprehensive <a href="https://visas.guide/countries" style="color: #1e40af;">country guides</a><br>
                  • Check <a href="https://visas.guide/requirements" style="color: #1e40af;">visa requirements</a> for your destination<br>
                  • Read the latest <a href="https://visas.guide/news" style="color: #1e40af;">travel news</a>
                </p>
              </div>
              <div class="footer">
                <p>You're receiving this email because you subscribed to Visas.Guide newsletter.</p>
                <p>
                  <a href="https://visas.guide" style="color: #1e40af; text-decoration: none;">Visit Website</a> | 
                  <a href="https://visas.guide/contact" style="color: #1e40af; text-decoration: none;">Contact Us</a> | 
                  <a href="https://visas.guide/privacy-policy" style="color: #1e40af; text-decoration: none;">Privacy Policy</a>
                </p>
                <p style="margin-top: 20px;">© 2026 Visas.Guide. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Newsletter confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter-confirmation:", error);
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
