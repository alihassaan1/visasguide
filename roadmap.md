# Google indexing repair

- [x] Repair initial HTML loading across public content route families.
- [x] Add server-rendered page-specific metadata and canonical URLs; handle missing pages and legacy URLs correctly.
- [x] Verify report URLs and representative routes without JavaScript, and run regression tests.
- [x] Report publishing and Google recrawl requirements without promising rankings.

# Article spacing repair

- [x] Remove empty content spacers and standardize public article spacing without changing saved content.
- [x] Verify affected guides, news, country and visa pages at desktop and mobile widths.

# Article text formatting

- [x] Standardize public article text colors, bold headings and sizes, including pasted formatting.
- [x] Verify the reported article and representative templates on desktop and mobile.
## R2 CDN Migration (cdn.visas.guide)
- [x] Store R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY secrets
- [x] Verify S3 API access + find bucket name (visas-guide)
- [x] Server upload function → R2 (future images)
- [x] Switch ImageUpload.tsx to R2
- [x] Migrate existing images (public/, src/assets, Supabase storage) to R2
- [x] Update image URL references (code + DB)

## SSR and SEO audit (no visual changes)
- [x] Verify initial HTML and metadata across visa pairs, standalone guides, blog/news, countries and cities; list changed routes.
- [x] Unique 2026 pair titles/descriptions; remove keyword tags and long metadata dashes.
- [x] Replace fixed country claims with the countries-table count.
- [x] Server-render breadcrumbs, visible FAQ data and database-backed Article author/dates.
- [x] Add content_pages.seo_index (default true), connect noindex and sitemap exclusions without disabling any pages.
- [x] Repair page-specific sitemap dates, publication filters, news/blog chunks and the sitemap index.
- [x] Set the root RSS alternate link.
- [x] Report legacy folder references without deleting them; test, verify and document deployment steps.
- [ ] Redeploy the updated application on the user's Cloudflare Worker; requires their external deployment action.

## Admin-only view count display
- [x] Hide counters across public articles, news sidebars and trending guides unless the viewer is a verified admin.
- [x] Preserve admin dashboard counters and tracking; test visibility rules and public page rendering (external admin session unavailable for end-to-end sign-in).
