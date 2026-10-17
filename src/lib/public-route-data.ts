import { notFound, redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { getBlogArticleData, getCityPageData, getContentPageData, getCountryGuideData, getPublicListingData, getVisaRequirementData } from "./page-data.functions";
import { seedQueries } from "./seedQueries";
import { canonicalVisaPath, type PublicPageMeta } from "./public-seo";

import { getCountryHeroImage } from "./country-hero-images";

type Row = Record<string, any>;
export async function loadPublicDetail(qc: QueryClient, kind: string, slug: string, countrySlug?: string): Promise<PublicPageMeta> {
  if (kind === "visa" && slug.endsWith("-visa-requirements")) throw redirect({ href: canonicalVisaPath(slug), statusCode: 301 });
  if (kind === "content" && /-to-.+-visa-requirements$/.test(slug)) throw redirect({ href: canonicalVisaPath(slug), statusCode: 301 });
  const functions = { visa: getVisaRequirementData, country: getCountryGuideData, city: getCityPageData, blog: getBlogArticleData, content: getContentPageData };
  const fn = functions[kind as keyof typeof functions];
  seedQueries(qc, fn ? await fn({ data: { slug } }) : await getPublicListingData({ data: { kind, slug } }));
  const row = (key: readonly unknown[]) => qc.getQueryData<Row | null>(key);
  const countries = qc.getQueryData<Row[]>(["shared", "countries"]) || [];
  if (kind === "visa") {
    const [fromSlug, toSlug] = slug.split("-to-");
    const from = countries.find(c => c.slug === fromSlug);
    const to = countries.find(c => c.slug === toSlug);
    if (!from || !to || (!row(["visa-requirement", from.id, to.id]) && !row(["visa-content-page", fromSlug, toSlug]))) throw notFound();
    return { title: `${to.name} Visa Requirements for ${from.name} Citizens`, description: `Complete visa requirements guide for ${from.name} passport holders traveling to ${to.name}. Get up-to-date information on visa types, processing times, fees, and required documents.`, path: canonicalVisaPath(slug) };
  }
  if (kind === "country") {
    const country = countries.find(c => c.slug === slug);
    if (!country) throw notFound();
    const guide = row(["country-guide-content", slug]);
    return { title: guide?.meta_title || `${country.name} Visa Requirements 2026 | Entry Guide & Requirements`, description: guide?.meta_description || `Do you need a visa for ${country.name}? Complete entry requirements, visa types, application process and processing times.`, image: getCountryHeroImage(slug), path: `/countries/${slug}` };
  }
  if (kind === "city") {
    const city = row(["city", slug]);
    if (!city || city.country?.slug !== countrySlug) throw notFound();
    return { title: city.meta_title || `${city.name}, ${city.country.name} | Tours, Activities & Travel Guide`, description: city.meta_description || `Discover the best tours and activities in ${city.name}, ${city.country.name}. Book experiences, explore attractions, and plan your perfect trip.`, image: city.hero_image_url, path: `/${countrySlug}/${slug}` };
  }
  if (kind === "content" && slug.endsWith("-passport-visa-free-countries")) {
    const passport = countries.find(c => c.slug === slug.replace(/-passport-visa-free-countries$/, ""));
    if (!passport) throw notFound();
    return { title: `${passport.name} Passport Visa-Free Countries 2026 | Full List | Visas.Guide`, description: `Complete 2026 list of visa-free, visa-on-arrival, and eVisa countries for ${passport.name} passport holders.`, path: `/${slug}` };
  }
  if (kind === "author") {
    const author = qc.getQueryData<Row[]>(["shared", "authors"])?.find(a => a.slug === slug && a.is_active);
    if (!author) throw notFound();
    return { title: `${author.name} | ${author.role} | Visas Guide`, description: author.bio || `Read visa and travel articles by ${author.name}.`, path: `/author/${slug}` };
  }
  if (kind === "etias-country") {
    const page = row(["etias-country", slug]);
    if (!page) throw notFound();
    return { title: page.seo_title || `ETIAS for ${page.nationality} Citizens | 2026 Guide`, description: page.seo_description || `ETIAS eligibility, application steps and processing information for ${page.nationality} passport holders.`, image: page.featured_image_url, path: `/etias/for/${slug}` };
  }
  const page = kind === "blog" ? row(["news-article", slug]) || row(["content-page-blog", slug]) : row([kind === "guide" ? "guide" : "content-page", slug]);
  if (!page) throw notFound();
  return { title: page.meta_title || page.seo_title || `${page.title} | Visas.Guide`, description: page.meta_description || page.seo_description || page.excerpt || `Read ${page.title} on Visas.Guide.`, image: page.featured_image_url, type: "article", path: kind === "content" ? `/${slug}` : `/${kind === "guide" ? "guides" : "blog"}/${slug}` };
}