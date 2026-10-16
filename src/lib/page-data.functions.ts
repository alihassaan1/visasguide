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
  const { data } = await sb.from("countries").select("*").order("name");
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
        if (!reqs.error) out.push([["visa-requirements", country.id], reqs.data]);
        if (!times.error) out.push([["processing-times", country.id], times.data]);
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getCountryGuideData failed", e);
      return "[]";
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
      if (error) return "[]";
      return JSON.stringify([[["city", data.slug], city ?? null]]);
    } catch (e) {
      console.error("getCityPageData failed", e);
      return "[]";
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
        if (!r.error) {
          req = r.data;
          out.push([["visa-requirement", from.id, to.id], r.data ?? null]);
        }
      }
      if (!req && fromSlug && toSlug) {
        let page: unknown = null;
        for (const s of [`${fromSlug}-to-${toSlug}-visa-requirements`, `visa-requirements/${fromSlug}-to-${toSlug}`, `${fromSlug}-to-${toSlug}`]) {
          const r = await sb.from("content_pages").select("*").eq("slug", s).eq("is_published", true).maybeSingle();
          if (r.data && !r.error) { page = r.data; break; }
        }
        if (!page) {
          const r = await sb.from("content_pages").select("*")
            .ilike("slug", `%${fromSlug}%${toSlug}%visa%`).eq("is_published", true).limit(1).maybeSingle();
          if (r.data && !r.error) page = r.data;
        }
        out.push([["visa-content-page", fromSlug, toSlug], page]);
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getVisaRequirementData failed", e);
      return "[]";
    }
  });

export const getBlogArticleData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      const sb = publicClient();
      const out: Entry[] = [];
      const news = await sb.from("news_articles").select("*").eq("slug", data.slug).maybeSingle();
      if (news.error) return "[]";
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
        if (!r.error) out.push([["content-page-blog", data.slug], r.data ?? null]);
      }
      return JSON.stringify(out);
    } catch (e) {
      console.error("getBlogArticleData failed", e);
      return "[]";
    }
  });

export const getContentPageData = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<string> => {
    try {
      if (/-passport-visa-free-countries$/.test(data.slug)) return "[]";
      const sb = publicClient();
      const r = await sb.from("content_pages").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
      if (r.error || !r.data) return "[]";
      return JSON.stringify([[["content-page", data.slug], r.data]]);
    } catch (e) {
      console.error("getContentPageData failed", e);
      return "[]";
    }
  });
