import { ExternalLink } from "lucide-react";

interface AffiliateBannerProps {
  imageUrl?: string;
  title: string;
  description: string;
  ctaText: string;
  affiliateLink: string;
  position?: "inline" | "sidebar";
  onClick?: () => void;
}

const AffiliateBanner = ({
  imageUrl,
  title,
  description,
  ctaText,
  affiliateLink,
  position = "inline",
  onClick
}: AffiliateBannerProps) => {
  const handleClick = () => {
    // Call custom onClick if provided
    onClick?.();
    // Track affiliate click via Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_name: title,
        affiliate_url: affiliateLink
      });
    }
  };

  if (position === "sidebar") {
    return (
      <a
        href={affiliateLink}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleClick}
        className="block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        {imageUrl && (
          <div className="aspect-video bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold mb-2 text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            {ctaText}
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={affiliateLink}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      className="block bg-gradient-to-r from-accent/20 to-primary/20 border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] my-8"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        {imageUrl && (
          <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium">
            {ctaText}
            <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default AffiliateBanner;
