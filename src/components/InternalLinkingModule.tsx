import { useCountries } from "@/hooks/useSharedData";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, FileText, MapPin } from "lucide-react";

interface InternalLinkingModuleProps {
  currentSlug: string;
  fromCountrySlug?: string;
  toCountrySlug?: string;
  contentType: 'visa-requirements' | 'country' | 'news' | 'guide';
  maxLinks?: number;
}

interface LinkItem {
  title: string;
  url: string;
  type: string;
  badge?: string;
  flag?: string;
}

const countryCodeToFlagEmoji = (code: string): string => {
  if (!code || code.length !== 2) return '🏳️';
  const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function InternalLinkingModule({
  fromCountrySlug,
  toCountrySlug,
  contentType,
  maxLinks = 12
}: InternalLinkingModuleProps) {
  const { data: allCountries } = useCountries();
  const { data: relatedLinks = [] } = useQuery({
    queryKey: ['internal-links', fromCountrySlug, toCountrySlug, contentType, !!allCountries],
    enabled: !!allCountries,
    queryFn: async () => {
      const links: LinkItem[] = [];

      if (contentType === 'visa-requirements' && fromCountrySlug && toCountrySlug) {
        const toCountry = (allCountries || []).find((c) => c.slug === toCountrySlug);

        const fromCountry = (allCountries || []).find((c) => c.slug === fromCountrySlug);

        if (toCountry && fromCountry) {
          // Other nationalities visiting same destination
          const { data: otherVisitors } = await supabase
            .from('visa_requirements')
            .select('from_country_id, requirement_type, countries!visa_requirements_from_country_id_fkey(name, slug, code)')
            .eq('to_country_id', toCountry.id)
            .neq('from_country_id', fromCountry.id)
            .limit(4);

          otherVisitors?.forEach(v => {
            const c = v.countries as { name: string; slug: string; code: string } | null;
            if (c) {
              links.push({
                title: `${c.name} to ${toCountry.name} Visa`,
                url: `/visa-requirements/${c.slug}-to-${toCountry.slug}-visa-requirements`,
                type: 'visa',
                badge: v.requirement_type === 'visa_free' ? 'Visa Free' : undefined,
                flag: countryCodeToFlagEmoji(c.code)
              });
            }
          });

          // Country guides
          links.push({
            title: `Complete ${toCountry.name} Travel Guide`,
            url: `/countries/${toCountry.slug}`,
            type: 'country'
          });
        }
      }

      return links.slice(0, maxLinks);
    },
    staleTime: 10 * 60 * 1000
  });

  if (relatedLinks.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Explore More
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedLinks.map((link, index) => (
            <Link
              key={index}
              to={link.url}
              className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-lg">
                {link.flag || (link.type === 'country' ? <Globe className="h-4 w-4" /> : link.type === 'city' ? <MapPin className="h-4 w-4" /> : <FileText className="h-4 w-4" />)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {link.title}
                </p>
                {link.badge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {link.badge}
                  </Badge>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
