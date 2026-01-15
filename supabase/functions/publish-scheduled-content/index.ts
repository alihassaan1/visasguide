import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all pages that are scheduled to be published and the time has passed
    const now = new Date().toISOString();
    
    const { data: scheduledPages, error: fetchError } = await supabase
      .from("content_pages")
      .select("id, slug, title, scheduled_at")
      .eq("is_published", false)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!scheduledPages || scheduledPages.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scheduled pages to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const publishedPages: string[] = [];
    const errors: string[] = [];

    for (const page of scheduledPages) {
      try {
        // Update the page to published
        const { error: updateError } = await supabase
          .from("content_pages")
          .update({ 
            is_published: true, 
            scheduled_at: null,
            updated_at: now 
          })
          .eq("id", page.id);

        if (updateError) {
          errors.push(`Failed to publish ${page.slug}: ${updateError.message}`);
          continue;
        }

        // Submit to IndexNow
        try {
          await fetch(`${supabaseUrl}/functions/v1/auto-indexnow`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ urls: [`/${page.slug}`] }),
          });
        } catch (indexError) {
          console.error(`IndexNow failed for ${page.slug}:`, indexError);
        }

        publishedPages.push(page.slug);
        console.log(`Published scheduled page: ${page.title} (${page.slug})`);
      } catch (pageError) {
        errors.push(`Error processing ${page.slug}: ${String(pageError)}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Published ${publishedPages.length} scheduled pages`,
        published: publishedPages,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in publish-scheduled-content:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
