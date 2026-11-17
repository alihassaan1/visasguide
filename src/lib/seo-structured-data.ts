import { SITE_URL } from "./constants";

export interface BreadcrumbData { name: string; url: string }
export interface ArticleData {
  title: string;
  url?: string;
  description?: string;
  image?: string;
  authorName?: string | null;
  authorUrl?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
}

export function breadcrumbStructuredData(items: BreadcrumbData[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.url, SITE_URL).href })) };
}

export function articleStructuredData(article: ArticleData) {
  return {
    "@context": "https://schema.org", "@type": "Article", headline: article.title,
    description: article.description, url: article.url,
    ...(article.image ? { image: article.image } : {}),
    ...(article.authorName ? { author: { "@type": "Person", name: article.authorName, ...(article.authorUrl ? { url: article.authorUrl } : {}) } } : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    publisher: { "@type": "Organization", name: "visas.guide", url: SITE_URL },
    inLanguage: "en", isAccessibleForFree: true,
  };
}

/** Only mark up questions and answers that are actually in rendered article HTML. */
export function visibleArticleFaqs(html: string) {
  const faqs: { question: string; answer: string }[] = [];
  const text = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  for (const match of html.matchAll(/<h[2-6]\b[^>]*>((?:(?!<\/h[2-6]>)[\s\S])*?\?)\s*<\/h[2-6]>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const question = text(match[1]);
    const answer = text(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}