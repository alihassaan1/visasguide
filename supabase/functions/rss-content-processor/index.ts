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
        console.log(`[RSS Processor] Processing: ${item.original_title.substring(0, 50)}...`);

        // Update status to processing
        await supabase
          .from("rss_article_queue")
          .update({ status: "rewriting", processed_at: new Date().toISOString() })
          .eq("id", item.id);

        // Rewrite content with DeepSeek
        const rewriteResult = await rewriteWithDeepSeek(
          item.original_title,
          item.original_content || "",
          item.source_name || "Unknown",
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
            // Continue without image
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

        // Create news article
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

        // Log failed API call
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
  const systemPrompt = `You are a veteran visa and immigration journalist for Visas.Guide with 10+ years of experience.

TASK: Completely rewrite this article to be 100% original and human-written.

ANTI-AI DETECTION RULES (Critical):
- Write like an experienced journalist, not an AI
- Use contractions ALWAYS: you'll, don't, it's, can't, won't, there's
- Start some sentences with And, But, So, Plus - natural writers do this
- Include parenthetical asides (like this) and dashes for conversational tone
- Vary paragraph lengths dramatically - some 1 sentence, some 4-5 sentences
- Use journalistic phrases: "sources say", "according to officials", "what this means for travelers"
- Add analysis and context a human journalist would provide
- FORBIDDEN: "It is important to note", "Furthermore", "Additionally", "In conclusion", "One should", "It should be noted"
- Never start 2+ consecutive paragraphs with the same word pattern
- Include specific quotes or data points when possible
- Use rhetorical questions to engage readers

STRUCTURE:
- Strong headline that hooks readers
- Lead paragraph that answers who/what/when/where
- Body with context and implications
- Practical takeaways for travelers
- Length: 600-800 words

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Engaging headline (max 60 chars)",
  "content": "Full HTML article with <h2>, <h3>, <p>, <ul> tags and Tailwind spacing",
  "seo_title": "SEO title (max 60 chars)",
  "seo_description": "Meta description (max 160 chars)",
  "excerpt": "2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"],
  "country": "Country name or null",
  "visa_type": "Visa type or null"
}`;

  const userPrompt = `ORIGINAL ARTICLE:
Title: ${title}
Source: ${sourceName}
Content: ${content.substring(0, 4000)}

Rewrite this article completely. Return ONLY valid JSON.`;

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
          temperature: 0.7,
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

      // Parse JSON from response
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
  const prompt = `Create a professional news article featured image for a visa/immigration news story.

Article title: ${title}
${country ? `Country: ${country}` : ""}
${visaType ? `Visa type: ${visaType}` : ""}

Requirements:
- Modern, clean design suitable for news website
- Include subtle travel/visa imagery (passport, stamps, landmarks)
- Use professional color palette (blues, whites, teals)
- Style: Professional news media, photorealistic
- DO NOT include any text overlay`;

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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    return imageUrl || null;

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
