import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-side prefetch for public content pages. Each function returns
 * [queryKey, data] pairs that the route loader seeds into the React Query
 * cache under the SAME keys the page components use, so the page's content
 * is present in the server-rendered HTML.
 */

// Public (publishable) project values — same as the browser client.
const FALLBACK_URL = "https://awiytryceqehqapytfgn.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I";

type Entry = [readonly unknown[], unknown];

function publicClient() {
  const url = process.env["SUPABASE_URL"] || FALLBACK_URL;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || FALLBACK_KEY;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function loadCountries(sb: ReturnType<typeof publicClient>) {
  const { data, error } = await sb.from("countries").select("*").order("name");
  if (error) throw error;
  return data || [];
}

const COUNTRIES_KEY = ["shared", "countries"] as const;

const slugInput = (d: unknown) => {
  const v = d as { slug?: unknown };
  return { slug: String(v?.slug ?? "").slice(0, 300) };
};

export const getCountryGuideData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      const sb = publicClient();
      const countries = await loadCountries(sb);
      const out: Entry[] = [[COUNTRIES_KEY, countries]];
      const guide = await sb
        .from("content_pages").select("*")
        .eq("slug", `countries/${data.slug}`).eq("is_published", true).maybeSingle();
      if (guide.error) throw guide.error;
      out.push([["country-guide-content", data.slug], guide.data ?? null]);
      const country = countries.find((c) => c.slug === data.slug);
      if (country) {
        const [reqs, times] = await Promise.all([
          sb.from("visa_requirements").select(`
            *,
            from_country:countries!visa_requirements_from_country_id_fkey(name, code, flag_emoji, slug),
            to_country:countries!visa_requirements_to_country_id_fkey(name, code, flag_emoji)
          `).eq("to_country_id", country.id),
          sb.from("processing_times").select("*").eq("country_id", country.id),
        ]);
        if (reqs.error) throw reqs.error;
        if (times.error) throw times.error;
        out.push([["visa-requirements", country.id], reqs.data]);
        out.push([["processing-times", country.id], times.data]);
        if (!country.visa_free_destinations) {
          const result = await sb.from("visa_requirements").select("id", { count: "exact", head: true }).eq("from_country_id", country.id).in("requirement_type", ["visa_free", "visa_on_arrival", "eTA_required", "evisa_required"]);
          if (result.error) throw result.error;
          out.push([["visa-free-count", country.id], result.count || 0]);
        }
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getCountryGuideData failed", e);
      throw e;
    }
  });

export const getCityPageData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      const sb = publicClient();
      const { data: city, error } = await sb
        .from("cities")
        .select(`
          *,
          country:countries(id, name, slug, flag_emoji, code)
        `)
        .eq("slug", data.slug).maybeSingle();
      if (error) throw error;
      return JSON.stringify([[["city", data.slug], city ?? null]]);
    } catch (e) {
      console.error("getCityPageData failed", e);
      throw e;
    }
  });

export const getVisaRequirementData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      const sb = publicClient();
      const normalized = data.slug.replace(/-visa-requirements$/, "");
      const [fromSlug, toSlug] = normalized.split("-to-");
      const countries = await loadCountries(sb);
      const out: Entry[] = [[COUNTRIES_KEY, countries]];
      const from = countries.find((c) => c.slug === fromSlug);
      const to = countries.find((c) => c.slug === toSlug);
      let req: unknown = null;
      if (from && to) {
        const r = await sb.from("visa_requirements").select("*")
          .eq("from_country_id", from.id).eq("to_country_id", to.id).maybeSingle();
        if (r.error) throw r.error;
        {
          req = r.data;
          out.push([["visa-requirement", from.id, to.id], r.data ?? null]);
        }
      }
      if (fromSlug && toSlug) {
        let page: unknown = null;
        for (const s of [`${fromSlug}-to-${toSlug}-visa-requirements`, `visa-requirements/${fromSlug}-to-${toSlug}`, `${fromSlug}-to-${toSlug}`]) {
          const r = await sb.from("content_pages").select("*").eq("slug", s).eq("is_published", true).maybeSingle();
          if (r.error) throw r.error;
          if (r.data && !r.error) { page = r.data; break; }
        }
        if (!page) {
          const r = await sb.from("content_pages").select("*")
            .ilike("slug", `%${fromSlug}%${toSlug}%visa%`).eq("is_published", true).limit(1).maybeSingle();
          if (r.error) throw r.error;
          if (r.data && !r.error) page = r.data;
        }
        out.push([["visa-content-page", fromSlug, toSlug], page]);
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getVisaRequirementData failed", e);
      throw e;
    }
  });

