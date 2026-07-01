import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { escapeHtml } from "../_shared/adminAuth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!EMAIL_RE.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing contact form from: ${email}, subject: ${subject}`);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // Send notification email to visas.guide team
    const notificationEmail = await resend.emails.send({
      from: "Visas Guide <info@visas.guide>",
      to: ["info@visas.guide"],
      reply_to: email,
      subject: `New Contact Form: ${subject.slice(0, 150)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${safeMessage}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          This message was sent from the Visas.Guide contact form.
        </p>
      `,
    });

    console.log("Notification email sent:", notificationEmail);

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: "Visas Guide <info@visas.guide>",
      to: [email],
      subject: "We received your message - Visas.Guide",
      html: `
        <h1>Thank you for contacting us, ${safeName}!</h1>
        <p>We have received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
        <hr />
        <h3>Your Message:</h3>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p>${safeMessage}</p>
        <hr />
        <p>Best regards,<br>The Visas.Guide Team</p>
        <p style="color: #666; font-size: 12px;">
          5900 Balcones Drive, STE 100<br>
          Austin, TX 78731<br>
          Phone: +1 737 232 4666
        </p>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-form function:", error);
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
