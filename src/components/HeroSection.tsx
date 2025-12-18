import { Button } from "@/components/ui/button";
import { Search, Globe, Shield, Clock } from "lucide-react";
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
      {/* Video background */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
        >
          <source 
            src="https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Darker, more cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl">
          {/* Main heading - White text with shadows */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            Your Complete Guide to{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 md:px-8 h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!fromCountry || !toCountry}
              >
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Trust Indicators - Glass-morphism pills */}
          <div className="flex flex-wrap gap-3 md:gap-4 mt-8 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Globe className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="font-medium text-white">190+ Countries</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-teal-400" />
              </div>
              <span className="font-medium text-white">2M+ Travelers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="font-medium text-white">Updated Daily</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
