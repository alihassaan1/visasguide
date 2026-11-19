/** Third-party creatives execute only in an opaque-origin sandbox, never in the site DOM. */
export const AFFILIATE_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';

export function normalizeImageUrl(input: string): string {
  const value = input.trim();
  if (!value) return '';
  if (/[<>]/.test(value)) throw new Error('Paste affiliate code in Script / HTML, not the image URL field.');
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/\//, '')}`);
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) {
    throw new Error('Enter a valid image URL.');
  }
  url.protocol = 'https:';
  return url.toString();
}

export function validateAffiliateEmbed(code: string): string | null {
  if (!code.trim()) return 'Paste the affiliate banner script or HTML code.';
  if (code.length > 100_000) return 'Affiliate code must be smaller than 100 KB.';
  if (!/<(script|iframe|img|a|div|ins)\b/i.test(code)) return 'Enter the complete affiliate HTML or script tag.';
  if (/\b(?:src|href)\s*=\s*["']?\s*(?:javascript:|vbscript:|file:|http:)/i.test(code)) {
    return 'Affiliate links and script sources must use HTTPS.';
  }
  return null;
}

export function affiliateFrameHeight(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.min(1200, Math.max(40, Math.ceil(value)))
    : null;
}

export function buildAffiliateDocument(code: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src https: data: blob: 'unsafe-inline' 'unsafe-eval'; base-uri 'none'; form-action 'none'"><style>html,body{margin:0;padding:0;overflow:hidden}#affiliate-root{display:flow-root;width:100%}img,video,iframe{max-width:100%}img{height:auto}a{display:inline-block;max-width:100%}</style></head><body><div id="affiliate-root">${code}</div><script>
(() => {
  const root = document.getElementById('affiliate-root');
  if (!root) return;
  let lastHeight = 0;
  function measure() {
    root.style.zoom = '1';
    const naturalWidth = Math.max(root.scrollWidth, root.getBoundingClientRect().width);
    const available = document.documentElement.clientWidth;
    const scale = naturalWidth > available && available > 0 ? available / naturalWidth : 1;
    root.style.zoom = String(scale);
    const height = Math.ceil(Math.max(root.getBoundingClientRect().height, root.scrollHeight * scale));
    if (height !== lastHeight) {
      lastHeight = height;
      parent.postMessage({type:'affiliate-banner-size',height}, '*');
    }
    root.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'sponsored noopener noreferrer'; });
  }
  new ResizeObserver(() => requestAnimationFrame(measure)).observe(root);
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);
  document.addEventListener('load', measure, true);
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('a')) parent.postMessage({type:'affiliate-banner-click'}, '*');
  });
  measure();
})();
</script></body></html>`;
}