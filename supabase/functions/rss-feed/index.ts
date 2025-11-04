import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = "https://visas.guide";
const SITE_TITLE = "Visas.Guide";
const SITE_DESCRIPTION = "Complete visa information, requirements, and news for global travel";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch published content and news
    const [{ data: contentPages }, { data: newsArticles }] = await Promise.all([
      supabase
        .from("content_pages")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("news_articles")
        .select("*")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(50),
    ]);

    // Combine and sort all items by date
    const allItems = [
      ...(contentPages || []).map((page) => ({
        title: page.title,
        link: `${BASE_URL}/${page.slug}`,
        description: page.meta_description || page.excerpt || "",
        pubDate: new Date(page.created_at),
        guid: `${BASE_URL}/${page.slug}`,
        category: "Guide",
      })),
      ...(newsArticles || []).map((article) => ({
        title: article.title,
        link: `${BASE_URL}/news/${article.slug}`,
        description: article.seo_description || article.excerpt || "",
        pubDate: new Date(article.published_at),
        guid: `${BASE_URL}/news/${article.slug}`,
        category: "News",
      })),
    ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    // Generate RSS XML
    const rssItems = allItems
      .map((item) => {
        const escapedTitle = escapeXml(item.title);
        const escapedDescription = escapeXml(item.description);
        const escapedLink = escapeXml(item.link);
        
        return `  <item>
    <title>${escapedTitle}</title>
    <link>${escapedLink}</link>
    <guid isPermaLink="true">${item.guid}</guid>
    <description>${escapedDescription}</description>
    <pubDate>${item.pubDate.toUTCString()}</pubDate>
    <category>${item.category}</category>
  </item>`;
      })
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${BASE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/favicon.png</url>
      <title>${SITE_TITLE}</title>
      <link>${BASE_URL}</link>
    </image>
${rssItems}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      },
      status: 200,
    });
  } catch (e) {
    console.error("RSS feed generation error:", e);
    return new Response("RSS feed generation failed", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
      status: 500,
    });
  }
});

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
