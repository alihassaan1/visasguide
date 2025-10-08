import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, DollarSign, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const VisaSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedVisaType, setSelectedVisaType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Fetch countries from Supabase
  const { data: countries = [] } = useQuery({
    queryKey: ['countries-visa-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Helper functions to get visa information
  function getVisaType(countryCode: string) {
    const visaTypes: Record<string, string> = {
      'US': 'ESTA/B1-B2',
      'GB': 'Standard Visitor', 
      'DE': 'Schengen Visa',
      'FR': 'Schengen Visa',
      'IT': 'Schengen Visa',
      'ES': 'Schengen Visa',
      'NL': 'Schengen Visa',
      'BE': 'Schengen Visa',
      'AT': 'Schengen Visa',
      'CH': 'Schengen Visa',
      'JP': 'Tourist Visa',
      'AU': 'ETA/Visitor',
      'CA': 'eTA/Visitor',
      'SG': 'Tourist Visa',
      'NZ': 'ETA/Visitor'
    };
    return visaTypes[countryCode] || 'Tourist Visa';
  }

  function getRequirement(countryCode: string) {
    const visaFree = ['JP', 'SG', 'MY', 'KR'];
    return visaFree.includes(countryCode) ? 'Visa Free' : 'Visa Required';
  }

  function getProcessingTime(countryCode: string) {
    const times: Record<string, string> = {
      'US': '1-3 days',
      'GB': '3-8 weeks',
      'DE': '10-15 days',
      'FR': '10-15 days', 
      'IT': '10-15 days',
      'ES': '10-15 days',
      'JP': 'N/A',
      'AU': '1-2 days',
      'CA': 'Minutes-weeks',
      'SG': 'N/A',
      'NZ': '3 days'
    };
    return times[countryCode] || '7-21 days';
  }

  function getFee(countryCode: string) {
    const fees: Record<string, string> = {
      'US': '$21 USD',
      'GB': '£95-£1,408',
      'DE': '€80-€160',
      'FR': '€80-€160',
      'IT': '€80-€160',
      'ES': '€80-€160',
      'JP': 'Free',
      'AU': '$20 AUD',
      'CA': '$7-$100 CAD', 
      'SG': 'Free',
      'NZ': '$12 NZD'
    };
    return fees[countryCode] || '$50-150 USD';
  }

  function getDifficulty(countryCode: string) {
    const easy = ['JP', 'SG', 'AU', 'NZ', 'CA', 'MY', 'KR'];
    const hard = ['GB', 'US', 'CN', 'IN'];
    if (easy.includes(countryCode)) return 'Easy';
    if (hard.includes(countryCode)) return 'Hard';
    return 'Medium';
  }

  function getDescription(countryCode: string, countryName: string) {
    const descriptions: Record<string, string> = {
      'US': 'Electronic System for Travel Authorization for tourism and business visits up to 90 days.',
      'GB': 'Standard visitor visa for tourism, business, and visiting family or friends.',
      'DE': 'Schengen visa allows travel to 26 European countries for up to 90 days.',
      'FR': 'Schengen visa for tourism, business, and visiting family in France and EU.',
      'IT': 'Schengen visa for tourism, business, and cultural visits to Italy and EU.',
      'ES': 'Schengen visa for tourism and business visits to Spain and European Union.',
      'JP': 'Visa-free entry for many nationalities for tourism up to 90 days.',
      'AU': 'Electronic Travel Authority for tourism and business visits up to 3 months.',
      'CA': 'Electronic Travel Authorization or visitor visa depending on nationality.',
      'SG': 'Visa-free entry for many nationalities for tourism up to 30-90 days.',
      'NZ': 'Electronic Travel Authority for tourism and business visits up to 3 months.'
    };
    return descriptions[countryCode] || `Visa requirements and travel information for ${countryName}.`;
  }

  function getRequirements(countryCode: string) {
    const requirements: Record<string, string[]> = {
      'US': ['Valid passport', 'Return ticket', 'Financial proof'],
      'GB': ['Valid passport', 'Financial documents', 'Accommodation proof', 'Travel insurance'],
      'DE': ['Valid passport', 'Travel insurance', 'Hotel booking', 'Financial proof'],
      'FR': ['Valid passport', 'Travel insurance', 'Accommodation proof', 'Financial documents'],
      'IT': ['Valid passport', 'Travel insurance', 'Hotel booking', 'Financial proof'],
      'ES': ['Valid passport', 'Travel insurance', 'Accommodation proof', 'Financial documents'],
      'JP': ['Valid passport', 'Return ticket'],
      'AU': ['Valid passport', 'Return ticket', 'Health declaration'],
      'CA': ['Valid passport', 'Travel documents', 'Financial proof'],
      'SG': ['Valid passport', 'Return ticket', 'Sufficient funds'],
      'NZ': ['Valid passport', 'Return ticket', 'Travel insurance']
    };
    return requirements[countryCode] || ['Valid passport', 'Return ticket', 'Financial proof'];
  }

  // Transform countries data to match visa search format
  const visaData = countries.map(country => ({
    country: country.name,
    flag: country.flag_emoji || '🏳️',
    visaType: getVisaType(country.code),
    requirement: getRequirement(country.code),
    processingTime: getProcessingTime(country.code),
    fee: getFee(country.code),
    difficulty: getDifficulty(country.code),
    region: country.continent || 'Other',
    description: getDescription(country.code, country.name),
    requirements: getRequirements(country.code),
    slug: country.slug
  }));

  const regions = ["all", "Europe", "North America", "Asia", "Oceania", "Africa", "South America"];
  const visaTypes = ["all", "Tourist Visa", "Schengen Visa", "ESTA/B1-B2", "ETA/Visitor", "eTA/Visitor", "Standard Visitor"];
  const difficulties = ["all", "Easy", "Medium", "Hard"];

  const filteredData = visaData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.visaType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "all" || item.region === selectedRegion;
    const matchesVisaType = selectedVisaType === "all" || item.visaType === selectedVisaType;  
    const matchesDifficulty = selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesRegion && matchesVisaType && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Visa Requirements Search - Find Visa Information by Country",
            "description": "Search visa requirements, processing times, and fees for travel destinations worldwide. Compare visa policies and find the best travel options.",
            "url": "https://visas.guide/visa-search"
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Search Visa Requirements by Country
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find visa requirements, processing times, fees, and application guides for any travel destination. Compare options and plan your trip with confidence.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="mb-12 space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="Search for a country or visa type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg border-2 border-border/50 focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region === "all" ? "All Regions" : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
              <SelectTrigger>
                <SelectValue placeholder="All Visa Types" />
              </SelectTrigger>
              <SelectContent>
                {visaTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Visa Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Difficulties" : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Results */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredData.length} Countries Found
            </h2>
            <div className="text-sm text-muted-foreground">
              Updated daily with latest visa information
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filteredData.map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <Link to={`/countries/${item.slug}`} className="flex items-center space-x-3 group-hover:text-primary transition-colors cursor-pointer flex-1">
                        <span className="text-3xl">{item.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            <span className="text-2xl">{item.flag}</span>
                            {item.country}
                          </h3>
                          <p className="text-muted-foreground">{item.visaType}</p>
                        </div>
                      </Link>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={item.requirement === "Visa Free" ? "default" : "secondary"}
                          className={item.requirement === "Visa Free" ? "bg-visa-success text-white" : ""}
                        >
                          {item.requirement === "Visa Free" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Visa Free
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Visa Required
                            </>
                          )}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={
                            item.difficulty === "Easy" ? "text-visa-success border-visa-success" :
                            item.difficulty === "Medium" ? "text-visa-warning border-visa-warning" :
                            "text-visa-danger border-visa-danger"
                          }
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-visa-info" />
                        <div>
                          <p className="text-xs text-muted-foreground">Processing Time</p>
                          <p className="text-sm font-medium text-foreground">{item.processingTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-visa-warning" />
                        <div>
                          <p className="text-xs text-muted-foreground">Visa Fee</p>
                          <p className="text-sm font-medium text-foreground">{item.fee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Preview */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Key Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.requirements.slice(0, 3).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {item.requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/countries/${item.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <MapPin className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/countries/${item.slug}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                          Read Guide
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all countries
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegion("all");
                  setSelectedVisaType("all");
                  setSelectedDifficulty("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </section>

        {/* Popular Searches */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Popular Visa Searches</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Most Searched Countries</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>🇺🇸 United States - ESTA</p>
                    <p>🇬🇧 United Kingdom - Visitor</p> 
                    <p>🇩🇪 Germany - Schengen</p>
                    <p>🇦🇺 Australia - ETA</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Visa-Free Destinations</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>🇯🇵 Japan - 90 days</p>
                    <p>🇸🇬 Singapore - 30-90 days</p>
                    <p>🇹🇭 Thailand - 30 days</p>
                    <p>🇲🇾 Malaysia - 90 days</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Quick Processing</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>🇦🇺 Australia ETA - 1-2 days</p>
                    <p>🇺🇸 USA ESTA - 1-3 days</p>
                    <p>🇨🇦 Canada eTA - Minutes</p>
                    <p>🇳🇿 New Zealand ETA - 3 days</p>
                  </div>
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

export default VisaSearch;