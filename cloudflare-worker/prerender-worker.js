/**
 * Cloudflare Worker: Bot Prerendering Proxy for visas.guide
 *
 * Detects search engine + social crawlers and proxies them to Prerender.io
 * so they receive fully-rendered HTML with the correct per-route <title>,
 * meta tags, canonical, and JSON-LD. Real users always hit the Lovable
 * origin directly with zero added latency.
 *
 * Setup:
 *  1. Cloudflare → Workers & Pages → Create Worker → paste this file.
 *  2. Settings → Variables → add Secret `PRERENDER_TOKEN` (from prerender.io).
 *  3. (Optional) add plain var `ORIGIN_HOST` if origin differs from request host.
 *  4. Triggers → Add Route: `visas.guide/*` and `www.visas.guide/*` (zone: visas.guide).
 *  5. Deploy. Test with:
 *       curl -A "Googlebot" https://visas.guide/schengen-visa-guide | grep '<title>'
 *
 * Rollback: remove the route in Triggers — origin keeps serving as before.
 */

const BOT_UA_REGEX = new RegExp(
  [
    'googlebot', 'google-inspectiontool', 'bingbot', 'bingpreview', 'slurp',
    'duckduckbot', 'baiduspider', 'yandex', 'yandexbot', 'sogou', 'exabot',
    'facebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'embedly', 'quora link preview', 'showyoubot', 'outbrain', 'pinterest',
    'pinterestbot', 'slackbot', 'vkshare', 'w3c_validator', 'whatsapp',
    'redditbot', 'applebot', 'flipboard', 'tumblr', 'bitlybot', 'skypeuripreview',
    'nuzzel', 'discordbot', 'google page speed', 'qwantify', 'bitrix link preview',
    'xing-contenttabreceiver', 'chrome-lighthouse', 'telegrambot', 'mastodon',
    'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'rogerbot', 'screaming frog',
    'petalbot', 'ia_archiver', 'archive.org_bot', 'gptbot', 'oai-searchbot',
    'chatgpt-user', 'perplexitybot', 'claudebot', 'anthropic-ai', 'cohere-ai',
    'ccbot', 'amazonbot', 'bytespider'
  ].join('|'),
  'i'
);

// Asset extensions we never want to send through the prerender service.
const ASSET_EXT_REGEX = /\.(js|css|xml|less|png|jpe?g|gif|pdf|doc|txt|ico|rss|zip|mp[34]|wav|flv|svg|webp|avif|woff2?|ttf|otf|eot|json|map|webmanifest)(\?.*)?$/i;

function isBot(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return false;
  if (BOT_UA_REGEX.test(ua)) return true;
  // Allow `?_escaped_fragment_=` (legacy AJAX crawling) to also trigger prerender.
  const url = new URL(request.url);
  if (url.searchParams.has('_escaped_fragment_')) return true;
  return false;
}

function shouldPrerender(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const url = new URL(request.url);
  if (ASSET_EXT_REGEX.test(url.pathname)) return false;
  // Never prerender admin or API surfaces.
  if (url.pathname.startsWith('/admin')) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname.startsWith('/sitemaps/')) return false;
  if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') return false;
  return isBot(request);
}

async function proxyToPrerender(request, env) {
  const token = env.PRERENDER_TOKEN;
  if (!token) {
    // Misconfigured — fall back to origin so we never break the site.
    return fetch(request);
  }

  const incomingUrl = new URL(request.url);
  // Always normalize the URL the prerender service caches against.
  const targetUrl = `${incomingUrl.protocol}//${incomingUrl.host}${incomingUrl.pathname}${incomingUrl.search}`;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  const headers = new Headers();
  headers.set('X-Prerender-Token', token);
  headers.set('User-Agent', request.headers.get('user-agent') || 'prerender-worker');
  headers.set('Accept-Encoding', 'gzip');

  try {
    const response = await fetch(prerenderUrl, {
      method: 'GET',
      headers,
      // Cloudflare edge cache: bots don't need the freshest copy every time.
      cf: { cacheTtl: 600, cacheEverything: true }
    });

    // If prerender service errors, fall back to origin so crawlers still get *something*.
    if (response.status >= 500) {
      return fetch(request);
    }

    // Strip hop-by-hop and rewrite cache headers.
    const cleaned = new Headers(response.headers);
    cleaned.delete('content-encoding');
    cleaned.delete('content-length');
    cleaned.set('x-prerendered', 'true');
    cleaned.set('cache-control', 'public, max-age=600, s-maxage=600');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cleaned
    });
  } catch (err) {
    return fetch(request);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (shouldPrerender(request)) {
      return proxyToPrerender(request, env);
    }
    return fetch(request);
  }
};
