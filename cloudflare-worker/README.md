# Bot Prerendering Worker — visas.guide

Lovable hosting serves the same static `index.html` for every SPA route. Search
engines and social crawlers that don't fully execute JavaScript (Bing, LinkedIn,
Twitter/X, Slack, Facebook, AhrefsBot, GPTBot, etc.) therefore see the homepage
title and meta on every URL. This worker fixes that **without changing DNS or
the app**.

## How it works

```
            ┌─────────────────────────────┐
Real user → │ Cloudflare Worker @ edge    │ → Lovable origin (unchanged)
            │  ↓ if User-Agent = bot      │
   Bot    → │  → service.prerender.io     │ → fully rendered HTML returned
            └─────────────────────────────┘
```

- Real users: untouched, zero added latency.
- Bots: get fully-rendered HTML with correct `<title>`, meta description,
  canonical, OG tags, and JSON-LD that React/SEOHead injected after hydration.
- Cached at the Cloudflare edge for 10 minutes per URL.

## One-time setup (≈5 minutes)

1. **Get a Prerender.io token**
   - Sign up at https://prerender.io (free tier: 1,000 renders/mo, plenty for
     incremental crawl after the initial backfill).
   - Copy the token from Account → Token.

2. **Create the Worker**
   - Cloudflare dashboard → **Workers & Pages → Create → Create Worker**.
   - Name it `visas-prerender`.
   - Replace the starter code with the contents of
     [`prerender-worker.js`](./prerender-worker.js). Save & Deploy.

3. **Add the secret**
   - Worker → **Settings → Variables and Secrets → Add variable**.
   - Type: **Secret**, name: `PRERENDER_TOKEN`, value: your prerender.io token.
   - Deploy.

4. **Bind the route**
   - Worker → **Settings → Triggers → Add Route**.
   - Route: `visas.guide/*` — Zone: `visas.guide`.
   - Add another route: `www.visas.guide/*` (same zone).

5. **Verify**
   ```bash
   # Should show the page-specific title, not the homepage title
   curl -sA "Googlebot" https://visas.guide/schengen-visa-guide | grep -i '<title>'
   curl -sA "Mozilla/5.0" https://visas.guide/schengen-visa-guide -o /dev/null -w "%{http_code}\n"

   # Look for the prerender marker on bot responses
   curl -sIA "bingbot" https://visas.guide/schengen-visa-guide | grep -i x-prerendered
   ```

6. **Re-submit to crawlers**
   - Google Search Console → URL Inspection → Test Live URL → Request Indexing.
   - Bing Webmaster Tools → Submit URL / Submit Sitemap.
   - The IndexNow integration in this project will pick up new pages automatically.

## Rollback

Remove the two routes under **Triggers**. Origin keeps serving normally — no
DNS or app changes needed.

## What's excluded from prerender

Hard-coded in the worker:

- Asset extensions (`.js`, `.css`, `.png`, `.xml`, fonts, etc.)
- `/admin/*` (no SEO value, real-user only)
- `/api/*`
- `/sitemaps/*`, `/sitemap.xml`, `/robots.txt` (already static XML/text)

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `curl -A Googlebot ...` still shows homepage title | Worker route not bound, or token missing → worker falls back to origin | Re-check route + `PRERENDER_TOKEN` secret |
| 402 / quota error in worker logs | Prerender.io free tier exhausted | Upgrade plan or rotate to Rendertron self-hosted |
| Real users report slowness | Route accidentally matches non-bots | Confirm `BOT_UA_REGEX` not being modified; check worker tail logs |
