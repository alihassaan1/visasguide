# SSR and SEO audit: visas.guide

Date: 17 November 2026. No visual redesign, tracking configuration changes, author invention, or page disabling.

## Completed corrections

- Visa pair titles follow `{From} to {To} Visa Requirements 2026 | visas.guide`; descriptions target 140–160 characters and include recorded stay/fee values.
- Public leaf metadata includes self-referencing canonical URLs, Open Graph tags and Twitter cards. Long metadata dashes and obsolete meta-keywords output are removed. Current-year title references are normalized without changing historical publication timestamps.
- The homepage fallback title is `Visa Requirements and Travel Guides | visas.guide`.
- Site coverage claims read the shared countries-table collection (197 rows at verification), rather than 200+/190+ or invented fallback totals. Static llms.txt uses count-neutral wording. Third-party importer coverage claims remain unchanged because they describe that provider, not this site's database.
- `publicHead` emits BreadcrumbList for public content pages. Article metadata uses linked authors-table records and recorded publication/update timestamps. Older guides with no saved author omit that field, as requested.
- FAQ structured data is emitted only for FAQs displayed in article content or the existing FAQ cards/accordions. Generic invisible country/passport FAQ additions no longer emit markup.
- `content_pages.seo_index` is NOT NULL with default true. No rows were set false. Both route metadata and legacy SEOHead honor false; public visibility is unaffected.
- Root RSS alternate is exactly `rel="alternate" type="application/rss+xml" title="visas.guide" href="/feed"`.

## Route changes

Directly edited route files:

| URL | File | Correction |
|---|---|---|
| Every page's shared head | `src/routes/__root.tsx` | Remove keywords and generic count-bearing metadata; requested RSS alternate |
| `/` | `src/routes/index.tsx` | Loader returns table-derived count; requested fallback title |
| `/countries` | `src/routes/countries/index.tsx` | Table-derived count in initial metadata |
| `/about` | `src/routes/about.tsx` | Seed shared countries before SSR and use its count |
| `/processing-times` | `src/routes/processing-times.tsx` | Seed countries before SSR for coverage references |
| `/sitemap.xml` | `src/routes/sitemap[.]xml.tsx` | Serve existing published sitemap index on the app origin |
| `/sitemaps/*` | `src/routes/sitemaps/$.tsx` | Serve whitelisted published chunks on the app origin |

Existing detail route files already had loaders and head functions; shared loader/head changes now apply to `/visa-requirements/$slug`, `/$slug`, `/blog/$slug`, `/guides/$slug`, `/countries/$countrySlug`, `/$countrySlug/$citySlug`, and `/etias/for/$countrySlug`. Blog/news articles use canonical `/blog/{slug}`; legacy news paths remain redirects, not duplicate content pages. Generated routeTree changes are automatic.

## Sitemap verification

The existing scheduled generator and Supabase sitemap storage are preserved. Content queries now use public access, stable pagination and explicit failure handling. Storage publishing alone retains privileged access.

Regenerated and read back **39,466 unique URLs** in six files:

- `sitemap-1.xml`: 10,000 URLs
- `sitemap-2.xml`: 10,000 URLs
- `sitemap-3.xml`: 10,000 URLs
- `sitemap-4.xml`: 9,393 URLs
- `sitemap-blog-1.xml`: 50 URLs
- `sitemap-news-1.xml`: 23 URLs

Published/indexable filters apply to content pages; guides/news require actual publication timestamps that are not future-dated, and news requires published status. Country/city, ETIAS and active author pages are included. Visa-pair dates reflect their requirements data and saved article update where available.

Each chunk is below 50,000 URLs. The 38 static pages with no authoritative page-specific update date omit lastmod; assigning today's date would be misleading. No shared generation date is emitted as a page update. Other entries use database page-specific timestamps. Old generated static sitemap copies were removed only to prevent them shadowing the same-domain handlers; no legacy deployment directories were deleted.

The admin sitemap health check follows the index, so it also counts news/blog chunks and does not silently accept failed chunks.

## Checks performed

- Raw initial HTML checked on homepage, visa pair, standalone UK guide, legacy guide, blog listing, news article, France country guide, Paris city, ETIAS nationality, student visa, About and passport rankings; each tested valid page returned 200 with title, description, canonical, H1 and meaningful main content. A nonexistent guide returned 404 with no canonical.
- No meta keywords tags appeared on the tested public routes; one requested RSS alternate appeared.
- Saved human author and publication/update values were confirmed in initial Article markup. Unknown guide authors were omitted.
- All six sitemap files and their index returned 200 XML on localhost. The generated stored XML was parsed, deduplicated, counted and checked for representative expected URLs and no admin URLs.
- Homepage, UK guide and Australia–New Zealand pair checked at 1280px, 393px and 320px; no page-level horizontal overflow. Navigation from Home to Blog updated title and content correctly.
- SEO, routing and sitemap data regression tests pass. Latest observed preview build reports build OK.
- Authenticated admin screens could not be checked end-to-end with the external unmanaged Supabase session; sitemap regeneration itself was exercised and its output read back.

## Legacy references (nothing deleted)

- `cloudflare-worker/prerender-worker.js`: old SPA bot-prerender Worker; referenced locally by `cloudflare-worker/README.md`, not imported by the current TanStack app. The user's external dashboard configuration was not inspected in this audit.
- `ec2-file-server/`: separate legacy service; its own README contains copy commands and a systemd WorkingDirectory. No current app import/build dependency was found.
- `.wrangler/`: **not safely classifiable as unused**. `.wrangler/deploy/config.json` points to `../../dist/server/wrangler.json`, the generated Worker deployment configuration. Preserve it and the other requested legacy files.

## Remaining notes and deployment

1. Redeploy this updated application to the external Cloudflare Worker. The live domain still returned the old four-entry sitemap index during this audit; preview verification is not a live deployment.
2. After redeployment, check `/sitemap.xml` lists six chunks, inspect one visa pair's source, then resubmit the sitemap in Google Search Console and request validation/recrawling. Google controls indexing and ranking timing.
3. The schema change and maintained sitemap functions have already been applied/deployed to Supabase. No migration repetition or image re-upload is needed on the existing database.
4. A GetYourGuide-provided widget loader produced a MutationObserver error in browser testing. It did not prevent verified page rendering/navigation; the requested affiliate tracking script was left unchanged. Some existing news images did not appear in browser screenshots; image replacement was outside this no-design-change audit.
5. Supabase reported 42 pre-existing advisory security notes (function search paths, public extensions, function execution privileges and password leak protection); this migration introduced none. These are not a verified clean-security verdict and should be reviewed separately.