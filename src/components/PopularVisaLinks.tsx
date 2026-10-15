import { useCountriesWithStats } from "@/hooks/useSharedData";
import { Link } from "@/lib/router-compat";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countryCodeToFlagEmoji } from "@/lib/utils";

interface DbCountry {
  id: string;
  name: string;
  code: string;
  slug: string;
  flag_emoji: string | null;
  visa_free_destinations: number | null;
}

const regionCards = [
  { name: "Europe", emoji: "🇪🇺", href: "/countries?region=Europe" },
  { name: "Asia", emoji: "🌏", href: "/countries?region=Asia" },
  { name: "North America", emoji: "🌎", href: "/countries?region=North%20America" },
  { name: "South America", emoji: "🌎", href: "/countries?region=South%20America" },
  { name: "Africa", emoji: "🌍", href: "/countries?region=Africa" },
  { name: "Oceania", emoji: "🌊", href: "/countries?region=Oceania" },
  { name: "Middle East", emoji: "🕌", href: "/countries?region=Middle%20East" },
];

const keywordFor = (name: string, code?: string) => {
  const map: Record<string, string> = {
    "United States": "US Visa",
    "United Kingdom": "UK Visa",
    "United Arab Emirates": "UAE Visa",
  };
  return map[name] || `${name} Visa`;
};

const PopularVisaLinks = () => {
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("searchCounts");
      if (raw) setSearchCounts(JSON.parse(raw));
    } catch {}
  }, []);

  const { data: allCountries, isLoading } = useCountriesWithStats();
  const countries = useMemo(
    () => [...allCountries].sort((a, b) => (b.visa_free_destinations || 0) - (a.visa_free_destinations || 0)).slice(0, 18) as unknown as DbCountry[],
    [allCountries]
  );

  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aStats = (a as any).search_stats?.[0];
      const bStats = (b as any).search_stats?.[0];
      const aActivity = (aStats?.search_count || 0) + (aStats?.page_view_count || 0) * 0.5;
      const bActivity = (bStats?.search_count || 0) + (bStats?.page_view_count || 0) * 0.5;
      
      return bActivity - aActivity || (b.visa_free_destinations || 0) - (a.visa_free_destinations || 0);
    });
  }, [countries]);

  const ids = useMemo(() => sorted.map((c) => c.id), [sorted]);
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }, []);

  const { data: recentRows = [] } = useQuery({
    queryKey: ["recent-visa-updates", ids, cutoff],
    queryFn: async () => {
      if (ids.length === 0) return [] as { to_country_id: string }[];
      const { data, error } = await supabase
        .from("visa_requirements")
        .select("to_country_id,last_updated")
        .in("to_country_id", ids)
        .gt("last_updated", cutoff);
      if (error) throw error;
      return data as { to_country_id: string }[];
    },
    enabled: ids.length > 0,
  });

  const { data: visaFreeRows = [] } = useQuery({
    queryKey: ["visa-free-counts", ids],
    queryFn: async () => {
      if (ids.length === 0) return [] as { to_country_id: string }[];
      const { data, error } = await supabase
        .from("visa_requirements")
        .select("to_country_id")
        .in("to_country_id", ids)
        .eq("requirement_type", "visa_free");
      if (error) throw error;
      return data as { to_country_id: string }[];
    },
    enabled: ids.length > 0,
  });

  const recentSet = useMemo(() => new Set(recentRows.map((r: any) => r.to_country_id)), [recentRows]);
  const visaFreeCount = useMemo(() => {
    const map = new Map<string, number>();
    (visaFreeRows as any[]).forEach((r) => map.set(r.to_country_id, (map.get(r.to_country_id) || 0) + 1));
    return map;
  }, [visaFreeRows]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Travel Visa Requirements for Popular Destinations
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore visa requirements, application procedures, and essential travel information for the world's most visited countries.
            </p>
          </div>

          {/* Grid of Visa Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Schengen Visa special card */}
            <Link
              to="/guides/schengen-visa-requirements"
              className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
            >
              <div className="text-5xl mb-3 font-emoji group-hover:scale-110 transition-transform duration-300">🇪🇺</div>
              <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
                Schengen Visa
              </span>
            </Link>

            {sorted.map((c) => (
              <Link
                key={c.id}
                to={`/countries/${c.slug}`}
                className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
              >
                <div className="text-5xl mb-3 font-emoji group-hover:scale-110 transition-transform duration-300">
                  {c.flag_emoji || countryCodeToFlagEmoji(c.code) || '🏳️'}
                </div>
                <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
                  {keywordFor(c.name, c.code)}
                </span>
                <div className="mt-2 flex gap-2">
                  {recentSet.has(c.id) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30">
                      Updated
                    </span>
                  )}
                  {(visaFreeCount.get(c.id) || 0) > 50 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200/50">
                      Visa-free for many
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-10">
            <Link
              to="/countries"
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-base group"
            >
              View all countries
              <svg
                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Explore by Region */}
          <div className="mt-14">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Explore by Region</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {regionCards.map((r) => (
                <Link
                  key={r.name}
                  to={r.href}
                  className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
                >
                  <div className="text-3xl mb-2 font-emoji">{r.emoji}</div>
                  <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors">
                    {r.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularVisaLinks;
