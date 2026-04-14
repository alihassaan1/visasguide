import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, X, Globe, ChevronRight, Plane, FileText, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WorldVisaMap from "@/components/WorldVisaMap";
import ResidencyToggle, { ResidencyType } from "@/components/ResidencyToggle";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useState, useCallback } from "react";

const regions = [
  { name: "All", label: "All", icon: "🌍" },
  { name: "Europe", label: "Europe", icon: "🇪🇺" },
  { name: "Asia", label: "Asia", icon: "🌏" },
  { name: "North America", label: "N. America", icon: "🌎" },
  { name: "South America", label: "S. America", icon: "🌎" },
  { name: "Africa", label: "Africa", icon: "🌍" },
  { name: "Oceania", label: "Oceania", icon: "🌊" },
  { name: "Middle East", label: "Middle East", icon: "🕌" },
];

const Countries = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedRegion = searchParams.get("region") || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [residency, setResidency] = useState<ResidencyType>("none");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

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

  const handleCountryClick = useCallback((country: any) => {
    setSelectedCountry(country);
  }, []);

  const handleCountrySelect = useCallback((country: any) => {
    // Find full country data
    const full = countries.find(c => c.id === country.id || c.slug === country.slug);
    setSelectedCountry(full || country);
  }, [countries]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Requirements by Country – Browse 200+ Visa Destinations | Visas.Guide"
        description="Explore visa requirements for 200+ visa destinations worldwide. Find entry rules, visa-free access, eVisa options, and travel documentation for every country."
        canonical="https://visas.guide/countries"
        keywords={["visa destinations", "visa destination", "country visa requirements", "visa by country", "visa requirements by country", "travel visa requirements", "visa information", "country entry requirements", "international travel", "visa worldwide"]}
      />
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Compact Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
            Visa Requirements by Country
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse {countries.length}+ countries — click any to view details
          </p>
        </div>

        {/* Split Layout: List Left + Map Right */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          
          {/* LEFT PANEL — Country List */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search countries..."
                className="pl-9 h-9 text-sm border-border/50 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Region Filters */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {regions.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionChange(region.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedRegion === region.name
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>{region.icon}</span>
                  {region.label}
                </button>
              ))}
            </div>

            {/* Residency Toggle */}
            <div className="mb-3">
              <ResidencyToggle value={residency} onChange={setResidency} compact />
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-[600px] border border-border rounded-lg divide-y divide-border bg-card">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-8 h-6 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-2/3 mb-1" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : countries.length > 0 ? (
                countries.map((country) => {
                  const isSelected = selectedCountry?.id === country.id;
                  return (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50 ${
                        isSelected ? "bg-primary/10 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <span className="text-xl flex-shrink-0" style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                        {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {country.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {country.region || country.continent}
                          {country.capital && ` · ${country.capital}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {country.visa_free_destinations && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {country.visa_free_destinations} VF
                          </Badge>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No countries found.</p>
                  {searchQuery && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchQuery("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-muted-foreground text-center">
              {countries.length} {countries.length === 1 ? "country" : "countries"}
            </div>
          </div>

          {/* RIGHT PANEL — Map + Country Details */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Map */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-border shadow-sm">
              <WorldVisaMap
                countries={countries.map(c => ({
                  id: c.id,
                  name: c.name,
                  code: c.code,
                  slug: c.slug,
                  flag_emoji: c.flag_emoji || countryCodeToFlagEmoji(c.code) || "🏳️",
                }))}
                onCountryClick={(c) => {
                  const full = countries.find(fc => fc.code === c.code);
                  setSelectedCountry(full || c);
                }}
              />
            </div>

            {/* Country Details Panel */}
            {selectedCountry && (
              <Card className="border-primary/20 shadow-md animate-in slide-in-from-bottom-2 duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl" style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                        {selectedCountry.flag_emoji || countryCodeToFlagEmoji(selectedCountry.code) || "🏳️"}
                      </span>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          {selectedCountry.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedCountry.region || selectedCountry.continent}
                          {selectedCountry.capital && ` · Capital: ${selectedCountry.capital}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCountry(null)}
                      className="h-8 w-8 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {selectedCountry.visa_free_destinations != null && (
                      <div className="bg-green-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">{selectedCountry.visa_free_destinations}</div>
                        <div className="text-[11px] text-muted-foreground">Visa-Free</div>
                      </div>
                    )}
                    {selectedCountry.evisa_destinations != null && (
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">{selectedCountry.evisa_destinations}</div>
                        <div className="text-[11px] text-muted-foreground">eVisa</div>
                      </div>
                    )}
                    {selectedCountry.voa_destinations != null && (
                      <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-amber-600">{selectedCountry.voa_destinations}</div>
                        <div className="text-[11px] text-muted-foreground">Visa on Arrival</div>
                      </div>
                    )}
                    {selectedCountry.visa_required_destinations != null && (
                      <div className="bg-red-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-red-600">{selectedCountry.visa_required_destinations}</div>
                        <div className="text-[11px] text-muted-foreground">Visa Required</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCountry.passport_rank && (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Passport Rank: #{selectedCountry.passport_rank}
                      </Badge>
                    )}
                    {selectedCountry.currency && (
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {selectedCountry.currency}
                      </Badge>
                    )}
                    {selectedCountry.language && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {selectedCountry.language}
                      </Badge>
                    )}
                    {selectedCountry.population && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {(selectedCountry.population / 1_000_000).toFixed(1)}M people
                      </Badge>
                    )}
                  </div>

                  {/* CTA */}
                  <Link to={`/countries/${selectedCountry.slug}`}>
                    <Button className="w-full sm:w-auto gap-2">
                      <Plane className="h-4 w-4" />
                      View Full Visa Requirements
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Countries;
