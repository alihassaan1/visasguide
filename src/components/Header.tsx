import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const Header = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase
        .from('countries')
        .select('id, name, slug, code, flag_emoji')
        .order('name');
      if (data) setCountries(data);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  const handleSelectCountry = (slug: string) => {
    navigate(`/countries/${slug}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            aria-label="Visas.Guide - Home"
          >
            <img 
              src={logo} 
              alt="Visas.Guide - Complete Visa Requirements and Travel Information" 
              className="h-20 w-auto"
              title="visas.guide"
            />
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/countries" className="text-sm font-medium hover:text-primary transition-colors">
              Countries
            </Link>
            <Link to="/visa-search" className="text-sm font-medium hover:text-primary transition-colors">
              Visa Search
            </Link>
            <Link to="/guides" className="text-sm font-medium hover:text-primary transition-colors">
              Guides
            </Link>
            <Link to="/news" className="text-sm font-medium hover:text-primary transition-colors">
              News
            </Link>
            <Link to="/passport-index" className="text-sm font-medium hover:text-primary transition-colors">
              Passport Index Rankings
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block relative" ref={searchRef}>
              <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search country or visa type..."
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 w-48"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
              {searchOpen && searchQuery && filteredCountries.length > 0 && (
                <div className="absolute top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleSelectCountry(country.slug)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-2"
                      >
                        <span className="text-xl">{country.flag_emoji}</span>
                        <div>
                          <div className="font-medium">{country.name}</div>
                          <div className="text-xs text-muted-foreground">{country.code}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;