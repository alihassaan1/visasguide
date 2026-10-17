import { SITE_URL } from "./constants";

export interface PublicPageMeta {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  unavailable?: boolean;
}

export function publicHead(page?: PublicPageMeta) {
  const title = (page?.title || "Page unavailable | Visas.Guide").replace(/\s*[—–]\s*/g, " | ");
  const description = page?.description || "This page is unavailable. Browse visa requirements and travel guides on Visas.Guide.";
  const url = page ? `${SITE_URL}${page.path}` : undefined;
  const image = page?.image?.startsWith("https://") ? page.image : undefined;
  return {
    meta: [
      { name: "visas:route-head", content: "true" },
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: page?.type || "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
      { name: "robots", content: page && !page.unavailable ? "index, follow, max-image-preview:large" : "noindex, follow" },
      { name: "googlebot", content: page && !page.unavailable ? "index, follow, max-image-preview:large" : "noindex, follow" },
      { name: "bingbot", content: page && !page.unavailable ? "index, follow" : "noindex, follow" },
      ...(url && !page?.unavailable ? [{ property: "og:url", content: url }] : []),
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    ],
    links: url && !page?.unavailable ? [{ rel: "canonical", href: url }] : [],
  };
}

/** One canonical URL for each visa pair, including historical standalone slugs. */
export function canonicalVisaPath(slug: string) {
  return `/visa-requirements/${slug.replace(/^visa-requirements\//, "").replace(/-visa-requirements$/, "")}`;
}