import { Button } from "@/components/ui/button";
import { Search, Globe, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-travel-visa.jpg";
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
      {/* Full-width background image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Visa approved stamp with passports – visa requirements guide"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl">
          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
            Your Complete Guide to{" "}
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
              Travel Visas
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg">
            Navigate visa requirements for 200+ countries with up-to-date visa-free lists, eVisa details, and travel documentation tips.
          </p>

          {/* Floating Search Box - Pill shaped */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl border border-border/50 max-w-xl">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 md:px-8 h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!fromCountry || !toCountry}
              >
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-4 md:gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2 text-foreground/80">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">190+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <div className="w-8 h-8 rounded-full bg-visa-success/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-visa-success" />
              </div>
              <span className="font-medium">2M+ Travelers</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <div className="w-8 h-8 rounded-full bg-visa-warning/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-visa-warning" />
              </div>
              <span className="font-medium">Updated Daily</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
