import { useAffiliateBanners } from "@/hooks/useSharedData";
import AffiliateBanner from "./AffiliateBanner";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { useLocation } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo } from "react";
import { AffiliateScriptBanner } from './AffiliateScriptBanner';
import { bannerMatchesPosition, isHorizontalBannerPosition, type BannerPosition } from '@/lib/banner-placements';

function ensureProtocol(url: string): string {
  const input = url?.trim();
  if (!input) return "";

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const parsedUrl = new URL(withProtocol);
    if (parsedUrl.hostname.toLowerCase() === "bazarid") {
      parsedUrl.hostname = "bazar.id";
    }
    return parsedUrl.toString();
  } catch {
    return withProtocol;
  }
}

interface AffiliateBannerContainerProps {
  position: BannerPosition;
  className?: string;
}

interface AffiliateData {
  id: string;
  name: string;
  target_url: string;
  html_embed: string | null;
  image_url: string | null;
  is_active: boolean;
  click_count: number;
  position: string;
  positions: string[] | null;
  target_countries: string[] | null;
  exclude_countries: string[] | null;
  target_page_patterns: string[] | null;
  priority: number | null;
  start_date: string | null;
  end_date: string | null;
  impressions: number | null;
}

// Check if URL matches a pattern (supports * wildcards)
function matchesPattern(url: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
    .replace(/\*/g, '.*'); // Convert * to .*
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(url);
}

// Check if banner should be shown based on targeting rules
function shouldShowBanner(
  banner: AffiliateData,
  visitorCountryCode: string,
  currentPath: string
): boolean {
  // Check if active
  if (!banner.is_active) return false;

  // Check date range
  const now = new Date();
  if (banner.start_date && new Date(banner.start_date) > now) return false;
  if (banner.end_date && new Date(banner.end_date) < now) return false;

  // Check country targeting (empty = show to all)
  if (banner.target_countries && banner.target_countries.length > 0) {
    if (!visitorCountryCode || !banner.target_countries.includes(visitorCountryCode)) {
      return false;
    }
  }

  // Check excluded countries
  if (banner.exclude_countries && banner.exclude_countries.length > 0) {
    if (visitorCountryCode && banner.exclude_countries.includes(visitorCountryCode)) {
      return false;
    }
  }

  // Check page patterns (empty = show on all pages)
  if (banner.target_page_patterns && banner.target_page_patterns.length > 0) {
    const matchesAnyPattern = banner.target_page_patterns.some(pattern => 
      matchesPattern(currentPath, pattern)
    );
    if (!matchesAnyPattern) return false;
  }

  return true;
}

export function AffiliateBannerContainer({ position, className = '' }: AffiliateBannerContainerProps) {
  const { countryCode, isLoading: locationLoading } = useVisitorLocation();
  const location = useLocation();
  const currentPath = location.pathname;

  // One shared query for all active banners; match slot client-side
  // (positions array contains slot OR legacy single `position` equals it).
  const { data: allBanners } = useAffiliateBanners();
  const banners = ((allBanners || []) as unknown as AffiliateData[]).filter(
    (b) => bannerMatchesPosition(b, position, currentPath)
  );

  // Filter banners based on targeting rules
  const eligibleBanners = (banners || [])
    .filter(banner => shouldShowBanner(banner, countryCode, currentPath))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Weighted random pick — priority acts as weight (min 1)
  const selectedBanner = useMemo(() => {
    if (eligibleBanners.length === 0) return null;
    const weights = eligibleBanners.map(b => Math.max((b.priority || 0) + 1, 1));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < eligibleBanners.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return eligibleBanners[i];
    }
    return eligibleBanners[eligibleBanners.length - 1];
  }, [eligibleBanners.map(b => b.id).join(',')]);

  // Google Analytics impression event only (no database writes)
  useEffect(() => {
    if (selectedBanner && !locationLoading) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'banner_impression', {
          affiliate_name: selectedBanner.name,
          banner_position: position,
          page_path: currentPath,
        });
      }
    }
  }, [selectedBanner?.id, locationLoading, currentPath]);

  const handleClick = (banner: AffiliateData) => {
    // Clicks are low-volume, so each one is counted in the database.
    // Views are intentionally not written to the database.
    void supabase.rpc('increment_affiliate_click', { p_banner_id: banner.id }).then(({ error }) => {
      if (error) console.warn('Banner click not recorded', error.message);
    });
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_name: banner.name,
        affiliate_url: banner.target_url,
        banner_position: position,
        visitor_country: countryCode,
      });
    }
  };


  // Detect iframe/embed clicks via window blur (React onClick doesn't fire on iframes)
  useEffect(() => {
    if (!selectedBanner?.html_embed) return;
    let clicked = false;
    const onBlur = () => {
      if (document.activeElement?.getAttribute('title') === `${selectedBanner.name} affiliate banner` && !clicked) {
        clicked = true;
        handleClick(selectedBanner);
        setTimeout(() => { clicked = false; }, 2000);
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [selectedBanner?.id]);

  if (!selectedBanner) return null;

  const isHorizontal = isHorizontalBannerPosition(position);
  // Horizontal slot: full-width on mobile, standard leaderboard cap on desktop.
  const containerClass = isHorizontal
    ? "w-full flex justify-center"
    : "w-full";
  const embedClass = isHorizontal
    ? "affiliate-embed w-full max-w-[728px] max-h-[300px] overflow-hidden"
    : "affiliate-embed w-full overflow-hidden";
  // Mobile: fill the page width. Desktop: scale up to a 728x300 box, keeping the
  // creative's own aspect ratio (object-contain) so nothing is stretched or cropped.
  const imageClass = isHorizontal
    ? "w-full h-auto object-contain mx-auto md:w-auto md:max-w-[728px] md:max-h-[300px]"
    : "w-full h-auto object-contain";

  const banner = selectedBanner;

  return (
    <div className={`${containerClass} ${className}`} data-banner-position={position}>
      <div className={isHorizontal ? "w-full flex justify-center" : "w-full"}>
        {banner.html_embed ? (
          <AffiliateScriptBanner
            className={embedClass}
            code={banner.html_embed}
            title={`${banner.name} affiliate banner`}
            onClick={() => handleClick(banner)}
          />
        ) : banner.image_url ? (
          <a
            href={ensureProtocol(banner.target_url)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => handleClick(banner)}
            className={isHorizontal ? "inline-block max-w-full" : "block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"}
          >
            <img
              src={banner.image_url}
              alt={banner.name}
              className={imageClass}
              loading="lazy"
            />
          </a>
        ) : (
          <AffiliateBanner
            imageUrl=""
            title={banner.name}
            description={`Visit ${banner.name}`}
            ctaText="Learn More"
            affiliateLink={ensureProtocol(banner.target_url)}
            position={position.includes("sidebar") ? "sidebar" : "inline"}
            onClick={() => handleClick(banner)}
          />
        )}
      </div>
    </div>
  );
}
