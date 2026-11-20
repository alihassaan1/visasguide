# Project rules

- The app runs on TanStack Start with file-based routes in `src/routes/` (pages live in `src/pages/` and are wrapped by route files); server rendering is required so crawlers get full HTML.
- Existing components import routing helpers from `@/lib/router-compat` (react-router-style API over TanStack Router); keep using it until call sites are migrated to native APIs.
- Admin pages render under `src/routes/admin.tsx` with `ssr: false`; `AdminLayout` is the auth gate for every `/admin/*` child, and `/admin/auth` lives outside it (`admin_.auth.tsx`).
- Most backend jobs stay as Supabase Edge Functions on the external Supabase project because their secrets and cron schedules live there; new app-internal server logic uses `createServerFn` in `src/lib/*.functions.ts`.
- Browser-only libraries (mapbox-gl, react-quill-new, charts) must not be evaluated during server rendering; import them dynamically or keep them on client-only routes.
- Every public content route owns SSR metadata via `publicHead`; dynamic loaders use `loadPublicDetail` and public prefetch functions with matching page query keys, and the router dehydrates/restores Query state so HTML and hydration agree. Legacy aliases redirect permanently and missing resources throw notFound rather than serving empty 200 pages.
- Public metadata and structured data use loader records; omit unknown authors/dates and respect content indexability so crawler output stays factual.
- Preserve the scheduled chunked sitemap generator and storage; same-origin sitemap handlers expose its index/chunks, with public content reads, publication filters and page-specific dates only.
- Keep sitemap pagination and timestamp logic in the shared sitemap data helper so later-page failures and unknown dates have executable regressions.
- Public view counters share a fail-closed, server-verified admin visibility hook; SSR omits them and auth changes clear visibility to avoid stale signed-in displays.

- Country hero URLs live in a browser-safe shared image module used by both page rendering and leaf social metadata, keeping the shown photo and share preview consistent.
- Load the existing AdSense script after hydration to prevent auto ads mutating SSR markup; preserve the publisher ID, consent configuration and Google Analytics tag.
- Declare sitewide GetYourGuide partner tracking in the root head so every route receives one script and widget fallback loaders reuse it.
- Keep public article spacing, text colors and heading hierarchy in shared prose styles (including Quill visual headings) and remove empty editor spacer paragraphs at display time; this keeps templates consistent without rewriting saved content or affecting admin editors.
- Images live in Cloudflare R2 bucket `visas-guide` (account 0e186cf10248391d7f7e481950644bb7), served from https://cdn.visas.guide; new uploads go through src/lib/r2-upload.functions.ts (admin-only) or the uploadToR2 helper in edge functions — never reintroduce Supabase storage for images.
- Generic affiliate creatives use settings_affiliates with an optional program slug and the shared creative editor; retain affiliate_widgets for GetYourGuide-specific configuration so existing placements keep working.
- Save banner creatives through the admin-verified server function using the shared validation schema and invalidate the existing public banner query so edits appear without discarding long-lived caching.
- Render third-party affiliate HTML/scripts only in opaque-origin sandboxed iframes with source-checked resize messages; scripts must not access site sessions or mutate the page.
- Image URL input applies only on explicit submission and preserves failed URLs for correction; uploaded GIF banners bypass canvas conversion to preserve animation.
- Keep banner positions, horizontal sizing classification and homepage-only matching in a browser-safe shared module used by validation, public rendering and admin controls; independent homepage slots reuse the shared banner query and render spacing only when populated.
- Share optional visitor location through one bounded, failure-cached Query request for banners and passport detection; location must not block primary content or read storage during rendering.
- Cache public detail request bundles per QueryClient for repeat navigation, exclude duplicate bundles from dehydration, refresh seeded detail rows while preserving fresh shared tables, and parallelize independent public reads within the six-connection runtime budget.
- Cache admin banner reads separately from public active creatives and reuse shared settings; load destination/widget inputs only for the applicable affiliate to avoid unrelated requests.

- All ad/affiliate admin work lives on `/admin/monetization` (tabs: banners, performance, GYG widgets, network); old affiliate-manager, ad-performance, banner-debug and social routes redirect there so admins have one place and old links keep working.
