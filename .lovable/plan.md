

# Visa Policy Tracker System

## Goal
Build an automated system that detects, logs, publishes, and surfaces every visa policy change globally — making visas.guide the authoritative timeline for visa policy updates.

## Architecture Overview

```text
  Sources                Detection              Storage              Distribution
  ───────                ─────────              ───────              ────────────
  RSS feeds      ─┐                        ┌─ visa_policy_changes ─┬─ Country page timeline
  Gov sites      ─┼─►  policy-detector  ──►│                       ├─ Auto-generated article
  News articles  ─┤    edge function       │  + linked              ├─ Homepage "Latest Changes"
  Manual entry   ─┘    (LLM extraction)    └─ news_articles row     ├─ Newsletter digest
                                                                    ├─ Social post (existing)
                                                                    └─ /policy-updates hub page
```

## Phase 1 — Database Schema (Migration)

Create `visa_policy_changes` table:
- `id`, `country_id` (the country making the change)
- `affected_country_ids` (array — countries whose citizens are affected; null = all)
- `change_type` enum: `visa_free_added`, `visa_free_removed`, `evisa_launched`, `fee_change`, `processing_time_change`, `entry_ban`, `requirement_change`, `policy_announcement`
- `title`, `summary` (short), `full_description` (long, used in article)
- `effective_date`, `announcement_date`
- `severity`: `info` | `update` | `warning` | `critical`
- `source_url`, `source_name`, `source_type` (`official` | `news` | `manual`)
- `news_article_id` (FK to auto-generated article)
- `is_verified`, `verified_by`, `verified_at`
- `is_published`, `created_at`, `updated_at`
- Indexes on `country_id`, `effective_date`, `change_type`

RLS: public read for `is_published = true`; admin manage.

## Phase 2 — Detection & Auto-Publishing (Edge Functions)

**`policy-detector`** (cron every 30 min)
- Reads from existing `rss_article_queue` (already in DB)
- For each new article, calls LLM (DeepSeek/Lovable AI) with extraction prompt: *"Is this a visa policy change? If yes, extract: country, affected countries, change type, effective date, summary, severity"*
- If detected → inserts into `visa_policy_changes` (unverified) and queues an article generation task

**`policy-article-generator`** (triggered by new policy_changes row)
- Uses existing AI infrastructure (`generate-visa-content` pattern)
- Generates a 600–900 word SEO article with:
  - Title formula: `"[Country] [Change Type]: New Visa [Rules/Fees/Policy] Effective [Date] [Year]"`
  - Slug: `/news/{country-slug}-visa-policy-{date}-{short-slug}`
  - Schema: ArticleSchema + FAQSchema (auto-generated Q&A from the change)
  - Internal links to the country page and timeline
  - Source citation block
- Inserts into `news_articles`, links back via `news_article_id`

**`policy-verifier`** (admin-triggered or auto for low-severity)
- High-severity (entry_ban, fee_change >50%) → flagged for manual review in admin
- Low-severity (announcement, info) → auto-publish after 30-min cooling period
- Manual entries skip verification

## Phase 3 — Public-Facing Surfaces

1. **`/policy-updates` hub page** (new route)
   - Filterable timeline: by country, change type, date range, severity
   - SEO target: "visa policy updates 2026", "latest visa changes"
   - Sortable table view + card view toggle
   - RSS feed at `/policy-updates/rss.xml`

2. **Country page timeline section** (extend `CountryGuide.tsx`)
   - "Recent Visa Policy Changes for [Country]" section
   - Shows last 10 changes with date, summary, link to full article
   - "View all policy history" link → `/policy-updates?country=X`

3. **Homepage widget** (extend `Index.tsx`)
   - Replace or supplement existing news section with "Breaking Visa Updates" — last 4 critical/warning items

4. **VisaAlertTicker integration** (existing component)
   - Critical/warning policy changes auto-create site-wide alerts via existing `site_settings` alerts mechanism

5. **Newsletter** (extend existing weekly newsletter)
   - Add "This Week's Policy Changes" section pulling latest verified entries

## Phase 4 — Admin Dashboard

New admin page `/admin/policy-tracker`:
- **Inbox tab**: unverified detections from policy-detector → approve / reject / edit
- **All Changes tab**: searchable table of all logged changes
- **Manual Entry tab**: form to log a change manually (then auto-generates article)
- **Sources tab**: manage trusted government RSS/sites added to detection
- **Stats**: detections per week, verification rate, top contributing sources

## Phase 5 — SEO Schema

- Each policy article: `NewsArticle` + `GovernmentService` schema
- Country timeline: `ItemList` schema with each change as `Event` (uses `effective_date`)
- Hub page: `Dataset` schema (signals to Google this is a structured data resource — strong for Google Discover)

## Automation Workflow Summary

| Trigger | Action | Output |
|---|---|---|
| RSS fetch (existing) | New article in queue | — |
| Cron 30min | `policy-detector` scans queue | Inserts unverified `visa_policy_changes` row |
| New row inserted | `policy-article-generator` runs | Creates draft `news_articles` row |
| Severity = info/update | Auto-publish after 30min | Article live + indexed via existing IndexNow |
| Severity = warning/critical | Flag in admin Inbox | Awaits human approval |
| Article published | Existing social-content-publisher | Posts to LinkedIn etc. |
| Weekly cron | Newsletter includes top changes | Email sent |

## Implementation Order (recommended sequence)
1. Migration: `visa_policy_changes` table + indexes + RLS
2. `policy-detector` edge function (reuse rss_article_queue)
3. `policy-article-generator` edge function
4. Admin Inbox UI (`/admin/policy-tracker`)
5. `/policy-updates` hub page + RSS feed
6. Country page timeline section
7. Homepage widget + newsletter integration
8. Schema markup polish + sitemap inclusion
9. Cron schedules for detector + auto-publish

## Key Dependencies (already in project — no new infra needed)
- LOVABLE_API_KEY (Lovable AI gateway) for extraction + article generation
- Existing `rss_article_queue`, `news_articles`, `site_settings` tables
- Existing IndexNow, sitemap, social publisher pipelines
- Existing FAQSchema, ArticleSchema, BreadcrumbSchema components

## Out of Scope (future phases)
- Direct scraping of government embassy sites (legal/maintenance burden — phase 2)
- Multi-language policy translations
- Email alerts per-country subscription (would need new subscriber preferences table)

