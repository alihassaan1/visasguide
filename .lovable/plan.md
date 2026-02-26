
# Advertising Performance Dashboard

## Overview
Create a dedicated **Ad Performance Dashboard** (`/admin/ad-performance`) that consolidates tracking for both banner ads (from `settings_affiliates`) and affiliate widgets (from `affiliate_widgets`) into a single analytics view.

## What You'll Get

### 1. Summary Cards (Top Row)
- **Total Impressions** -- aggregate from all active banners
- **Total Clicks** -- from `settings_affiliates.click_count` + `analytics_events` where `event_type = 'affiliate_click'`
- **Overall CTR** -- clicks / impressions percentage
- **Active Ads** -- count of active banners + active affiliate widgets

### 2. Performance Over Time Chart
- A line/bar chart (using Recharts) showing daily affiliate clicks from `analytics_events` over the selected date range (7d / 30d / 90d filter)
- Uses the existing `analytics_events` table filtered by `event_type = 'affiliate_click'`

### 3. Banner Ads Performance Table
Data source: `settings_affiliates`
- Columns: Name, Position, Status, Impressions, Clicks, CTR, Priority
- Sortable by clicks/impressions/CTR
- Color-coded status badges (active/inactive)

### 4. Affiliate Widgets Performance Table
Data source: `affiliate_widgets` joined with `cities`/`countries`
- Columns: Program, Location, Type, Clicks, Status
- Grouped by affiliate program

### 5. Top Performing Pages
- Query `analytics_events` where `event_type = 'affiliate_click'`, group by `page_slug`
- Shows which content pages generate the most ad clicks

### 6. Click Activity Log
- Recent affiliate click events from `analytics_events` with timestamp, page, and banner name

## Technical Details

### New File
- `src/pages/admin/AdPerformanceDashboard.tsx` -- the full dashboard component

### Modified Files
- `src/App.tsx` -- add route `/admin/ad-performance`
- `src/components/admin/AdminSidebar.tsx` -- add "Ad Performance" link under the Marketing group (using `BarChart3` icon)

### Data Queries
All data comes from existing tables -- no database changes needed:
- `settings_affiliates` for banner stats (impressions, click_count, priority)
- `affiliate_widgets` for widget stats (click_count, program info)
- `analytics_events` filtered by `event_type = 'affiliate_click'` for time-series and page-level breakdowns

### Date Range Filter
A simple selector (7 days / 30 days / 90 days / All time) at the top controlling the time-series chart and click log.
