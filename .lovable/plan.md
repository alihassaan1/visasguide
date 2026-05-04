I found this second export is a Google Search Console “Crawled - currently not indexed” file. In plan mode I can inspect but cannot modify or republish yet.

Key findings so far:
- The uploaded XLSX did not expose row data cleanly through the document parser, but the filename/status points to the GSC crawled-not-indexed issue rather than a robots block.
- The sitemap generator still has the same critical coverage bug: only slugs containing both `-to-` and `-visa-requirements` are classified as visa requirement URLs. Database counts show:
  - `content_pages`: 39,998 published
  - published `*-to-*` visa slugs: 39,710
  - published slugs currently matching the strict sitemap condition: only 1,098
  - That leaves roughly 38,600 visa pages incorrectly emitted or inconsistently discoverable.
- The static `public/sitemap.xml` currently points sitemap chunks to Supabase Storage URLs, not `https://visas.guide/...`. This is risky for Google/Bing sitemap processing and matches the prior robots/sitemap-domain issue.
- The live app has a route for `/visa-requirements/:slug`, but canonical URLs are based on the incoming URL slug. If Google discovers both `/visa-requirements/a-to-b` and `/visa-requirements/a-to-b-visa-requirements`, they can look like separate duplicate pages, which is a common cause of crawled-not-indexed.

Plan to fix this issue:

1. Normalize visa requirement URLs everywhere
   - Update `supabase/functions/generate-static-sitemap/index.ts` so every published content slug containing `-to-` is emitted as:
     `/visa-requirements/{from}-to-{to}`
   - Strip a trailing `-visa-requirements` before writing the sitemap URL.
   - This creates one canonical URL per country pair and avoids duplicate variants.

2. Fix sitemap index chunk URLs to same-domain URLs
   - Change generated sitemap index entries from:
     `https://awiytryceqehqapytfgn.supabase.co/storage/.../sitemap-N.xml`
     to:
     `https://visas.guide/sitemaps/sitemap-N.xml`
   - Keep Supabase Storage as the backing store, but ensure search engines see same-host sitemap chunk URLs.

3. Add/adjust sitemap serving for `/sitemaps/sitemap-N.xml`
   - Add an edge-function route capable of streaming individual sitemap XML files from Supabase Storage with:
     - `Content-Type: application/xml; charset=utf-8`
     - cache headers suitable for crawlers
     - 404 for invalid sitemap names
   - Then wire the app/hosting route so `https://visas.guide/sitemaps/sitemap-1.xml` resolves to that XML instead of the React SPA shell.

4. Canonicalize visa requirement pages in React
   - Update `src/pages/VisaRequirements.tsx` to compute the normalized slug by stripping a trailing `-visa-requirements`.
   - Set `<link rel="canonical">` to `https://visas.guide/visa-requirements/{normalizedSlug}`.
   - Keep the page able to load either URL variant for backward compatibility.

5. Add route-level redirects for duplicate visa URL variants
   - If a visitor or bot lands on `/visa-requirements/{slug}-visa-requirements`, redirect to `/visa-requirements/{slug}`.
   - This consolidates crawl signals and reduces “Duplicate, Google chose different canonical” / “Crawled - currently not indexed” risk.

6. Add the missing static sitemap route entries
   - Ensure routes such as `/visa-types/tourist`, `/visa-types/business`, `/visa-types/student`, `/policy-updates`, `/schengen-visa-guide`, `/rss`, `/feed`, and author pages that should be indexed are handled consistently in sitemap generation if they are public SEO targets.
   - Keep admin/private utility pages out of the sitemap and out of public navigation.

7. Update the SEO dashboard checks
   - Update `src/pages/admin/SEODashboard.tsx` so it checks the actual public sitemap entry point and same-domain chunks instead of the old Supabase Storage URL.
   - Adjust health expectations to the current URL count, around 40k+ URLs after the fix.

8. Republish and verify
   - Deploy the updated edge function(s).
   - Regenerate/publish the sitemap via `generate-static-sitemap?publish=1`.
   - Verify:
     - `https://visas.guide/sitemap.xml` returns a valid sitemap index.
     - Each `<loc>` in the index is on `https://visas.guide/sitemaps/...`.
     - `https://visas.guide/sitemaps/sitemap-1.xml` returns XML, not HTML.
     - Sample visa pages from the GSC problem set return indexable pages with a self-referential canonical.

9. Submit to search engines
   - Resubmit `https://visas.guide/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
   - Trigger IndexNow for a sample of corrected URLs and the sitemap entry point.

Expected impact:
- Google will have a cleaner, same-domain sitemap structure.
- The 39k+ visa requirement pages will be discoverable through a consistent canonical URL format.
- Duplicate URL variants will stop competing with each other.
- This should reduce the “Crawled - currently not indexed” bucket over the next reprocessing cycle, although Google’s indexing recovery is not immediate and may take days to weeks.