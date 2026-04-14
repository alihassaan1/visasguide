

# SEO Boost Implementation Plan

## Overview
Implement the previously recommended SEO fixes plus content-level optimizations targeting high-impression keyword clusters from the Bing/Google data.

## Changes

### 1. Fix robots.txt conflict (CRITICAL)
**File: `public/robots.txt`**
- Remove `Disallow: /visa-requirements/` -- this blocks Googlebot from crawling pages that are set to be indexed (`noIndex={false}`), causing impression drops as pages get de-indexed
- These are high-value pages (e.g., Russia-to-UK) generating real impressions

### 2. Improve internal linking from homepage
**File: `src/pages/Index.tsx`**
- Add a "Popular Visa Guides" or "Trending Searches" section linking to top keyword-targeted pages: Processing Times, Passport Index, Jordan/Petra, South Korea, Montenegro
- This passes PageRank to pages that need ranking boosts

### 3. Add Petra-specific FAQ to Jordan country page
**File: `src/pages/CountryGuide.tsx`**
- Extend the dynamic FAQ generation: when the country slug is `jordan`, inject an additional FAQ: "Do you need a visa to visit Petra?" with a detailed answer
- Add "petra visa" and "visa for petra jordan" to the keywords array for Jordan
- Update meta title logic to include "& Petra" when slug is `jordan`

### 4. Add UK-USA FAQ rich snippets
**File: `src/pages/CountryGuide.tsx`**
- When slug is `united-kingdom`, add FAQ: "Do UK citizens need a visa for USA?"
- When slug is `united-states`, add FAQ: "Do UK citizens need a visa for USA?" and "Do US citizens need a visa for UK?"
- These target exact-match queries with 8+ impressions

### 5. Add evergreen guide seeds for content agent
**File: `supabase/functions/generate-guide-content/index.ts`**
- Add three new guide entries to `GUIDES_TO_GENERATE`:
  - `south-korea-visa-for-filipinos` -- "South Korea Visa for Filipino Citizens: Complete Guide 2026"
  - `montenegro-visa-guide` -- "Montenegro Visa Requirements: Who Needs a Visa in 2026?"
  - `jordan-petra-visa-guide` -- "Jordan & Petra Visa Guide: Entry Requirements for Tourists 2026"

### 6. Boost internal links on key pages
**File: `src/pages/ProcessingTimes.tsx`**
- Add internal links section at bottom pointing to related country guides and the passport index

**File: `src/pages/PassportRankings.tsx`**
- Add "global visa wait times" and "passport power ranking" to keywords if not already present

## Technical Notes
- The robots.txt fix is the single highest-impact change -- it likely explains the impression drop
- FAQ rich snippets use the existing `FAQSchema` component which generates proper JSON-LD
- Guide seeds will be generated on next invocation of the `generate-guide-content` edge function
- All meta updates use the existing `SEOHead` component and `CURRENT_YEAR` constant

