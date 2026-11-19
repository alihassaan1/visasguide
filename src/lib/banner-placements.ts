export const BANNER_POSITIONS = [
  'sidebar-right', 'horizontal-banner', 'in-content', 'footer',
  'homepage-below-hero', 'homepage-above-footer',
] as const;

export type BannerPosition = typeof BANNER_POSITIONS[number];

export const BANNER_POSITION_OPTIONS: { value: BannerPosition; label: string }[] = [
  { value: 'sidebar-right', label: 'Sidebar Right' },
  { value: 'horizontal-banner', label: 'Horizontal' },
  { value: 'in-content', label: 'In-Content' },
  { value: 'footer', label: 'Footer' },
  { value: 'homepage-below-hero', label: 'Homepage: Below Hero (Horizontal)' },
  { value: 'homepage-above-footer', label: 'Homepage: Above Footer (Horizontal)' },
];

export function isHorizontalBannerPosition(position: string): boolean {
  return position === 'horizontal-banner' || position === 'footer' || position === 'homepage-below-hero' || position === 'homepage-above-footer';
}

export function bannerMatchesPosition(
  banner: { position: string | null; positions: string[] | null },
  position: BannerPosition,
  path: string,
): boolean {
  if (position.startsWith('homepage-') && path !== '/') return false;
  return (banner.positions || []).includes(position) || banner.position === position;
}