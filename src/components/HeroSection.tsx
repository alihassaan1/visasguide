import { Button } from "@/components/ui/button";
import { Search, Globe, Shield, Route, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { trackVisaSearch } from "@/hooks/useAnalytics";
import { useQuery } from "@tanstack/react-query";
import { CountryCombobox } from "@/components/CountryCombobox";

const HeroSection = () => {
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const navigate = useNavigate();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, slug, code, flag_emoji')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const handleSearch = () => {
    if (!fromCountry || !toCountry) return;

    const fromSlug = countries.find(c => c.id === fromCountry)?.slug;
    const toSlug = countries.find(c => c.id === toCountry)?.slug;
    
    if (!fromSlug || !toSlug) return;

    trackVisaSearch(fromCountry, toCountry).catch(console.error);
    navigate(`/visa-requirements/${fromSlug}-to-${toSlug}`);
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Airplane image background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
          alt="Airplane on runway at sunset - travel visa guide"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {/* Darker left-to-right overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl">
          {/* Main heading - White text with shadows */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-5 drop-shadow-lg">
            Your Complete Guide to{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text">
              Travel Visas
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-lg drop-shadow-md">
            Navigate visa requirements for 200+ countries with up-to-date visa-free lists, eVisa details, and travel documentation tips.
          </p>

          {/* Floating Search Box - Enhanced with glow */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 max-w-xl ring-1 ring-white/20">
            <div className="flex flex-col md:flex-row gap-3 md:gap-2 md:items-end">
              <div className="flex-1">
                <CountryCombobox
                  countries={countries}
                  value={fromCountry}
                  onValueChange={setFromCountry}
                  label="From"
                  placeholder="Your passport..."
                />
              </div>
              
              <div className="flex-1">
                <CountryCombobox
                  countries={countries}
                  value={toCountry}
                  onValueChange={setToCountry}
                  label="To"
                  placeholder="Destination..."
                />
              </div>

              <Button 
                onClick={handleSearch}
                size="lg"
                className={`rounded-xl px-6 md:px-8 h-11 shadow-lg transition-all duration-300 font-semibold text-white ${
                  fromCountry && toCountry
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-blue-600/30 hover:shadow-blue-600/50 hover:shadow-xl hover:scale-[1.03] cursor-pointer"
                    : "bg-blue-600/40 shadow-none cursor-not-allowed"
                }`}
                disabled={!fromCountry || !toCountry}
              >
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Search Visas</span>
              </Button>
            </div>
          </div>

          {/* Trust Indicators - Glass-morphism pills */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-8 text-sm">
            <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-sm">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-foreground">200+ Countries</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-sm">
              <Route className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-foreground">40,000+ Visa Routes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-cyan-600" />
              <span className="font-semibold text-foreground">ETIAS Updates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-sm">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-foreground">All Nationalities Covered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
