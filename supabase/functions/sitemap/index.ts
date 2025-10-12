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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch dynamic content
    const [{ data: countries }, { data: guides }, { data: news }] = await Promise.all([
      supabase.from("countries").select("slug, updated_at"),
      supabase.from("guides").select("slug, updated_at, published_at").not("published_at", "is", null),
      supabase.from("news_articles").select("slug, updated_at, published_at").not("published_at", "is", null),
    ]);

    // Static routes
    const staticPaths = [
      "/",
      "/countries",
      "/visa-search",
      "/guides",
      "/news",
      "/passport-rankings",
      "/processing-times",
      "/requirements",
      "/privacy-policy",
      "/terms-of-service",
      "/cookie-policy",
      "/contact",
      "/visa-types/tourist-visa",
      "/visa-types/business-visa",
      "/visa-types/student-visa",
    ];

    const now = new Date().toISOString().split("T")[0];

    const urlEntries: string[] = [];

    // Add static URLs
    for (const path of staticPaths) {
      urlEntries.push(`  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${path === "/" ? "1.0" : "0.7"}</priority>\n  </url>`);
    }

    // Countries and their visa-free pages
    for (const c of countries || []) {
      urlEntries.push(`  <url>\n    <loc>${BASE_URL}/countries/${c.slug}</loc>\n    <lastmod>${(c.updated_at || now).split("T")[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`);
      urlEntries.push(`  <url>\n    <loc>${BASE_URL}/countries/${c.slug}/visa-free</loc>\n    <lastmod>${(c.updated_at || now).split("T")[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
    }

    // Guides
    for (const g of guides || []) {
      urlEntries.push(`  <url>\n    <loc>${BASE_URL}/guides/${g.slug}</loc>\n    <lastmod>${(g.updated_at || g.published_at || now).split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
    }

    // News
    for (const n of news || []) {
      urlEntries.push(`  <url>\n    <loc>${BASE_URL}/news/${n.slug}</loc>\n    <lastmod>${(n.updated_at || n.published_at || now).split("T")[0]}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.5</priority>\n  </url>`);
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>`;

    return new Response(sitemapXml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
      status: 200,
    });
  } catch (e) {
    console.error("Sitemap generation error", e);
    return new Response("Sitemap generation failed", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
      status: 500,
    });
  }
});
