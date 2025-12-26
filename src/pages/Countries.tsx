import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, X, List, Map as MapIcon, Grid } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WorldVisaMap from "@/components/WorldVisaMap";
import ResidencyToggle, { ResidencyType } from "@/components/ResidencyToggle";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useState } from "react";

// Import country images
import angolaImg from "@/assets/destinations/angola.jpg";
import polandImg from "@/assets/destinations/poland.jpg";
import hungaryImg from "@/assets/destinations/hungary.jpg";
import slovakiaImg from "@/assets/destinations/slovakia.jpg";
import lithuaniaImg from "@/assets/destinations/lithuania.jpg";
import sloveniaImg from "@/assets/destinations/slovenia.jpg";
import southKoreaImg from "@/assets/destinations/south-korea.jpg";
import icelandImg from "@/assets/destinations/iceland.jpg";
import southSudanImg from "@/assets/destinations/south-sudan.jpg";
import ivoryCoastImg from "@/assets/destinations/ivory-coast.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";
import pakistanImg from "@/assets/destinations/pakistan.jpg";
import defaultImg from "@/assets/hero-travel.jpg";

const countryImages: Record<string, string> = {
  'angola': angolaImg,
  'poland': polandImg,
  'hungary': hungaryImg,
  'slovakia': slovakiaImg,
  'lithuania': lithuaniaImg,
  'slovenia': sloveniaImg,
  'south-korea': southKoreaImg,
  'iceland': icelandImg,
  'south-sudan': southSudanImg,
  'ivory-coast': ivoryCoastImg,
  'japan': japanImg,
  'canada': canadaImg,
  'pakistan': pakistanImg,
};

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
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [residency, setResidency] = useState<ResidencyType>("none");

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries-list", selectedRegion, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("countries")
        .select(`*, search_stats(search_count, page_view_count)`)
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

  const handleCountryClick = (country: any) => {
    navigate(`/countries/${country.slug}`);
  };

  const getCountryImage = (slug: string) => {
    return countryImages[slug] || defaultImg;
  };

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
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Requirements by Country
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Click on any country to view detailed visa requirements and travel information
          </p>
        </div>

        {/* Residency Toggle */}
        <div className="max-w-3xl mx-auto mb-6">
          <ResidencyToggle value={residency} onChange={setResidency} compact />
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <MapIcon className="h-4 w-4" />
              Map View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="mb-8">
            <WorldVisaMap
              countries={countries.map(c => ({
                id: c.id,
                name: c.name,
                code: c.code,
                slug: c.slug,
                flag_emoji: c.flag_emoji || countryCodeToFlagEmoji(c.code) || "🏳️",
              }))}
              onCountryClick={handleCountryClick}
            />
          </div>
        ) : (
          <>
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
                    <span className="text-lg">{region.icon}</span>
                    <span className="text-sm font-medium">{region.label}</span>
                    {selectedRegion === region.name && region.name !== "All" && (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  {selectedRegion === "All" ? "All Countries" : `${selectedRegion} Countries`}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {countries.length} {countries.length === 1 ? "country" : "countries"} found
                </div>
              </div>

              {isLoading ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                      <div className="h-40 bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-6 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : countries.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {countries.map((country) => (
                    <Link key={country.id} to={`/countries/${country.slug}`}>
                      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1 h-full overflow-hidden">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={getCountryImage(country.slug)}
                            alt={`${country.name} destination`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                                {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                              </span>
                              <h3 className="text-lg font-bold text-white drop-shadow-lg">
                                {country.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{country.region}</p>
                            {country.capital && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Capital: {country.capital}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {country.search_stats?.[0]?.page_view_count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  {country.search_stats[0].page_view_count.toLocaleString()} views
                                </Badge>
                              )}
                              {country.visa_free_destinations && (
                                <Badge variant="outline" className="text-xs">
                                  {country.visa_free_destinations} visa-free
                                </Badge>
                              )}
                            </div>
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
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </section>
          </>
        )}

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
