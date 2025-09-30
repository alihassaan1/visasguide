import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, Shield, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-travel.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('countries')
        .select('code, name, flag_emoji')
        .ilike('name', `%${searchQuery}%`)
        .limit(8);

      if (!error && data) {
        setSuggestions(data);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSuggestionClick = (countryCode: string) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/countries/${countryCode}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/visa-search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
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
                Get accurate visa requirements, application guides, and travel documentation for over 190+ countries. 
                Travel with confidence.
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-card rounded-xl p-6 shadow-lg border max-w-md" ref={wrapperRef}>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Find Visa Requirements</h3>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input 
                      placeholder="Enter destination country..."
                      className="w-full"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((country) => (
                          <button
                            key={country.code}
                            onClick={() => handleSuggestionClick(country.code)}
                            className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-2xl">{country.flag_emoji}</span>
                            <span className="font-medium text-foreground">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
                  >
                    <Search className="h-4 w-4" />
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
                alt="Travel visas and passports" 
                className="w-full h-[500px] object-cover"
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
