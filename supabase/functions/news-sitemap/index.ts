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
const SITE_NAME = "Visas.Guide";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch news articles published in the last 2 days (Google News requirement)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: newsArticles, error } = await supabase
      .from("news_articles")
      .select(`
        slug,
        title,
        published_at,
        seo_title,
        tags,
        author:authors!news_articles_writer_id_fkey(name)
      `)
      .eq("status", "published")
      .not("published_at", "is", null)
      .gte("published_at", twoDaysAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching news articles:", error);
      throw error;
    }

    // Also fetch recent content pages that are news-worthy
    const { data: contentPages } = await supabase
      .from("content_pages")
      .select(`
        slug,
        title,
        updated_at,
        meta_title,
        keywords,
        author:authors!content_pages_writer_id_fkey(name)
      `)
      .eq("is_published", true)
      .gte("updated_at", twoDaysAgo.toISOString())
      .order("updated_at", { ascending: false })
      .limit(500);

    const escapeXml = (str: string): string => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const urlEntries: string[] = [];

    // Add news articles
    for (const article of newsArticles || []) {
      const pubDate = new Date(article.published_at).toISOString();
      const title = escapeXml(article.seo_title || article.title);
      const keywords = article.tags?.slice(0, 5).join(", ") || "visa, travel, immigration";

      urlEntries.push(`  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`);
    }

    // Add content pages as news items
    for (const page of contentPages || []) {
      const pubDate = new Date(page.updated_at).toISOString();
      const title = escapeXml(page.meta_title || page.title);
      const keywords = page.keywords?.slice(0, 5).join(", ") || "visa, travel, guide";
      const slug = page.slug.startsWith("/") ? page.slug.slice(1) : page.slug;

      urlEntries.push(`  <url>
    <loc>${BASE_URL}/${slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`);
    }

    const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries.join("\n")}
</urlset>`;

    console.log(`News sitemap generated with ${urlEntries.length} URLs`);

    return new Response(newsSitemapXml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
      status: 200,
    });
  } catch (e) {
    console.error("News sitemap generation error:", e);
    return new Response("News sitemap generation failed", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
      status: 500,
    });
  }
});
