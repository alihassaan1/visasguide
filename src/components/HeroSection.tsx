import { Button } from "@/components/ui/button";
import { Search, Globe, Shield, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-travel.jpg";
import { supabase } from "@/integrations/supabase/client";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackVisaSearch } from "@/hooks/useAnalytics";
import { useQuery } from "@tanstack/react-query";

const HeroSection = () => {
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const navigate = useNavigate();

  // Fetch all countries for dropdowns
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
    if (!fromCountry || !toCountry) {
      return;
    }

    // Find slugs for navigation
    const fromSlug = countries.find(c => c.id === fromCountry)?.slug;
    const toSlug = countries.find(c => c.id === toCountry)?.slug;
    
    if (!fromSlug || !toSlug) {
      console.error('Country slugs not found');
      return;
    }

    // Track the visa search (don't await to avoid blocking navigation)
    trackVisaSearch(fromCountry, toCountry).catch(console.error);
    
    // Navigate to visa search results immediately
    navigate(`/visa-search?from=${fromSlug}&to=${toSlug}`);
  };

  return (
    <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Complete Guide to{" "}
                <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                  Travel Visas
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Visas.Guide helps travelers navigate visa requirements for 200+ countries with up-to-date visa-free lists, eVisa details, and travel documentation tips.
              </p>
            </div>

            {/* Visa Search Box */}
            <div className="bg-card rounded-xl p-6 shadow-lg border max-w-md">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Check Visa Requirements</h3>
                <p className="text-sm text-muted-foreground">Select your passport country and destination</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From (Your Passport)</label>
                    <Select value={fromCountry} onValueChange={setFromCountry}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your country..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            <span className="flex items-center gap-2">
                              <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                                {country.flag_emoji || countryCodeToFlagEmoji(country.code) || '🏳️'}
                              </span>
                              <span>{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To (Destination)</label>
                    <Select value={toCountry} onValueChange={setToCountry}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select destination..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            <span className="flex items-center gap-2">
                              <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                                {country.flag_emoji || countryCodeToFlagEmoji(country.code) || '🏳️'}
                              </span>
                              <span>{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                    disabled={!fromCountry || !toCountry}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Visa Requirements
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-visa-info" />
                <span>190+ Countries</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-visa-success" />
                <span>Trusted by 2M+ Travelers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-visa-warning" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={heroImage} 
                alt="Complete visa requirements and travel documentation guide - passports, stamps, and visa application forms" 
                className="w-full h-[500px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
