import { describe, expect, it } from 'vitest';
import { bannerCtr, bannerKind, slugifyBrand } from '@/lib/banner-rows';
import { bannerSaveSchema } from '@/lib/affiliate-banner-data';

describe('banner row helpers', () => {
  it('computes CTR from clicks and views', () => {
    expect(bannerCtr({ impressions: 14280, click_count: 312 })).toBe('2.18%');
  });
  it('shows 0.00% when a banner has no views', () => {
    expect(bannerCtr({ impressions: 0, click_count: 5 })).toBe('0.00%');
  });
  it('labels pasted affiliate code as a script banner', () => {
    expect(bannerKind({ html_embed: '<a href="https://x.com"><img src="https://x.com/a.png"></a>' })).toBe('script');
    expect(bannerKind({ html_embed: '  ' })).toBe('image');
  });
  it('turns a brand name into a slug', () => {
    expect(slugifyBrand('  Safety Wing! ')).toBe('safety-wing');
  });
  it('keeps the chosen brand when saving a banner', () => {
    const parsed = bannerSaveSchema.parse({
      id: '78e2700e-9441-48ee-b2b1-48c763b057db', name: 'Upflare', target_url: 'https://app.upflare.com/aff.php?aff=91',
      html_embed: null, image_url: 'https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png',
      positions: ['footer'], priority: 1, target_countries: [], exclude_countries: [], target_page_patterns: [],
      start_date: null, end_date: null, affiliate_program: 'upflare',
    });
    expect(parsed.affiliate_program).toBe('upflare');
  });
});
