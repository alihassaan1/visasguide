

# SEO Audit Report & Recommendations

## Critical Issues Found

### 1. BROKEN INTERNAL LINKS: `/passport-rankings` does not exist (SEVERE)
The actual route is `/passport-index` (defined in App.tsx line 108), but two pages link to the non-existent `/passport-rankings`:
- **`src/pages/Index.tsx`** line 75: Homepage "Popular Visa Guides" section
- **`src/pages/ProcessingTimes.tsx`** line 251: "Related Visa Resources" section

These links hit the catch-all `/:slug` route (ContentPage), which shows a "page not found" toast. Google sees this as poor UX and wasted crawl budget. Every click from the homepage to "Passport Rankings" is a dead end.

**Fix**: Change `/passport-rankings` to `/passport-index` in both files.

---

### 2. SiteNavigationSchema has WRONG URLs (MODERATE)
`src/components/SiteNavigationSchema.tsx` contains incorrect URLs in the structured data sent to Google:

| Schema URL | Actual Route | Issue |
|---|---|---|
| `/passport-rankings` | `/passport-index` | Wrong slug |
| `/visa-guides` | `/guides` | Wrong slug |
| `/news` | `/blog` | Wrong slug |
| `/tourist-visa` | `/visa-types/tourist` | Wrong path |
| `/business-visa` | `/visa-types/business` | Wrong path |
| `/student-visa` | `/visa-types/student` | Wrong path |
| `/visa-finder` | No route exists | Dead link (VisaFinder is at a different path?) |

Google uses SiteNavigationElement schema to understand site structure. Incorrect URLs here confuse crawlers and may suppress sitelinks.

**Fix**: Update all URLs to match actual routes in App.tsx.

---

### 3. Visa Type Pages MISSING SEOHead (MODERATE)
`TouristVisa.tsx`, `BusinessVisa.tsx`, and `StudentVisa.tsx` have NO `<SEOHead>` component. This means:
- No dynamic `<title>` tag
- No meta description
- No canonical URL
- No OG/Twitter meta tags
- The browser title stays as whatever the previous page set

Additionally, the hardcoded JSON-LD schema on TouristVisa says "2024" instead of current year.

**Fix**: Add SEOHead to all three visa-type pages with proper titles, descriptions, canonicals, and keywords.

---

### 4. 404 Page Sets Canonical to Bad URL (LOW-MODERATE)
`NotFound.tsx` line 54 sets `canonical={`https://visas.guide${location.pathname}`}`. This tells Google "this 404 URL is the canonical version of this content" -- the opposite of what you want. A 404 page should either have no canonical or canonical to homepage.

**Fix**: Remove the canonical prop from the 404 SEOHead, or set it to `https://visas.guide/`.

---

### 5. VisaFinder Route Mismatch
App.tsx has no `/visa-finder` route. The VisaFinder component exists but I need to verify if it's accessible. The SiteNavigationSchema and index.html noscript section reference `/visa-finder` but App.tsx doesn't show this route explicitly -- it might be caught by the `/:slug` catch-all.

**Fix**: Verify and add explicit route if missing, or update schema references.

---

## New Traffic Capture Recommendations

### 6. Add FAQ Schema to Passport Rankings Page
The passport rankings page has high impressions but no FAQ rich snippets. Add FAQs like:
- "What is the most powerful passport in the world?"
- "How is passport ranking calculated?"
- "Which passport has the most visa-free countries?"

### 7. Add FAQ Schema to Schengen Visa Guide
High-value page missing FAQ rich snippets. Add:
- "How long does a Schengen visa take to process?"
- "Which countries are in the Schengen area?"
- "Can I visit multiple Schengen countries on one visa?"

### 8. Add BreadcrumbSchema to Pages Missing It
Currently only VisaRequirements has BreadcrumbSchema. Add to: CountryGuide, PassportRankings, ProcessingTimes, SchengenVisaGuide, visa-type pages. Google displays breadcrumbs in search results, improving CTR.

---

## Implementation Summary

| # | File(s) | Change | Impact |
|---|---|---|---|
| 1 | `Index.tsx`, `ProcessingTimes.tsx` | Fix `/passport-rankings` → `/passport-index` | Critical - broken links |
| 2 | `SiteNavigationSchema.tsx` | Fix 6 wrong URLs | Moderate - schema accuracy |
| 3 | `TouristVisa.tsx`, `BusinessVisa.tsx`, `StudentVisa.tsx` | Add SEOHead with titles, descriptions, canonicals | Moderate - missing meta |
| 4 | `NotFound.tsx` | Remove canonical from 404 page | Low - bad signal to Google |
| 5 | `PassportRankings.tsx` | Add FAQSchema component | Traffic boost - rich snippets |
| 6 | `SchengenVisaGuide.tsx` | Add FAQSchema component | Traffic boost - rich snippets |
| 7 | Multiple pages | Add BreadcrumbSchema | CTR improvement |

