# Plan: 10 Trending, SEO-Optimized Blog Posts (May 2026)

## Note on ETIAS
ETIAS will be handled as a **separate dedicated section/hub** in a future prompt — excluded from this batch to avoid cannibalizing that future cluster. Replaced with another high-traffic trending topic.

## Topic selection (current + high search intent, May 2026)

1. **EU Entry/Exit System (EES) Explained — What Travelers Must Know in 2026** (live now, huge confusion = high search volume)
2. **UK ETA in 2026 — Full Country List, £16 Fee & Application Walkthrough**
3. **US B1/B2 Visitor Visa 2026 — Wait Times by Embassy & Interview Waiver Rules**
4. **Schengen Visa Fee Increase 2026 — New €90 Cost & Application Changes**
5. **Digital Nomad Visas 2026 — Top 15 Countries Ranked (Income, Tax, Duration)**
6. **Dubai & UAE Visit Visa 2026 — 5-Year Multi-Entry, Costs & Application Steps**
7. **Japan eVisa 2026 — Expanded Country Eligibility & Step-by-Step Guide**
8. **Thailand DTV (Destination Thailand Visa) 2026 — 5-Year Remote Worker Guide**
9. **China 240-Hour Visa-Free Transit 2026 — Updated Eligible Countries & Ports**
10. **Saudi Arabia eVisa 2026 — Tourist, Umrah & Stopover Visa Complete Guide** (replaces ETIAS slot — major growth market, high intent)

## Article structure (each post)

Target **1,800–2,400 words**, human editorial voice (per `seo-human-content-strategy` memory — no "In conclusion", no AI tells, real author byline, ai_generated=false).

```
- H1 title (≤60 chars, "2026" + primary keyword)
- Hook intro (real-world framing, May 2026 dateline)
- Quick Facts box (fee, processing time, validity, eligibility)
- H2: What Changed in 2026 / Why It Matters Now
- H2: Who Needs It / Eligibility
- H2: Step-by-Step Application
- H2: Costs & Processing Times (table)
- H2: Common Mistakes & Rejection Reasons
- H2: FAQ (5–7 Q&As → FAQ-schema-ready)
- Author byline + dateline
- 2–3 contextual internal links to existing /countries or /visa pages
```

## SEO fields populated per post

- `title`, `slug` (kebab-case, keyword-first)
- `seo_title` (≤60 chars), `seo_description` (≤160 chars)
- `excerpt` (140–160 chars, distinct from meta)
- `categories`, `tags` (5–8 long-tail)
- `featured_image_url` (Unsplash with `?w=1200&h=630&fit=crop&q=80` per memory)
- `author_id` rotated across real bylines from `authors` table
- `published_at` staggered over last 5 days (natural cadence)
- `ai_generated = false`, `source_type = 'manual'`, `status = 'published'`

## Execution

1. Query `authors` table; pick 3–4 real bylines to rotate.
2. Generate articles via Lovable AI Gateway (`google/gemini-3-flash-preview`) with strict editorial system prompt enforcing structure, May 2026 currency, no AI tells, internal-link suggestions.
3. Bulk-insert into `news_articles` with all SEO fields via `psql`.
4. Trigger `auto-indexnow` for the 10 new `/blog/{slug}` URLs.
5. Verify: count published rows, spot-check 2 posts at `/blog` and `/blog/{slug}` in preview.

## Out of scope

- ETIAS content (reserved for dedicated hub — separate prompt)
- New components, layout, schema, or CMS changes
- Country guides in `content_pages` (this batch is news/blog only)

## Deliverable

10 published articles live at `/blog/{slug}`, surfacing on homepage's Latest Updates section, included in sitemap, and submitted to IndexNow.
