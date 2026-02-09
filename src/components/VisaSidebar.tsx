import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Landmark, 
  Coins, 
  Users, 
  Globe, 
  ExternalLink,
  FileText,
  ArrowRight
} from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import AffiliateBanner from "@/components/AffiliateBanner";
import NewsletterSignup from "@/components/NewsletterSignup";

interface VisaSidebarProps {
  toCountry: {
    id: string;
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
    capital?: string | null;
    currency?: string | null;
    population?: number | null;
    continent?: string | null;
    region?: string | null;
    language?: string | null;
  };
  fromCountry: {
    name: string;
    slug: string;
  };
  requirementType?: string;
}

const VisaSidebar = ({ toCountry, fromCountry, requirementType }: VisaSidebarProps) => {
  const flagEmoji = toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️';

  const formatPopulation = (pop: number | null | undefined) => {
    if (!pop) return null;
    if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
    if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
    if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
    return pop.toString();
  };

  const isVisaRequired = requirementType?.toLowerCase().includes('required');

  return (
    <div className="space-y-6">
      {/* Quick Facts Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
              {flagEmoji}
            </span>
            {toCountry.name} Quick Facts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {toCountry.capital && (
            <div className="flex items-center gap-3 text-sm">
              <Landmark className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Capital:</span>
              <span className="font-medium ml-auto">{toCountry.capital}</span>
            </div>
          )}
          
          {toCountry.currency && (
            <div className="flex items-center gap-3 text-sm">
              <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Currency:</span>
              <span className="font-medium ml-auto">{toCountry.currency}</span>
            </div>
          )}
          
          {toCountry.population && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Population:</span>
              <span className="font-medium ml-auto">{formatPopulation(toCountry.population)}</span>
            </div>
          )}
          
          {toCountry.language && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium ml-auto">{toCountry.language}</span>
            </div>
          )}
          
          {(toCountry.continent || toCountry.region) && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Region:</span>
              <span className="font-medium ml-auto">{toCountry.region || toCountry.continent}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply CTA (for visa required destinations) */}
      {isVisaRequired && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Need Help Applying?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get professional visa assistance for your {toCountry.name} application.
            </p>
            <Button className="w-full" asChild>
              <a 
                href={`https://www.ivisa.com/?utm_source=visas.guide&utm_medium=affiliate&utm_campaign=${toCountry.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Application <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Useful Links - moved below newsletter */}

      {/* Affiliate Banner */}
      <AffiliateBanner 
        position="sidebar"
        title="Get Travel Insurance"
        description="Protect your trip with comprehensive travel insurance coverage."
        ctaText="Get a Quote"
        affiliateLink="https://www.worldnomads.com/?utm_source=visas.guide"
      />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
};

export default VisaSidebar;
