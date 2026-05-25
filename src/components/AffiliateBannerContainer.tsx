import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AffiliateBanner from "./AffiliateBanner";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

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
  position: "sidebar-right" | "horizontal-banner" | "in-content" | "footer";
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

export function AffiliateBannerContainer({ position }: AffiliateBannerContainerProps) {
  const { countryCode, isLoading: locationLoading } = useVisitorLocation();
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: banners } = useQuery({
    queryKey: ["affiliate-banners", position],
    queryFn: async () => {
      // Match banners whose positions array contains this slot,
      // OR whose legacy single `position` field equals it (back-compat).
      const { data, error } = await supabase
        .from("settings_affiliates")
        .select("*")
        .eq("is_active", true)
        .or(`positions.cs.{${position}},position.eq.${position}`);

      if (error) throw error;
      return (data || []) as AffiliateData[];
    },
  });

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

  // Track impression for the selected banner (atomic increment + analytics log)
  useEffect(() => {
    if (selectedBanner && !locationLoading) {
      // Atomic increment via database function
      supabase.rpc('increment_banner_impression', { p_banner_id: selectedBanner.id });

      // Log impression event for advertiser reporting
      supabase.from('analytics_events').insert({
        event_type: 'banner_impression',
        page_slug: currentPath,
        search_term: selectedBanner.name,
        referrer_source: position,
        visitor_location: countryCode ? { country: countryCode } : null,
      });

      // Track with Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'banner_impression', {
          affiliate_name: selectedBanner.name,
          banner_position: position,
          page_path: currentPath,
        });
      }
    }
  }, [selectedBanner?.id, locationLoading, currentPath]);

  if (!selectedBanner) return null;

  const containerClass = "w-full";

  const handleClick = async (banner: AffiliateData) => {
    // Track click with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_name: banner.name,
        affiliate_url: banner.target_url,
        banner_position: position,
        visitor_country: countryCode
      });
    }

    // Log to analytics_events for conversion reporting
    supabase.from('analytics_events').insert({
      event_type: 'affiliate_click',
      page_slug: currentPath,
      search_term: banner.name,
      referrer_source: ensureProtocol(banner.target_url),
      visitor_location: countryCode ? { country: countryCode, position } : null,
    });

    // Atomic click count increment (RPC bypasses RLS for anon visitors)
    supabase.rpc('increment_affiliate_click', { p_banner_id: banner.id });
  };

  // Detect iframe/embed clicks via window blur (React onClick doesn't fire on iframes)
  useEffect(() => {
    if (!selectedBanner?.html_embed) return;
    let clicked = false;
    const onBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME' && !clicked) {
        clicked = true;
        handleClick(selectedBanner);
        setTimeout(() => { clicked = false; }, 2000);
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [selectedBanner?.id]);

  const banner = selectedBanner;

  return (
    <div className={`${containerClass}`}>
      <div className="w-full">
        {banner.html_embed ? (
          <div 
            className="affiliate-embed w-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: banner.html_embed }}
            onClick={() => handleClick(banner)}
          />
        ) : banner.image_url ? (
          <a
            href={ensureProtocol(banner.target_url)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => handleClick(banner)}
            className="block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <img
              src={banner.image_url}
              alt={banner.name}
              className="w-full h-auto object-contain"
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
