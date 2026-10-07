import { useCountriesWithStats } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";

const TrendingVisas = () => {
  const { data: allCountries, isLoading } = useCountriesWithStats();
  const trending = [...allCountries]
    .map((c) => ({
      ...c,
      totalActivity:
        (c.search_stats?.[0]?.search_count || 0) +
        (c.search_stats?.[0]?.page_view_count || 0) * 0.5,
    }))
    .sort((a, b) => (b.search_stats?.[0]?.search_count || 0) - (a.search_stats?.[0]?.search_count || 0))
    .slice(0, 5)
    .sort((a, b) => b.totalActivity - a.totalActivity);

  if (isLoading || trending.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Trending Now</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Most Searched Destinations
            </h2>
          </div>
          <Link
            to="/countries"
            className="hidden sm:flex items-center text-primary hover:text-primary/80 font-medium text-sm group"
          >
            View All
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {trending.map((country, index) => (
            <Link
              key={country.id}
              to={`/countries/${country.slug}`}
              className="group"
            >
              <div className="relative rounded-xl border border-border bg-card p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 text-center">
                <div className="absolute top-2 right-2">
                  <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                </div>

                <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform duration-200">
                  {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                </span>

                <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/countries"
          className="sm:hidden flex items-center justify-center text-primary hover:text-primary/80 font-medium text-sm mt-4 group"
        >
          View All Countries
          <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default TrendingVisas;
