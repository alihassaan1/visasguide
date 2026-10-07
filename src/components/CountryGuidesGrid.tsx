import { useCountriesWithStats } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CountryGuidesGrid = () => {
  const { data: allCountries, isLoading } = useCountriesWithStats();
  const countries = [...allCountries]
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .slice(0, 6);

  if (isLoading || !countries?.length) return null;

  // Sample images for countries (you can replace with actual country images)
  const countryImages = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop", // Paris
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop", // London
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop", // Dubai
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop", // Japan
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop", // USA
    "https://images.unsplash.com/photo-1528114039593-4366cc08227d?w=800&h=600&fit=crop", // Germany
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Popular Country Guides</h2>
            <p className="text-muted-foreground">Discover visa requirements for top destinations</p>
          </div>
          <Link to="/countries" className="hidden sm:flex items-center gap-2 text-primary hover:underline">
            View All Countries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country, index) => {
            const stats = country.search_stats?.[0];
            const totalActivity = (stats?.search_count || 0) + (stats?.page_view_count || 0);

            return (
              <Link key={country.id} to={`/countries/${country.slug}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={countryImages[index % countryImages.length]}
                      alt={country.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="text-5xl">{country.flag_emoji}</span>
                    </div>
                    {totalActivity > 50 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/90 backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {country.name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{country.continent || "Global"}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Visa Information</p>
                        <p className="text-lg font-semibold text-foreground">Complete Guide Available</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Link to="/countries" className="sm:hidden flex items-center justify-center gap-2 text-primary hover:underline mt-8">
          View All Countries <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default CountryGuidesGrid;
