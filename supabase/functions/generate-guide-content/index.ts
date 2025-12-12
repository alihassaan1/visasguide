import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GUIDES_TO_GENERATE = [
  {
    slug: "us-esta-application-guide",
    title: "US ESTA Application: Complete Step-by-Step Guide 2025",
    guide_type: "application",
    difficulty: "Medium"
  },
  {
    slug: "schengen-visa-requirements",
    title: "Schengen Visa Requirements: Complete Documents Checklist 2025",
    guide_type: "requirements",
    difficulty: "Hard"
  },
  {
    slug: "uk-visitor-visa-guide",
    title: "UK Visitor Visa: Processing Times and Success Tips 2025",
    guide_type: "application",
    difficulty: "Medium"
  },
  {
    slug: "canada-eta-vs-visitor-visa",
    title: "Canada eTA vs Visitor Visa: Which Do You Need in 2025?",
    guide_type: "comparison",
    difficulty: "Easy"
  },
  {
    slug: "australia-eta-application",
    title: "Australia ETA Application: Quick Guide for Tourists 2025",
    guide_type: "application",
    difficulty: "Easy"
  },
  {
    slug: "japan-tourist-visa-guide",
    title: "Japan Tourist Visa: Everything You Need to Know 2025",
    guide_type: "application",
    difficulty: "Medium"
  },
  {
    slug: "visa-rejection-reasons",
    title: "Common Visa Rejection Reasons and How to Avoid Them",
    guide_type: "tips",
    difficulty: "Medium"
  },
  {
    slug: "travel-insurance-requirements",
    title: "Travel Insurance Requirements by Country 2025",
    guide_type: "requirements",
    difficulty: "Easy"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get DeepSeek API key
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "deepseek_api_key")
      .single();

    const settingValue = settingsData?.setting_value;
    const deepseekApiKey = typeof settingValue === 'object' && settingValue?.key 
      ? settingValue.key 
      : settingValue;
    
    if (!deepseekApiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    const { batchSize = 3 } = await req.json().catch(() => ({}));
    
    // Check which guides already exist
    const { data: existingGuides } = await supabase
      .from("guides")
      .select("slug");
    
    const existingSlugs = new Set(existingGuides?.map(g => g.slug) || []);
    const guidesToCreate = GUIDES_TO_GENERATE.filter(g => !existingSlugs.has(g.slug)).slice(0, batchSize);

    if (guidesToCreate.length === 0) {
      return new Response(
        JSON.stringify({ message: "All guides already exist", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${guidesToCreate.length} guides`);
    const results: any[] = [];

    for (const guide of guidesToCreate) {
      try {
        console.log(`Generating: ${guide.title}`);

        const prompt = `Write a comprehensive visa guide article titled "${guide.title}".

Requirements:
- Write 800-1000 words in conversational, human style
- Use contractions (you'll, don't, isn't)
- Include practical tips with "Pro tip:" callouts
- Add personal touches like "Here's the good news..."
- Structure with clear HTML headings (h2, h3)
- Include bullet points for requirements/documents
- Add a FAQ section with 3-4 common questions
- Make it SEO-optimized for the topic
- DO NOT use phrases like "It is important to note", "Furthermore", "In conclusion"

Return ONLY valid JSON:
{
  "content": "<article HTML content here>",
  "excerpt": "<150 char summary>",
  "seo_title": "<60 char SEO title>",
  "seo_description": "<160 char meta description>",
  "read_time_minutes": <number>
}`;

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${deepseekApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "You are a travel and visa expert content writer. Return only valid JSON." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`DeepSeek error for ${guide.slug}:`, response.status, errorText);
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`No JSON found for ${guide.slug}`);
          continue;
        }

        const guideData = JSON.parse(jsonMatch[0]);

        // Insert into guides table
        const { error: insertError } = await supabase
          .from("guides")
          .insert({
            slug: guide.slug,
            title: guide.title,
            content: guideData.content,
            excerpt: guideData.excerpt,
            guide_type: guide.guide_type,
            difficulty: guide.difficulty,
            seo_title: guideData.seo_title,
            seo_description: guideData.seo_description,
            read_time_minutes: guideData.read_time_minutes || 8,
            is_featured: ["us-esta-application-guide", "schengen-visa-requirements", "uk-visitor-visa-guide"].includes(guide.slug),
            published_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Insert error for ${guide.slug}:`, insertError);
          continue;
        }

        results.push({ slug: guide.slug, success: true });

        // Log API usage
        await supabase.from("api_logs").insert({
          api_provider: "deepseek",
          task_type: "guide_generation",
          entity_name: guide.slug,
          status: "success",
          tokens_used: data.usage?.total_tokens || 0,
          input_tokens: data.usage?.prompt_tokens || 0,
          output_tokens: data.usage?.completion_tokens || 0,
        });

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`Error generating ${guide.slug}:`, err);
        results.push({ slug: guide.slug, success: false, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Generated ${results.filter(r => r.success).length} guides`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Guide generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
