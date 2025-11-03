import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";

const TrendingVisas = () => {
  const { data: trending = [], isLoading } = useQuery({
    queryKey: ["trending-visas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select(`
          id,
          name,
          code,
          slug,
          flag_emoji,
          search_stats(search_count, page_view_count)
        `)
        .order("search_stats(search_count)", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Sort by combined search + page view count
      const sorted = (data || [])
        .map((c) => ({
          ...c,
          totalActivity:
            (c.search_stats?.[0]?.search_count || 0) +
            (c.search_stats?.[0]?.page_view_count || 0) * 0.5,
        }))
        .sort((a, b) => b.totalActivity - a.totalActivity)
        .slice(0, 5);

      return sorted;
    },
  });

  if (isLoading || trending.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 mb-4">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Most Searched Visa Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Popular destinations travelers are researching right now
            </p>
          </div>

          {/* Trending Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trending.map((country, index) => (
              <Link
                key={country.id}
                to={`/countries/${country.slug}`}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1">
                  {/* Rank Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Flag */}
                  <div className="flex justify-center mb-4">
                    <span className="text-6xl font-emoji group-hover:scale-110 transition-transform duration-300">
                      {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                    </span>
                  </div>

                  {/* Country Name */}
                  <h3 className="text-center font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {country.name}
                  </h3>

                  {/* Activity Stats */}
                  {country.search_stats?.[0] && (
                    <div className="text-center text-xs text-muted-foreground">
                      {(
                        country.search_stats[0].search_count +
                        country.search_stats[0].page_view_count
                      ).toLocaleString()}{" "}
                      searches
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div className="flex justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-8">
            <Link
              to="/countries"
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-base group"
            >
              Explore all countries
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingVisas;
