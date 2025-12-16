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
    const url = new URL(req.url);
    const submitToIndexNow = url.searchParams.get("indexnow") === "true";

    // Fetch all dynamic content in parallel
    const [
      { data: countries },
      { data: guides },
      { data: news },
      { data: contentPages },
      { data: visaRequirements },
      { data: cities }
    ] = await Promise.all([
      supabase.from("countries").select("slug, updated_at"),
      supabase.from("guides").select("slug, updated_at, published_at").not("published_at", "is", null),
      supabase.from("news_articles").select("slug, updated_at, published_at").not("published_at", "is", null),
      supabase.from("content_pages").select("slug, updated_at").eq("is_published", true),
      supabase.from("visa_requirements").select(`
        id, last_updated,
        from_country:countries!visa_requirements_from_country_id_fkey(slug),
        to_country:countries!visa_requirements_to_country_id_fkey(slug)
      `),
      supabase.from("cities").select(`
        slug, updated_at,
        country:countries!cities_country_id_fkey(slug)
      `)
    ]);

    // Static routes with priorities
    const staticRoutes = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/countries", priority: "0.9", changefreq: "daily" },
      { path: "/visa-search", priority: "0.9", changefreq: "daily" },
      { path: "/guides", priority: "0.8", changefreq: "daily" },
      { path: "/blog", priority: "0.8", changefreq: "hourly" },
      { path: "/passport-index", priority: "0.8", changefreq: "weekly" },
      { path: "/rss", priority: "0.4", changefreq: "monthly" },
      { path: "/feed", priority: "0.5", changefreq: "hourly" },
      { path: "/processing-times", priority: "0.7", changefreq: "weekly" },
      { path: "/requirements", priority: "0.7", changefreq: "weekly" },
      { path: "/visa-types/tourist-visa", priority: "0.8", changefreq: "weekly" },
      { path: "/visa-types/business-visa", priority: "0.8", changefreq: "weekly" },
      { path: "/visa-types/student-visa", priority: "0.7", changefreq: "weekly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/terms-of-service", priority: "0.3", changefreq: "monthly" },
      { path: "/cookie-policy", priority: "0.3", changefreq: "monthly" },
      { path: "/contact", priority: "0.5", changefreq: "monthly" },
    ];

    const now = new Date().toISOString().split("T")[0];
    const urlEntries: string[] = [];
    const allUrls: string[] = [];

    // Helper to add URL entry
    const addUrl = (path: string, lastmod: string, changefreq: string, priority: string) => {
      const fullUrl = `${BASE_URL}${path}`;
      allUrls.push(fullUrl);
      urlEntries.push(`  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    };

    // Add static URLs
    for (const route of staticRoutes) {
      addUrl(route.path, now, route.changefreq, route.priority);
    }

    // Countries and their sub-pages
    for (const c of countries || []) {
      const lastmod = (c.updated_at || now).split("T")[0];
      addUrl(`/countries/${c.slug}`, lastmod, "daily", "0.9");
      addUrl(`/countries/${c.slug}/visa-free`, lastmod, "weekly", "0.7");
    }

    // Guides
    for (const g of guides || []) {
      const lastmod = (g.updated_at || g.published_at || now).split("T")[0];
      addUrl(`/guides/${g.slug}`, lastmod, "monthly", "0.7");
    }

    // News/Blog articles
    for (const n of news || []) {
      const lastmod = (n.updated_at || n.published_at || now).split("T")[0];
      addUrl(`/blog/${n.slug}`, lastmod, "weekly", "0.6");
    }

    // Content pages (AI-generated and manual)
    for (const cp of contentPages || []) {
      const lastmod = (cp.updated_at || now).split("T")[0];
      // Content pages can have various slug formats
      const slug = cp.slug.startsWith("/") ? cp.slug.slice(1) : cp.slug;
      addUrl(`/${slug}`, lastmod, "weekly", "0.8");
    }

    // Visa requirements pages (country-to-country)
    const addedVisaReqPaths = new Set<string>();
    for (const vr of visaRequirements || []) {
      if (vr.from_country?.slug && vr.to_country?.slug) {
        const path = `/visa-requirements/${vr.from_country.slug}-to-${vr.to_country.slug}`;
        if (!addedVisaReqPaths.has(path)) {
          addedVisaReqPaths.add(path);
          const lastmod = (vr.last_updated || now).split("T")[0];
          addUrl(path, lastmod, "weekly", "0.7");
        }
      }
    }

    // City pages (country/city)
    for (const city of cities || []) {
      if (city.country?.slug && city.slug) {
        const lastmod = (city.updated_at || now).split("T")[0];
        addUrl(`/${city.country.slug}/${city.slug}`, lastmod, "weekly", "0.7");
      }
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

    // Submit to IndexNow if requested
    if (submitToIndexNow && allUrls.length > 0) {
      console.log(`Submitting ${allUrls.length} URLs to IndexNow...`);
      
      const INDEXNOW_KEY = "4e987242e9884f69b076157c7064eec3";
      const indexNowPayload = {
        host: "visas.guide",
        key: INDEXNOW_KEY,
        keyLocation: `https://visas.guide/${INDEXNOW_KEY}.txt`,
        urlList: allUrls.slice(0, 10000) // IndexNow limit
      };

      try {
        const indexNowResponse = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(indexNowPayload)
        });
        
        console.log(`IndexNow response: ${indexNowResponse.status}`);
      } catch (indexError) {
        console.error("IndexNow submission error:", indexError);
      }
    }

    console.log(`Sitemap generated with ${urlEntries.length} URLs`);

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
