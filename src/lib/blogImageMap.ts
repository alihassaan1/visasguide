// Local fallback images for blog posts when featured_image_url is broken (e.g. deprecated unsplash URLs)
const jamaicaImg = "https://cdn.visas.guide/assets/blog/jamaica.jpg";
const domRepImg = "https://cdn.visas.guide/assets/blog/dominican-republic.jpg";
const cubaImg = "https://cdn.visas.guide/assets/blog/cuba.jpg";
const bangladeshImg = "https://cdn.visas.guide/assets/blog/bangladesh.jpg";
const pakistanImg = "https://cdn.visas.guide/assets/destinations/pakistan.jpg";
const nepalImg = "https://cdn.visas.guide/assets/blog/nepal.jpg";
const sriLankaImg = "https://cdn.visas.guide/assets/blog/sri-lanka.jpg";
const maldivesImg = "https://cdn.visas.guide/assets/blog/maldives.jpg";
const hongKongImg = "https://cdn.visas.guide/assets/blog/hong-kong.jpg";
const taiwanImg = "https://cdn.visas.guide/assets/blog/taiwan.jpg";
const chinaImg = "https://cdn.visas.guide/assets/blog/china.jpg";
const russiaImg = "https://cdn.visas.guide/assets/blog/russia.jpg";
const franceImg = "https://cdn.visas.guide/assets/destinations/france.jpg";
const japanImg = "https://cdn.visas.guide/assets/destinations/japan.jpg";
const canadaImg = "https://cdn.visas.guide/assets/destinations/canada.jpg";
const uaeImg = "https://cdn.visas.guide/assets/destinations/uae.jpg";
const singaporeImg = "https://cdn.visas.guide/assets/destinations/singapore.jpg";
const thailandImg = "https://cdn.visas.guide/assets/destinations/thailand.jpg";
const southKoreaImg = "https://cdn.visas.guide/assets/destinations/south-korea.jpg";
const indonesiaImg = "https://cdn.visas.guide/assets/destinations/indonesia.jpg";
const malaysiaImg = "https://cdn.visas.guide/assets/destinations/malaysia.jpg";
const ukImg = "https://cdn.visas.guide/assets/blog/uk.jpg";
const australiaImg = "https://cdn.visas.guide/assets/blog/australia.jpg";
const germanyImg = "https://cdn.visas.guide/assets/blog/germany.jpg";
const defaultVisaImg = "https://cdn.visas.guide/assets/blog/default-visa.jpg";
const middleEastDisruptionsImg = "https://cdn.visas.guide/assets/blog/middle-east-air-travel-disruptions.jpg";
const budgetTravelImg = "https://cdn.visas.guide/assets/blog/budget-travel-airfare.jpg";

const blogImageMap: Record<string, string> = {
  "budget-travel-tips-rising-airfare": budgetTravelImg,
  "middle-east-air-travel-disruptions": middleEastDisruptionsImg,
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
