import { SITE_URL } from "./constants";
import { articleStructuredData, breadcrumbStructuredData, type ArticleData, type BreadcrumbData } from "./seo-structured-data";

export interface PublicPageMeta {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  unavailable?: boolean;
  seoIndex?: boolean;
  breadcrumbs?: BreadcrumbData[];
  article?: ArticleData;
  faqs?: { question: string; answer: string }[];
}

export function publicHead(page?: PublicPageMeta) {
  const title = cleanMetaText(page?.title || "Visa Requirements and Travel Guides | visas.guide").replace(/Travel Travel Visa Requirements & eVisa Info/g, "Visa Requirements and Travel Guides | visas.guide");
  const description = cleanMetaText(page?.description || "This page is unavailable. Browse visa requirements and travel guides on visas.guide.");
  const url = page ? `${SITE_URL}${page.path}` : undefined;
  const indexable = !!page && !page.unavailable && page.seoIndex !== false;
  let image = page?.image?.startsWith("https://") ? page.image : undefined;
  if (image?.startsWith("https://images.unsplash.com/")) {
    const shareImage = new URL(image);
    shareImage.searchParams.set("w", "1200");
    shareImage.searchParams.set("h", "630");
    shareImage.searchParams.set("fit", "crop");
    shareImage.searchParams.set("q", "80");
    image = shareImage.toString();
  }
  return {
    meta: [
      { name: "visas:route-head", content: "true" },
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: page?.type || "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
      { name: "robots", content: indexable ? "index, follow, max-image-preview:large" : "noindex, follow" },
      { name: "googlebot", content: indexable ? "index, follow, max-image-preview:large" : "noindex, follow" },
      { name: "bingbot", content: indexable ? "index, follow" : "noindex, follow" },
      ...(url && !page?.unavailable ? [{ property: "og:url", content: url }] : []),
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ...(page?.article?.datePublished ? [{ property: "article:published_time", content: page.article.datePublished }] : []),
      ...(page?.article?.dateModified ? [{ property: "article:modified_time", content: page.article.dateModified }] : []),
    ],
    links: url && !page?.unavailable ? [{ rel: "canonical", href: url }] : [],
    scripts: page && !page.unavailable && url ? [
      { type: "application/ld+json", children: safeJson(breadcrumbStructuredData(page.breadcrumbs || defaultBreadcrumbs(page.path, title))) },
      ...(page.article ? [{ type: "application/ld+json", children: safeJson(articleStructuredData({ ...page.article, url, description, image: image || undefined })) }] : []),
      ...(page.faqs?.length ? [{ type: "application/ld+json", children: safeJson({ "@context": "https://schema.org", "@type": "FAQPage", url, mainEntity: page.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }) }] : []),
    ] : [],
  };
}

export function cleanMetaText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\b2025\b/g, "2026").replace(/[—–]/g, " ").replace(/\s+/g, " ").trim();
}

function defaultBreadcrumbs(path: string, title: string): BreadcrumbData[] {
  const names: Record<string, string> = { blog: "Blog", guides: "Guides", countries: "Countries", etias: "ETIAS", "visa-requirements": "Visa Requirements", "things-to-do": "Things to Do", "visa-types": "Visa Types" };
  const parts = path.split("/").filter(Boolean);
  const parent = parts.length > 1 && names[parts[0]] ? [{ name: names[parts[0]], url: parts[0] === "visa-requirements" ? "/visa-search" : parts[0] === "visa-types" ? "/visa-types/tourist" : `/${parts[0]}` }] : [];
  return [{ name: "Home", url: "/" }, ...parent, ...(path === "/" ? [] : [{ name: title.split("|")[0].trim(), url: path }])];
}

export function visaPairMeta(from: string, to: string, requirement?: { max_stay_days?: number | null; fee_usd?: number | null } | null) {
  const facts = [requirement?.max_stay_days != null ? `Stay up to ${requirement.max_stay_days} days.` : "", requirement?.fee_usd != null ? `Fee: US$${requirement.fee_usd}.` : ""].filter(Boolean).join(" ");
  let description = cleanMetaText(`${from} to ${to} visa requirements 2026. ${facts} Check entry rules, documents and application steps on visas.guide.`);
  for (const extra of [" Plan your trip.", " Review passport validity.", " Confirm rules before travel."]) {
    if (description.length >= 140) break;
    description += extra;
  }
  if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, "") + "...";
  return { title: `${from} to ${to} Visa Requirements 2026 | visas.guide`, description };
}

/** One canonical URL for each visa pair, including historical standalone slugs. */
export function canonicalVisaPath(slug: string) {
  return `/visa-requirements/${slug.replace(/^visa-requirements\//, "").replace(/-visa-requirements$/, "")}`;
}
function safeJson(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
