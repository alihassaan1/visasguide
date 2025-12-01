import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Users, DollarSign, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useState } from "react";

const regions = [
  { name: "All", label: "All Regions", icon: "🌍" },
  { name: "Europe", label: "Europe", icon: "🇪🇺" },
  { name: "Asia", label: "Asia", icon: "🌏" },
  { name: "North America", label: "North America", icon: "🌎" },
  { name: "South America", label: "South America", icon: "🌎" },
  { name: "Africa", label: "Africa", icon: "🌍" },
  { name: "Oceania", label: "Oceania", icon: "🌊" },
  { name: "Middle East", label: "Middle East", icon: "🕌" },
];

const Countries = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedRegion = searchParams.get("region") || "All";
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch countries with search stats
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries-list", selectedRegion, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("countries")
        .select(`
          *,
          search_stats(search_count, page_view_count)
        `)
        .order("name");

      if (selectedRegion !== "All") {
        query = query.or(`continent.eq.${selectedRegion},region.eq.${selectedRegion}`);
      }

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleRegionChange = (region: string) => {
    if (region === "All") {
      navigate("/countries");
    } else {
      navigate(`/countries?region=${encodeURIComponent(region)}`);
    }
  };

  // Calculate total stats
  const totalSearches = countries.reduce(
    (sum, c) => sum + (c.search_stats?.[0]?.search_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Requirements by Country – Browse 200+ Destinations | Visas.Guide"
        description="Explore visa requirements for 200+ countries. Find entry rules, visa-free access, eVisa options, and travel documentation for every destination worldwide."
        canonical="https://visas.guide/countries"
        keywords={["country visa requirements", "visa by country", "travel destinations", "visa information", "country entry requirements", "international travel"]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Requirements by Country
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete visa information, requirements, and application guides for travel destinations worldwide
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for a country or destination..."
              className="pl-10 py-3 text-lg border-2 border-border/50 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <span className="text-sm text-muted-foreground font-medium">Filter by Region:</span>
            {regions.map((region) => (
              <button
                key={region.name}
                onClick={() => handleRegionChange(region.name)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  selectedRegion === region.name
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-foreground border-border hover:border-primary hover:shadow-sm"
                }`}
              >
                <span className="text-lg" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>{region.icon}</span>
                <span className="text-sm font-medium">{region.label}</span>
                {selectedRegion === region.name && region.name !== "All" && (
                  <X className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Countries List */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {selectedRegion === "All"
                ? "All Countries"
                : `${selectedRegion} Countries`}
            </h2>
            <div className="text-sm text-muted-foreground">
              {countries.length} {countries.length === 1 ? "country" : "countries"} found
            </div>
          </div>

          {isLoading ? (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : countries.length > 0 ? (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {countries.map((country) => (
                <Link key={country.id} to={`/countries/${country.slug}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-5xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                          {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {country.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{country.region}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        {country.capital && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Capital: {country.capital}</span>
                          </div>
                        )}
                        {country.search_stats?.[0]?.page_view_count > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-accent" />
                            <span className="text-muted-foreground">
                              {country.search_stats[0].page_view_count.toLocaleString()} views
                            </span>
                          </div>
                        )}
                        {country.visa_free_destinations && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {country.visa_free_destinations} visa-free destinations
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No countries found.</p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <h3 className="text-3xl font-bold text-primary">{countries.length}+</h3>
                  <p className="text-muted-foreground">Countries Covered</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">{totalSearches.toLocaleString()}+</h3>
                  <p className="text-muted-foreground">Total Searches</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">24/7</h3>
                  <p className="text-muted-foreground">Updates Monitoring</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">99%</h3>
                  <p className="text-muted-foreground">Accuracy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Countries;