import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AffiliateBanner from "./AffiliateBanner";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
interface AffiliateBannerContainerProps {
  position: "sidebar-left" | "sidebar-right" | "horizontal-banner" | "in-content" | "footer";
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
      const { data, error } = await supabase
        .from("settings_affiliates")
        .select("*")
        .eq("position", position)
        .eq("is_active", true);

      if (error) throw error;
      return (data || []) as AffiliateData[];
    },
  });

  // Filter banners based on targeting rules
  const filteredBanners = (banners || [])
    .filter(banner => shouldShowBanner(banner, countryCode, currentPath))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Track impressions for visible banners
  useEffect(() => {
    if (filteredBanners.length > 0 && !locationLoading) {
      filteredBanners.forEach(async (banner) => {
        await supabase
          .from('settings_affiliates')
          .update({ impressions: (banner.impressions || 0) + 1 })
          .eq('id', banner.id);
      });
    }
  }, [filteredBanners.map(b => b.id).join(','), locationLoading]);

  if (!filteredBanners || filteredBanners.length === 0) return null;

  const containerClass = position === "horizontal-banner" 
    ? "w-full" 
    : position.includes("sidebar") 
    ? "w-full max-w-[280px]" 
    : "w-full";

  const handleClick = async (banner: AffiliateData) => {
    // Track click with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_name: banner.name,
        affiliate_url: banner.target_url,
        visitor_country: countryCode
      });
    }

    // Log to analytics_events for conversion reporting
    await supabase.from('analytics_events').insert({
      event_type: 'affiliate_click',
      page_slug: currentPath,
      search_term: banner.name,
      referrer_source: ensureProtocol(banner.target_url),
      visitor_location: countryCode ? { country: countryCode } : null,
    });
    
    // Update click count
    await supabase
      .from('settings_affiliates')
      .update({ click_count: (banner.click_count || 0) + 1 })
      .eq('id', banner.id);
  };

  return (
    <div className={`space-y-4 ${containerClass}`}>
      {filteredBanners.map((banner) => (
        <div key={banner.id} className="w-full">
          {banner.html_embed ? (
            <div 
              className="affiliate-embed w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: banner.html_embed }}
              onClick={() => handleClick(banner)}
            />
          ) : (
            <AffiliateBanner
              imageUrl={banner.image_url || ""}
              title={banner.name}
              description={`Visit ${banner.name}`}
              ctaText="Learn More"
              affiliateLink={ensureProtocol(banner.target_url)}
              position={position.includes("sidebar") ? "sidebar" : "inline"}
              onClick={() => handleClick(banner)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
