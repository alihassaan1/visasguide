export interface BannerRowStats { impressions: number; click_count: number }

/** Click-through rate as a percentage string with two decimals. */
export function bannerCtr({ impressions, click_count }: BannerRowStats): string {
  if (!impressions || impressions <= 0) return '0.00%';
  return `${((click_count / impressions) * 100).toFixed(2)}%`;
}

export function bannerKind(banner: { html_embed: string | null }): 'script' | 'image' {
  return banner.html_embed?.trim() ? 'script' : 'image';
}

export function slugifyBrand(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