export const getBlogArticleData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      const sb = publicClient();
      const out: Entry[] = [];
      const news = await sb.from("news_articles").select("*").eq("slug", data.slug).maybeSingle();
      if (news.error) throw news.error;
      out.push([["news-article", data.slug], news.data ?? null]);
      if (news.data) {
        const cats = news.data.categories;
        let related: unknown[] = [];
        if (cats && cats.length) {
          const r = await sb.from("news_articles").select("*")
            .neq("id", news.data.id).overlaps("categories", cats)
            .not("published_at", "is", null).order("published_at", { ascending: false }).limit(3);
          if (!r.error) related = r.data || [];
        }
        out.push([["related-articles", cats], related]);
      } else {
        const sel = `*, writer:authors(name, slug, avatar_url, bio)`;
        let r = await sb.from("content_pages").select(sel).eq("slug", data.slug).eq("is_published", true).maybeSingle();
        if (!r.data) r = await sb.from("content_pages").select(sel).eq("slug", `blog/${data.slug}`).eq("is_published", true).maybeSingle();
        if (r.error) throw r.error;
        out.push([["content-page-blog", data.slug], r.data ?? null]);
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getBlogArticleData failed", e);
      throw e;
    }
  });

export const getContentPageData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      if (/-passport-visa-free-countries$/.test(data.slug)) {
        const sb = publicClient();
        const countries = await loadCountries(sb);
        const passport = countries.find(c => c.slug === data.slug.replace(/-passport-visa-free-countries$/, ""));
        if (!passport) return JSON.stringify([[COUNTRIES_KEY, countries]]);
        const { data: reqs, error } = await sb.from("visa_requirements").select("to_country_id,requirement_type").eq("from_country_id", passport.id);
        if (error) throw error;
        return JSON.stringify([[COUNTRIES_KEY, countries], [["passport-requirements", passport.slug], reqs || []]]);
      }
      const sb = publicClient();
      const r = await sb.from("content_pages").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
      if (r.error) throw r.error;
      if (!r.data) return "[]";
      return JSON.stringify([[["content-page", data.slug], r.data]]);
    } catch (e) {
      console.error("getContentPageData failed", e);
      throw e;
    }
  });

