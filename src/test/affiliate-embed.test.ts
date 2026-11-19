import { describe, expect, it } from 'vitest';
import { AFFILIATE_SANDBOX, affiliateFrameHeight, buildAffiliateDocument, normalizeImageUrl, validateAffiliateEmbed } from '@/lib/affiliate-embed';
import { bannerSaveSchema } from '@/lib/affiliate-banner-data';

export const upflareCode = '<a href="https://app.upflare.com/aff.php?aff=91" target="_blank" rel="sponsored noopener"><img src="https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png" width="728" height="90" alt="Domains &amp; web hosting by Upflare"></a>';

describe('affiliate creatives', () => {
  it('accepts the supplied Upflare banner without a tour, location or manual image URL', () => {
    const result = bannerSaveSchema.parse({ id: '979395b4-cc52-461c-9204-4be1767efecd', name: 'Upflare', target_url: 'https://app.upflare.com/aff.php?aff=91', html_embed: upflareCode, image_url: null, positions: ['horizontal-banner'], priority: 0, target_countries: [], exclude_countries: [], target_page_patterns: [], start_date: null, end_date: null });
    expect(result.html_embed).toBe(upflareCode);
    expect(result.image_url).toBeNull();
    expect(result.target_url).toBe('https://app.upflare.com/aff.php?aff=91');
    expect(result.position).toBe('horizontal-banner');
  });
  it('accepts HTTPS script creatives', () => {
    expect(validateAffiliateEmbed('<script src="https://affiliate.example/banner.js"></script>')).toBeNull();
  });
  it('prevents affiliate creatives from acquiring the site origin', () => {
    expect(AFFILIATE_SANDBOX.split(' ')).not.toContain('allow-same-origin');
    expect(AFFILIATE_SANDBOX.split(' ')).not.toContain('allow-top-navigation');
  });
  it('rejects HTML pasted into image URL fields', () => {
    expect(() => normalizeImageUrl(upflareCode)).toThrow(/Script/);
  });
  it('normalizes external image URLs without fetching or canvas processing', () => {
    expect(normalizeImageUrl('app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png')).toBe('https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png');
  });
  it('rejects executable and insecure URL attributes', () => {
    expect(validateAffiliateEmbed('<a href="javascript:alert(1)">x</a>')).not.toBeNull();
    expect(validateAffiliateEmbed('<script src="http://affiliate.example/ad.js"></script>')).not.toBeNull();
  });
  it('rejects invalid frame height messages and caps valid ones', () => {
    expect(affiliateFrameHeight('90')).toBeNull();
    expect(affiliateFrameHeight(NaN)).toBeNull();
    expect(affiliateFrameHeight(-10)).toBeNull();
    expect(affiliateFrameHeight(90)).toBe(90);
    expect(affiliateFrameHeight(9000)).toBe(1200);
  });
  it('keeps the supplied tracking link and image in the isolated document', () => {
    const doc = new DOMParser().parseFromString(buildAffiliateDocument(upflareCode), 'text/html');
    expect(doc.querySelector('a')?.getAttribute('href')).toBe('https://app.upflare.com/aff.php?aff=91');
    expect(doc.querySelector('img')?.getAttribute('width')).toBe('728');
    expect(doc.querySelector('img')?.getAttribute('height')).toBe('90');
  });
});