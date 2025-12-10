import React from 'npm:react@18.3.1'
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { NewsletterEmail } from './_templates/newsletter.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  email: string;
  name?: string;
  isTest?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name = "Traveler", isTest = false }: SendNewsletterRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Sending newsletter to: ${email}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch latest blog posts
    const { data: blogPosts } = await supabase
      .from('news_articles')
      .select('title, excerpt, slug, featured_image_url')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    // Fetch popular country guides
    const { data: countries } = await supabase
      .from('countries')
      .select('name, slug, flag_emoji, visa_free_destinations')
      .order('visa_free_destinations', { ascending: false })
      .limit(4);

    // Fetch active affiliates
    const { data: affiliates } = await supabase
      .from('settings_affiliates')
      .select('name, target_url, image_url')
      .eq('is_active', true)
      .limit(3);

    // Prepare data for template
    const templateData = {
      subscriberName: name,
      blogPosts: (blogPosts || []).map(post => ({
        title: post.title,
        excerpt: post.excerpt || 'Read the full article for more details...',
        slug: post.slug,
        featured_image_url: post.featured_image_url,
      })),
      countryGuides: (countries || []).map(country => ({
        name: country.name,
        slug: country.slug,
        flag_emoji: country.flag_emoji || '🌍',
        visa_free_destinations: country.visa_free_destinations,
      })),
      affiliates: (affiliates || []).map(aff => ({
        name: aff.name,
        description: `Check out ${aff.name} for your travel needs`,
        image_url: aff.image_url || 'https://visas.guide/favicon.png',
        target_url: aff.target_url,
      })),
      unsubscribeUrl: `https://visas.guide/unsubscribe?email=${encodeURIComponent(email)}`,
    };

    // Render the React email template
    const html = await renderAsync(
      React.createElement(NewsletterEmail, templateData)
    );

    console.log("Template rendered successfully");

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Visas.Guide <onboarding@resend.dev>",
      to: [email],
      subject: isTest 
        ? "🧪 [TEST] Your Weekly Visa Updates from Visas.Guide" 
        : "🌍 Your Weekly Visa Updates from Visas.Guide",
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error(emailError.message);
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${email}`,
        emailId: emailData?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending newsletter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