/** Additional public route families. No privileged credentials or request-time writes. */
export const getPublicListingData = createServerFn({ method: "GET" })
  .inputValidator((input: { kind: string; slug?: string; country?: string; changeType?: string; severity?: string }) => ({
    kind: String(input.kind).slice(0, 50), slug: String(input.slug || "").slice(0, 300),
    country: String(input.country || "all").slice(0, 100), changeType: String(input.changeType || "all").slice(0, 100), severity: String(input.severity || "all").slice(0, 50),
  }))
  .handler(async ({ data }): Promise<string> => {
    const sb = publicClient();
    const out: Entry[] = [];
    async function add(key: readonly unknown[], query: PromiseLike<{ data: unknown; error: unknown }>) {
      const result = await query;
      if (result.error) { console.error("Public page query failed", result.error); throw new Error("Public content is temporarily unavailable"); }
      out.push([key, result.data ?? []]);
    }
    if (["countries", "passport-index", "home", "blog", "policy", "country"].includes(data.kind)) {
      out.push([COUNTRIES_KEY, await loadCountries(sb)]);
    }
    if (["countries", "home"].includes(data.kind)) await add(["shared", "search_stats"], sb.from("search_stats").select("country_id,search_count,page_view_count"));
    if (data.kind === "guides") await add(["visa-guides"], sb.from("guides").select("*").not("published_at", "is", null).order("published_at", { ascending: false }));
    if (data.kind === "guide") {
      const result = await sb.from("guides").select("*").eq("slug", data.slug).not("published_at", "is", null).maybeSingle();
      if (result.error) throw result.error;
      out.push([["guide", data.slug], result.data]);
      if (result.data) await add(["related-guides", result.data.guide_type], sb.from("guides").select("id,title,slug,guide_type,difficulty,read_time_minutes").neq("slug", data.slug).not("published_at", "is", null).limit(3));
    }
    if (data.kind === "blog") {
      await Promise.all([
        add(["news-articles", ""], sb.from("news_articles").select("id,title,slug,excerpt,featured_image_url,published_at,created_at,categories,source_url").not("published_at", "is", null).order("published_at", { ascending: false })),
        add(["blog-posts", ""], sb.from("content_pages").select("id,title,slug,excerpt,featured_image_url,created_at,keywords").like("slug", "blog/%").eq("is_published", true).order("created_at", { ascending: false })),
        add(["most-read-blog"], sb.from("content_pages").select("id,title,slug,featured_image_url,view_count").eq("is_published", true).not("view_count", "is", null).order("view_count", { ascending: false }).limit(5)),
      ]);
      for (const entry of out) {
        if (entry[0][0] === "news-articles") entry[1] = (entry[1] as Record<string, unknown>[]).map(a => ({ ...a, type: "news" }));
        if (entry[0][0] === "blog-posts") entry[1] = (entry[1] as Record<string, unknown>[]).map(a => ({ ...a, published_at: a.created_at, categories: a.keywords, source_url: null, type: "blog" }));
      }
    }
    if (data.kind === "home") {
      await add(["latest-news-home"], sb.from("news_articles").select("id,title,slug,excerpt,featured_image_url,published_at,categories,writer:authors(name,slug)").not("published_at", "is", null).eq("status", "published").order("published_at", { ascending: false }).limit(4));
      const fields = "id,title,slug,excerpt,featured_image_url,updated_at,view_count,is_featured,writer:authors(name,slug,avatar_url)";
      const featured = await sb.from("content_pages").select(fields).eq("is_published", true).eq("is_featured", true).order("featured_at", { ascending: false }).limit(6);
      if (featured.error) throw featured.error;
      const rows = featured.data || [];
      if (rows.length < 6) {
        let q = sb.from("content_pages").select(fields).eq("is_published", true).order("updated_at", { ascending: false }).limit(6 - rows.length);
        if (rows.length) q = q.not("id", "in", `(${rows.map(r => r.id).join(",")})`);
        const latest = await q;
        if (latest.error) throw latest.error;
        rows.push(...(latest.data || []));
      }
      out.push([["latest-guides-home"], rows]);
    }
    if (data.kind === "etias-country") {
      const result = await sb.from("etias_country_pages").select("*").eq("country_slug", data.slug).eq("is_published", true).maybeSingle();
      if (result.error) throw result.error;
      out.push([["etias-country", data.slug], result.data]);
    }
    if (data.kind === "etias-news") await add(["etias-news"], sb.from("news_articles").select("id,slug,title,excerpt,featured_image_url,published_at").contains("tags", ["etias"]).not("published_at", "is", null).order("published_at", { ascending: false }).limit(50));
    if (data.kind === "author") {
      const authors = await sb.from("authors").select("*").order("name");
      if (authors.error) throw authors.error;
      out.push([["shared", "authors"], authors.data || []]);
      const author = authors.data?.find(a => a.slug === data.slug && a.is_active);
      if (author) await Promise.all([
        add(["author-content", author.id], sb.from("content_pages").select("id,title,slug,excerpt,created_at,featured_image_url").eq("writer_id", author.id).eq("is_published", true).order("created_at", { ascending: false }).limit(20)),
        add(["author-news", author.id], sb.from("news_articles").select("id,title,slug,excerpt,created_at,featured_image_url").eq("writer_id", author.id).eq("status", "published").order("created_at", { ascending: false }).limit(20)),
      ]);
    }
    if (data.kind === "policy") {
      let q = sb.from("visa_policy_changes").select("*, countries(name,slug,flag_emoji), news_articles(slug)").eq("is_published", true).order("announcement_date", { ascending: false }).limit(100);
      const countries = out.find(e => e[0][0] === "shared")?.[1] as Awaited<ReturnType<typeof loadCountries>>;
      const country = countries?.find(c => c.slug === data.country);
      if (country) q = q.eq("country_id", country.id);
      if (data.changeType !== "all") q = q.eq("change_type", data.changeType as never);
      if (data.severity !== "all") q = q.eq("severity", data.severity as never);
      await add(["policy-updates-public", data.country, data.changeType, data.severity], q);
    }
    return JSON.stringify(out);
  });
