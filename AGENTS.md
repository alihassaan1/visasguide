# Project rules

- The app runs on TanStack Start with file-based routes in `src/routes/` (pages live in `src/pages/` and are wrapped by route files); server rendering is required so crawlers get full HTML.
- Existing components import routing helpers from `@/lib/router-compat` (react-router-style API over TanStack Router); keep using it until call sites are migrated to native APIs.
- Admin pages render under `src/routes/admin.tsx` with `ssr: false`; `AdminLayout` is the auth gate for every `/admin/*` child, and `/admin/auth` lives outside it (`admin_.auth.tsx`).
- Most backend jobs stay as Supabase Edge Functions on the external Supabase project because their secrets and cron schedules live there; new app-internal server logic uses `createServerFn` in `src/lib/*.functions.ts`.
- Browser-only libraries (mapbox-gl, react-quill-new, charts) must not be evaluated during server rendering; import them dynamically or keep them on client-only routes.
- Every public content route owns SSR metadata via `publicHead`; dynamic loaders use `loadPublicDetail` and public prefetch functions with matching page query keys, and the router dehydrates/restores Query state so HTML and hydration agree. Legacy aliases redirect permanently and missing resources throw notFound rather than serving empty 200 pages.

- Country hero URLs live in a browser-safe shared image module used by both page rendering and leaf social metadata, keeping the shown photo and share preview consistent.
- Load the existing AdSense script after hydration to prevent auto ads mutating SSR markup; preserve the publisher ID, consent configuration and Google Analytics tag.
- Keep public article spacing in shared prose styles and remove empty editor spacer paragraphs at display time; this keeps templates consistent without rewriting saved content or affecting admin editors.
