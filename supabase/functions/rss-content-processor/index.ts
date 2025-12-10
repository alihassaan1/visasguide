import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const LOVABLE_AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MAX_RETRIES = 3;
const BATCH_SIZE = 5;

interface QueueItem {
  id: string;
  rss_feed_id: string;
  original_url: string;
  original_title: string;
  original_content: string | null;
  original_image_url: string | null;
  source_name: string | null;
  source_author: string | null;
  status: string;
  retry_count: number;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get API keys from site_settings
  const { data: apiSettings } = await supabase
    .from("site_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["deepseek_api_key", "openai_api_key"]);

  const deepseekApiKey = apiSettings?.find(s => s.setting_key === "deepseek_api_key")?.setting_value;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!deepseekApiKey) {
    console.error("[RSS Processor] DeepSeek API key not configured");
    return new Response(
      JSON.stringify({ success: false, error: "DeepSeek API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log("[RSS Processor] Starting content processing...");

    // Fetch all active authors for random assignment
    const { data: authors } = await supabase
      .from("authors")
      .select("id, name, slug")
      .eq("is_active", true);

    const authorsList: Author[] = authors || [];
    console.log(`[RSS Processor] Found ${authorsList.length} authors for assignment`);

    // Fetch pending items
    const { data: pendingItems, error: fetchError } = await supabase
      .from("rss_article_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Failed to fetch queue: ${fetchError.message}`);
    }

    if (!pendingItems || pendingItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No pending items", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[RSS Processor] Processing ${pendingItems.length} items`);

    let processed = 0;
    let published = 0;
    let failed = 0;

    for (const item of pendingItems as QueueItem[]) {
      try {
        // Randomly select an author
        const randomAuthor = authorsList.length > 0 
          ? authorsList[Math.floor(Math.random() * authorsList.length)]
          : null;

        console.log(`[RSS Processor] Processing: ${item.original_title.substring(0, 50)}... by ${randomAuthor?.name || 'Editorial'}`);

        // Update status to processing
        await supabase
          .from("rss_article_queue")
          .update({ status: "rewriting", processed_at: new Date().toISOString() })
          .eq("id", item.id);

        // Rewrite content with DeepSeek - pass author name for personalized style
        const rewriteResult = await rewriteWithDeepSeek(
          item.original_title,
          item.original_content || "",
          item.source_name || "Unknown",
          randomAuthor?.name || "Editorial Team",
          deepseekApiKey as string
        );

        if (!rewriteResult) {
          throw new Error("Failed to rewrite content");
        }

        // Update with rewritten content
        await supabase
          .from("rss_article_queue")
          .update({
            status: "generating_image",
            rewritten_title: rewriteResult.title,
            rewritten_content: rewriteResult.content,
            seo_title: rewriteResult.seo_title,
            seo_description: rewriteResult.seo_description,
            excerpt: rewriteResult.excerpt,
            extracted_tags: rewriteResult.tags,
            extracted_country: rewriteResult.country,
            extracted_visa_type: rewriteResult.visa_type,
          })
          .eq("id", item.id);

        // Generate image if Lovable API key available
        let generatedImageUrl = null;
        if (lovableApiKey) {
          try {
            generatedImageUrl = await generateImage(
              rewriteResult.title,
              rewriteResult.country || "",
              rewriteResult.visa_type || "",
              lovableApiKey
            );
          } catch (imgError: any) {
            console.error("[RSS Processor] Image generation failed:", imgError.message);
          }
        }

        // Generate slug
        const slug = generateSlug(rewriteResult.title);

        // Check for duplicate slug
        const { data: existingSlug } = await supabase
          .from("news_articles")
          .select("slug")
          .eq("slug", slug)
          .single();

        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        // Create news article with random author
        const { data: article, error: articleError } = await supabase
          .from("news_articles")
          .insert({
            title: rewriteResult.title,
            slug: finalSlug,
            content: rewriteResult.content,
            excerpt: rewriteResult.excerpt,
            seo_title: rewriteResult.seo_title,
            seo_description: rewriteResult.seo_description,
            featured_image_url: generatedImageUrl || item.original_image_url,
            tags: rewriteResult.tags,
            categories: rewriteResult.country ? [rewriteResult.country] : [],
            source_name: item.source_name,
            source_url: item.original_url,
            original_url: item.original_url,
            ai_generated: true,
            status: "published",
            published_at: new Date().toISOString(),
            source_type: "rss",
            writer_id: randomAuthor?.id || null,
            author: randomAuthor?.name || "Visas.Guide Editorial",
          })
          .select()
          .single();

        if (articleError) {
          throw new Error(`Failed to create article: ${articleError.message}`);
        }

        // Update queue item as published
        await supabase
          .from("rss_article_queue")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            news_article_id: article.id,
            generated_image_url: generatedImageUrl,
          })
          .eq("id", item.id);

        // Log API call
        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          task_type: "rss_content_rewrite",
          entity_name: item.original_title.substring(0, 100),
          status: "success",
        });

        published++;
        processed++;
        console.log(`[RSS Processor] Published: ${rewriteResult.title}`);

      } catch (itemError: any) {
        console.error(`[RSS Processor] Failed to process item ${item.id}:`, itemError);
        
        const newRetryCount = (item.retry_count || 0) + 1;
        const newStatus = newRetryCount >= MAX_RETRIES ? "failed" : "pending";

        await supabase
          .from("rss_article_queue")
          .update({
            status: newStatus,
            error_message: itemError.message,
            retry_count: newRetryCount,
          })
          .eq("id", item.id);

        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          task_type: "rss_content_rewrite",
          entity_name: item.original_title.substring(0, 100),
          status: "error",
          error_message: itemError.message,
        });

        failed++;
        processed++;
      }
    }

    console.log(`[RSS Processor] Complete. Processed: ${processed}, Published: ${published}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        published,
        failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[RSS Processor] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function rewriteWithDeepSeek(
  title: string,
  content: string,
  sourceName: string,
  authorName: string,
  apiKey: string
): Promise<{
  title: string;
  content: string;
  seo_title: string;
  seo_description: string;
  excerpt: string;
  tags: string[];
  country: string | null;
  visa_type: string | null;
} | null> {
  const systemPrompt = `You are ${authorName}, a veteran travel and immigration journalist writing for Visas.Guide.

TASK: Rewrite this article in YOUR unique voice. Make it 100% original and undetectable as AI.

CRITICAL ANTI-AI DETECTION RULES:
- Write as if YOU personally researched and wrote this - use "I've found...", "In my experience...", "What I've noticed..."
- Use contractions naturally: you'll, don't, it's, can't, we're, there's, that's
- Start sentences with And, But, So, Plus, Now - real writers do this
- Include conversational asides in parentheses (readers love these touches)
- Mix paragraph lengths: some very short (1-2 sentences), others longer (4-5 sentences)
- Use em-dashes for emphasis—like this—instead of formal punctuation
- Ask rhetorical questions to engage readers: "So what does this mean for you?"
- Add personal observations: "Here's what caught my attention...", "The interesting part is..."
- Use specific details and numbers (not rounded estimates)
- AVOID bullet point lists - use flowing prose with embedded information instead
- NEVER use: "It is important to note", "Furthermore", "Additionally", "In conclusion", "One should", "It is worth mentioning", "It should be noted that", "Moving forward"
- Never start consecutive paragraphs with the same structure
- Vary sentence rhythm: short. Medium length ones. Then occasionally a longer, more complex sentence with multiple clauses.

CONTENT STRUCTURE (prose style, minimal headers):
- Hook with a compelling lead (answer the key question immediately)
- Context and background woven into flowing paragraphs
- Analysis and implications (what this means for travelers)
- Practical advice embedded naturally
- Strong close with actionable takeaway
- 600-800 words total

OUTPUT FORMAT (JSON only):
{
  "title": "Compelling headline (max 60 chars)",
  "content": "Full HTML article - use <h2> sparingly, mostly <p> paragraphs, avoid <ul>/<li> lists",
  "seo_title": "SEO title (max 60 chars)",
  "seo_description": "Meta description (max 160 chars)",
  "excerpt": "2-3 sentence hook summary",
  "tags": ["tag1", "tag2"],
  "country": "Country name or null",
  "visa_type": "Visa type or null"
}`;

  const userPrompt = `Rewrite this article completely in the voice of ${authorName}:

ORIGINAL:
Title: ${title}
Source: ${sourceName}
Content: ${content.substring(0, 4000)}

Remember: NO bullet points, write in flowing prose, make it sound like a real journalist wrote it. Return ONLY valid JSON.`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseContent = data.choices?.[0]?.message?.content;

      if (!responseContent) {
        throw new Error("Empty response from DeepSeek");
      }

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        title: result.title || title,
        content: result.content || content,
        seo_title: result.seo_title || result.title || title,
        seo_description: result.seo_description || result.excerpt || "",
        excerpt: result.excerpt || "",
        tags: Array.isArray(result.tags) ? result.tags : [],
        country: result.country || null,
        visa_type: result.visa_type || null,
      };

    } catch (error: any) {
      console.error(`[RSS Processor] DeepSeek attempt ${attempt + 1} failed:`, error.message);
      if (attempt === MAX_RETRIES - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  return null;
}

async function generateImage(
  title: string,
  country: string,
  visaType: string,
  apiKey: string
): Promise<string | null> {
  const prompt = `Create a professional news article featured image for a visa/immigration story.

Article: ${title}
${country ? `Country: ${country}` : ""}
${visaType ? `Visa type: ${visaType}` : ""}

Style: Clean editorial photo suitable for news website, subtle travel imagery, professional blues and whites, NO text overlay`;

  try {
    const response = await fetch(LOVABLE_AI_GATEWAY, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

  } catch (error: any) {
    console.error("[RSS Processor] Image generation error:", error.message);
    return null;
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100)
    .replace(/^-|-$/g, "");
}
