import { describe, expect, it } from 'vitest';
import { bannerMatchesPosition, isHorizontalBannerPosition } from '@/lib/banner-placements';
import { bannerSaveSchema } from '@/lib/affiliate-banner-data';

const belowHero = { position: 'homepage-below-hero', positions: ['homepage-below-hero'] };
const aboveFooter = { position: 'homepage-above-footer', positions: ['homepage-above-footer'] };

describe('homepage horizontal banner placements', () => {
  it('matches the below-hero slot independently on the homepage', () => {
    expect(bannerMatchesPosition(belowHero, 'homepage-below-hero', '/')).toBe(true);
    expect(bannerMatchesPosition(aboveFooter, 'homepage-below-hero', '/')).toBe(false);
    expect(isHorizontalBannerPosition('homepage-below-hero')).toBe(true);
  });
  it('matches the above-footer slot independently on the homepage', () => {
    expect(bannerMatchesPosition(aboveFooter, 'homepage-above-footer', '/')).toBe(true);
    expect(bannerMatchesPosition(belowHero, 'homepage-above-footer', '/')).toBe(false);
    expect(isHorizontalBannerPosition('homepage-above-footer')).toBe(true);
  });
  it('does not match homepage-only banners on article or country pages', () => {
    expect(bannerMatchesPosition(belowHero, 'homepage-below-hero', '/blog/saudi-arabia-evisa-2026')).toBe(false);
    expect(bannerMatchesPosition(aboveFooter, 'homepage-above-footer', '/countries/france')).toBe(false);
  });
  it('saves both homepage positions on a single creative', () => {
    const result = bannerSaveSchema.parse({
      id: '979395b4-cc52-461c-9204-4be1767efecd', name: 'Homepage banner',
      target_url: 'https://app.upflare.com/aff.php?aff=91',
      html_embed: '<script src="https://affiliate.example/banner.js"></script>', image_url: null,
      positions: ['homepage-below-hero', 'homepage-above-footer'], priority: 0,
      target_countries: [], exclude_countries: [], target_page_patterns: [], start_date: null, end_date: null,
    });
    expect(result.positions).toEqual(['homepage-below-hero', 'homepage-above-footer']);
    expect(result.position).toBe('homepage-below-hero');
  });
  it('preserves existing horizontal and legacy single-position matching', () => {
    const legacy = { position: 'horizontal-banner', positions: null };
    expect(bannerMatchesPosition(legacy, 'horizontal-banner', '/countries/france')).toBe(true);
    expect(bannerMatchesPosition(legacy, 'homepage-below-hero', '/')).toBe(false);
  });
  it('uses horizontal sizing for the footer placement', () => {
    expect(isHorizontalBannerPosition('footer')).toBe(true);
    expect(isHorizontalBannerPosition('sidebar-right')).toBe(false);
  });
});