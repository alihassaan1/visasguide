/** Existing scheduled sitemap store, exposed on the public application origin. */
export async function readStoredSitemap(name: string) {
  if (!/^sitemap-(?:index|\d+|(?:news|blog)-\d+)\.xml$/.test(name)) throw new Error("Invalid sitemap name");
  const origin = process.env["SUPABASE_URL"] || "https://awiytryceqehqapytfgn.supabase.co";
  const response = await fetch(`${origin}/storage/v1/object/public/content-images/sitemaps/${name}`);
  if (!response.ok) throw new Error("Published sitemap is unavailable");
  return response.text();
}