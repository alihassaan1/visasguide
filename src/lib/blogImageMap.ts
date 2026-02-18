// Local fallback images for blog posts when featured_image_url is broken (e.g. deprecated unsplash URLs)
import jamaicaImg from "@/assets/blog/jamaica.jpg";
import domRepImg from "@/assets/blog/dominican-republic.jpg";
import cubaImg from "@/assets/blog/cuba.jpg";
import bangladeshImg from "@/assets/blog/bangladesh.jpg";
import pakistanImg from "@/assets/destinations/pakistan.jpg";
import nepalImg from "@/assets/blog/nepal.jpg";
import sriLankaImg from "@/assets/blog/sri-lanka.jpg";
import maldivesImg from "@/assets/blog/maldives.jpg";
import hongKongImg from "@/assets/blog/hong-kong.jpg";
import taiwanImg from "@/assets/blog/taiwan.jpg";
import chinaImg from "@/assets/blog/china.jpg";
import russiaImg from "@/assets/blog/russia.jpg";
import franceImg from "@/assets/destinations/france.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";
import uaeImg from "@/assets/destinations/uae.jpg";
import singaporeImg from "@/assets/destinations/singapore.jpg";
import thailandImg from "@/assets/destinations/thailand.jpg";
import southKoreaImg from "@/assets/destinations/south-korea.jpg";
import indonesiaImg from "@/assets/destinations/indonesia.jpg";
import malaysiaImg from "@/assets/destinations/malaysia.jpg";
import ukImg from "@/assets/blog/uk.jpg";
import australiaImg from "@/assets/blog/australia.jpg";
import germanyImg from "@/assets/blog/germany.jpg";
import defaultVisaImg from "@/assets/blog/default-visa.jpg";

const blogImageMap: Record<string, string> = {
  jamaica: jamaicaImg,
  "dominican-republic": domRepImg,
  cuba: cubaImg,
  bangladesh: bangladeshImg,
  pakistan: pakistanImg,
  nepal: nepalImg,
  "sri-lanka": sriLankaImg,
  maldives: maldivesImg,
  "hong-kong": hongKongImg,
  taiwan: taiwanImg,
  china: chinaImg,
  russia: russiaImg,
  schengen: franceImg,
  japan: japanImg,
  canada: canadaImg,
  dubai: uaeImg,
  uae: uaeImg,
  singapore: singaporeImg,
  thailand: thailandImg,
  "south-korea": southKoreaImg,
  korea: southKoreaImg,
  indonesia: indonesiaImg,
  bali: indonesiaImg,
  malaysia: malaysiaImg,
  uk: ukImg,
  "united-kingdom": ukImg,
  australia: australiaImg,
  germany: germanyImg,
  "new-zealand": australiaImg,
  vietnam: thailandImg,
  "saudi-arabia": uaeImg,
  brazil: jamaicaImg,
  egypt: bangladeshImg,
  india: nepalImg,
  turkey: russiaImg,
  morocco: bangladeshImg,
  greece: franceImg,
  portugal: franceImg,
  ireland: ukImg,
  mexico: cubaImg,
  "costa-rica": domRepImg,
  philippines: indonesiaImg,
  kenya: bangladeshImg,
  "south-africa": bangladeshImg,
  argentina: domRepImg,
  chile: domRepImg,
  peru: nepalImg,
  colombia: jamaicaImg,
  us: defaultVisaImg,
};

/**
 * Get a local fallback image for a blog post based on its slug.
 * Returns the default visa image if no match is found.
 */
export function getBlogFallbackImage(slug: string): string {
  const normalizedSlug = slug.replace(/^blog\//, "").toLowerCase();
  for (const [key, img] of Object.entries(blogImageMap)) {
    if (normalizedSlug.includes(key)) return img;
  }
  return defaultVisaImg;
}

/**
 * Check if a featured_image_url is a broken legacy unsplash URL
 */
export function isBrokenImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes("source.unsplash.com");
}
