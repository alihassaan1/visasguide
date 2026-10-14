import { useCountriesWithStats } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Eye } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";

const TrendingGuidesSection = () => {
  const { data: allCountries, isLoading } = useCountriesWithStats();
  const trendingCountries = [...allCountries]
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .slice(0, 6)
    .map((country) => {
      const stats = country.search_stats?.[0];
      return { ...country, totalActivity: (stats?.page_view_count || 0) + (stats?.search_count || 0) * 2 };
    })
    .sort((a, b) => b.totalActivity - a.totalActivity);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-sm w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-sm w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!trendingCountries || trendingCountries.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">🌍 Trending Visa Guides</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most viewed and searched visa guides this week - stay updated with the latest travel destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCountries.map((country, index) => (
            <Link key={country.id} to={`/countries/${country.slug}`}>
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <span 
                        className="text-4xl" 
                        style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}
                      >
                        {country.flag_emoji || countryCodeToFlagEmoji(country.code) || '🏳️'}
                      </span>
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{country.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{country.search_stats?.[0]?.page_view_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{country.search_stats?.[0]?.search_count || 0} searches</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingGuidesSection;
