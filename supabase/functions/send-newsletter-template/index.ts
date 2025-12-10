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
  campaignId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name = "Traveler", isTest = false, campaignId }: SendNewsletterRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Sending newsletter to: ${email}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate or use existing campaign ID
    let activeCampaignId = campaignId;
    if (!activeCampaignId) {
      // Create a new campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          subject: isTest ? '[TEST] Weekly Visa Updates' : 'Weekly Visa Updates from Visas.Guide',
          content: 'Newsletter campaign',
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0,
        })
        .select('id')
        .single();

      if (campaignError) {
        console.error("Error creating campaign:", campaignError);
      } else {
        activeCampaignId = campaignData.id;
      }
    }

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
      campaignId: activeCampaignId || '',
      subscriberEmail: email,
    };

    // Render the React email template
    const html = await renderAsync(
      React.createElement(NewsletterEmail, templateData)
    );

    console.log("Template rendered successfully");

    // Send the email from verified domain - using personal name format to avoid promotions tab
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Visas Guide <newsletter@visas.guide>",
      to: [email],
      subject: isTest 
        ? `${name}, your visa updates are here`
        : `${name}, your weekly visa updates are here`,
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw new Error(emailError.message);
    }

    // Update campaign sent count
    if (activeCampaignId) {
      await supabase
        .from('email_campaigns')
        .update({ 
          sent_count: 1,
          sent_at: new Date().toISOString()
        })
        .eq('id', activeCampaignId);
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${email}`,
        emailId: emailData?.id,
        campaignId: activeCampaignId
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
