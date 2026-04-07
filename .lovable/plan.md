

## Plan: Google Search Console Keyword Optimization

### Critical Finding

**The VisaRequirements pages have `noIndex={true}`** — this means Google is being told NOT to index your highest-impression visa requirement pages. This single fix alone could dramatically increase your traffic since pages like `/visa-requirements/russia-to-united-kingdom` (99 impressions, position 3.9) are being deliberately hidden from search results.

### Top Keyword Opportunities from GSC Data

| Page/Keyword Cluster | Impressions | Avg Position | Issue |
|---|---|---|---|
| `/countries/albania` | 176 | 5.6 | Great position, 0 clicks — needs CTR-optimized meta |
| `/passport-index` | 211 | 60 | Already getting clicks, needs better position |
| India-to-Singapore visa | 107 | 81 | `noIndex` blocking indexing |
| Russia-to-UK visa | 99 | 3.9 | `noIndex` blocking — should be page 1! |
| `/countries/nepal` | 94 | 4.85 | 0 clicks at position 5 — meta needs work |
| Turkey-to-Germany visa | 88 | 8.1 | `noIndex` blocking |
| Australia-to-Thailand visa | 81 | 6.2 | `noIndex` blocking |
| UK-to-Spain visa | 80 | 6.2 | `noIndex` blocking |
| "passport index" queries | 84 | 60 | Need better title/meta match |
| Italy "do I need a visa" | 40+ | 83-92 | No dedicated FAQ content |
| Turkey "do I need a visa" | 30+ | 78-91 | No dedicated FAQ content |
| Zanzibar/Tanzania city | 87 | 88 | City page needs meta optimization |

### Implementation Steps

#### Step 1: Remove noIndex from Visa Requirements Pages
Remove `noIndex={true}` from `src/pages/VisaRequirements.tsx`. This is the single highest-impact change — it's currently blocking Google from indexing pages that are already ranking at positions 2-8.

#### Step 2: Optimize Passport Rankings Page Title
Update `src/pages/PassportRankings.tsx` meta title to exactly match the #1 searched query: `Passport Index 2026 – World Passport Rankings & Visa-Free Score | Visas.Guide`. Add keywords: "passport index", "passport ranking", "passport rankings", "world passport rankings", "passport strength", "passport power ranking".

#### Step 3: Optimize Albania Country Page Meta  
The Albania page has 176 impressions at position 5.6 with 0 clicks. Update the database `content_pages` meta for Albania to include exact-match queries from the report: "Albania visa free countries list 2026", "Albania Schengen status 2026", "Albania visa requirements".

#### Step 4: Optimize Nepal Country Page Meta
94 impressions at position 4.85. Target exact queries: "Nepal visa requirements 2026", "Nepal tourist visa requirements 2026", "Nepal visa on arrival requirements 2026".

#### Step 5: Update High-Impression Visa Requirement Pages Meta via Database
Update `content_pages` meta for the top visa-requirement routes that are already ranking well (position < 10) but getting 0 clicks:
- Russia-to-UK (99 impr, pos 3.9)
- Australia-to-Thailand (81 impr, pos 6.2)
- UK-to-Spain (80 impr, pos 6.2)
- Belarus visa-free countries (72 impr, pos 5.8)
- Russia-to-Spain (64 impr, pos 6.5)
- Malaysia visa guide blog (61 impr, pos 6.9)
- Vietnam evisa blog (55 impr, pos 5.1)

#### Step 6: Add FAQ Schema to Country Guide Pages
Add dynamic FAQ questions to `src/pages/CountryGuide.tsx` that match the exact "do I need a visa for {country}" queries appearing in the report (Italy, Turkey, Finland, Oman, Cuba). These render as rich snippets in Google.

#### Step 7: Optimize Passport Index URL and Internal Links
The GSC data shows `/passport-index` as the top page. Update internal links across the site to use consistent anchor text matching the search queries: "Passport Index", "World Passport Rankings 2026".

#### Step 8: Add "passport index" and "passport ranking" Keywords to Homepage
Update `src/pages/Index.tsx` keywords array to include the exact high-impression passport-related queries.

### Technical Details

**Files to modify:**
- `src/pages/VisaRequirements.tsx` — remove `noIndex={true}`
- `src/pages/PassportRankings.tsx` — update meta title/description/keywords
- `src/pages/CountryGuide.tsx` — add FAQ schema component
- `src/pages/Index.tsx` — add passport keywords
- `src/components/SEOKeywordsSection.tsx` — add passport index link

**Database updates (via insert tool):**
- `content_pages` meta for Albania, Nepal, and 7+ visa route pages

**Impact estimate:** Removing `noIndex` alone should unlock 500+ impressions that are currently being suppressed, with many pages already at position 2-8 (page 1 of Google).

