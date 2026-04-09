

# Banner Ad Placement Expansion Plan

## Current State

Banners are only placed on **5 page types** today:

| Page | Sidebar | In-Content |
|------|---------|------------|
| ContentPage (blog articles) | ✅ | ❌ |
| NewsArticle | ✅ | ✅ |
| CountryGuide | ✅ | ❌ |
| CityPage | ✅ | ✅ |
| VisaRequirements (40,000+ pages) | ❌ (hardcoded AffiliateBanner only) | ❌ |

**Major gaps** — the highest-traffic pages and key listing pages have zero dynamic banner placements.

## Proposed New Placements

### 1. VisaRequirements Page (highest priority — 40K+ pages)
- Replace the hardcoded `AffiliateBanner` in `VisaSidebar.tsx` with `AffiliateBannerContainer position="sidebar-right"`
- Add `AffiliateBannerContainer position="in-content"` after the main visa content section
- This single change gives banner coverage to the largest page set on the site

### 2. GuidePage (evergreen guides)
- Add `AffiliateBannerContainer position="sidebar-right"` in a new sidebar column
- Add `AffiliateBannerContainer position="in-content"` mid-article
- Restructure layout to two-column (content + sidebar) matching ContentPage pattern

### 3. Homepage (Index)
- Add `AffiliateBannerContainer position="horizontal-banner"` between sections (e.g., after DestinationCarousel or before Footer)
- High visibility, every visitor sees it

### 4. VisaGuides Listing Page
- Add `AffiliateBannerContainer position="horizontal-banner"` between guide cards

### 5. NewsPage (news listing)
- Add `AffiliateBannerContainer position="horizontal-banner"` between news article rows

### 6. Footer-level Banner (site-wide)
- Add `AffiliateBannerContainer position="footer"` in `Footer.tsx` — appears on every page automatically

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/VisaSidebar.tsx` | Replace hardcoded AffiliateBanner with AffiliateBannerContainer |
| `src/pages/VisaRequirements.tsx` | Add in-content banner after main content |
| `src/pages/GuidePage.tsx` | Add two-column layout with sidebar banner + in-content banner |
| `src/pages/Index.tsx` | Add horizontal banner between sections |
| `src/pages/VisaGuides.tsx` | Add horizontal banner in listing |
| `src/pages/NewsPage.tsx` | Add horizontal banner in listing |
| `src/components/Footer.tsx` | Add footer-position banner (site-wide coverage) |

## Impact Summary

- **Before**: ~4 page types with banners
- **After**: All major page types covered, including the 40,000+ visa requirements pages
- Estimated **10-20x increase** in total banner impression inventory
- All placements use the existing `AffiliateBannerContainer` with geo-targeting, scheduling, and weighted rotation — no new infrastructure needed

