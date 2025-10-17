import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AffiliateBanner from "./AffiliateBanner";

interface AffiliateBannerContainerProps {
  position: "sidebar-left" | "sidebar-right" | "horizontal-banner" | "in-content" | "footer";
}

export function AffiliateBannerContainer({ position }: AffiliateBannerContainerProps) {
  const { data: banners } = useQuery({
    queryKey: ["affiliate-banners", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings_affiliates")
        .select("*")
        .eq("position", position)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
  });

  if (!banners || banners.length === 0) return null;

  const containerClass = position === "horizontal-banner" 
    ? "w-full" 
    : position.includes("sidebar") 
    ? "w-full max-w-[280px]" 
    : "w-full";

  return (
    <div className={`space-y-4 ${containerClass}`}>
      {banners.map((banner) => (
        <div key={banner.id} className="w-full">
          {banner.html_embed ? (
            <div 
              className="affiliate-embed w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: banner.html_embed }}
              onClick={() => {
                // Track click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'affiliate_click', {
                    affiliate_name: banner.name,
                    affiliate_url: banner.target_url
                  });
                }
                // Update click count
                supabase
                  .from('settings_affiliates')
                  .update({ click_count: (banner.click_count || 0) + 1 })
                  .eq('id', banner.id)
                  .then();
              }}
            />
          ) : (
            <AffiliateBanner
              imageUrl={banner.image_url || ""}
              title={banner.name}
              description={`Visit ${banner.name}`}
              ctaText="Learn More"
              affiliateLink={banner.target_url}
              position={position.includes("sidebar") ? "sidebar" : "inline"}
            />
          )}
        </div>
      ))}
    </div>
  );
}
