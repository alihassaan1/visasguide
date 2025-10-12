import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Plane, Globe, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PassportRankings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'destinations'>('rank');

  const { data: countries, isLoading } = useQuery({
    queryKey: ['passport-rankings', searchTerm, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('countries')
        .select('*')
        .not('passport_rank', 'is', null);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Sort based on selected criteria
      if (sortBy === 'rank') {
        query = query.order('passport_rank', { ascending: true });
      } else if (sortBy === 'score') {
        query = query.order('passport_score', { ascending: false });
      } else if (sortBy === 'destinations') {
        query = query.order('visa_free_destinations', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: topCountries } = useQuery({
    queryKey: ['top-passports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .not('passport_rank', 'is', null)
        .order('passport_rank', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (rank <= 10) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rank <= 25) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Passport Rankings 2024 - Global Passport Power Index",
            "description": "Discover the world's most powerful passports in 2024. Compare passport strength, visa-free destinations, and travel freedom by country.",
            "url": "https://visas.guide/passport-rankings",
            "mainEntity": {
              "@type": "Dataset",
              "name": "Global Passport Power Rankings",
              "description": "Comprehensive ranking of world passports by travel freedom and visa-free access"
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Global Passport Rankings 2024</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover the world's most powerful passports and compare travel freedom across countries.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'rank' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('rank')}
              >
                By Rank
              </Button>
              <Button
                variant={sortBy === 'score' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('score')}
              >
                By Score
              </Button>
              <Button
                variant={sortBy === 'destinations' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy('destinations')}
              >
                By Visa-Free
              </Button>
            </div>
          </div>
        </div>

        {/* Top 10 Podium */}
        {topCountries && topCountries.length > 0 && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Top 10 Most Powerful Passports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topCountries.slice(0, 10).map((country, index) => (
                <Card key={country.id} className={`relative overflow-hidden ${index < 3 ? 'ring-2 ring-yellow-400' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getRankBadge(country.passport_rank!)}>
                        #{country.passport_rank}
                      </Badge>
                      {index < 3 && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-4xl mb-2 block" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>{country.flag_emoji || '🏳️'}</span>
                      <h3 className="font-semibold text-sm">{country.name}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Plane className="h-3 w-3" />
                        <span>{country.visa_free_destinations || 0} destinations</span>
                      </div>
                      {country.passport_score && (
                        <div className="text-sm font-medium">
                          Score: {country.passport_score}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Complete Rankings Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {searchTerm ? 'Search Results' : 'Complete Rankings'}
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : countries && countries.length > 0 ? (
            <div className="space-y-4">
              {countries.map((country) => (
                <Card key={country.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <Badge className={getRankBadge(country.passport_rank!)}>
                          #{country.passport_rank}
                        </Badge>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>{country.flag_emoji || '🏳️'}</span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              <Link 
                                to={`/countries/${country.code.toLowerCase()}`}
                                className="hover:text-primary transition-colors"
                              >
                                {country.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {country.continent} • {country.region}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Plane className="h-4 w-4" />
                            Visa-Free Destinations
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            {country.visa_free_destinations || 0}
                          </p>
                        </div>
                        
                        {country.passport_score && (
                          <div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <TrendingUp className="h-4 w-4" />
                              Passport Score
                            </div>
                            <p className="text-2xl font-bold">
                              {country.passport_score}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No countries found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Understanding Passport Power</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">What is Passport Power?</h3>
                <p className="text-sm text-muted-foreground">
                  Passport power measures the travel freedom that passport holders enjoy. 
                  It's calculated based on the number of destinations accessible without 
                  requiring a visa in advance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ranking Methodology</h3>
                <p className="text-sm text-muted-foreground">
                  Rankings are based on exclusive data from the International Air Transport 
                  Association (IATA) and cover 227 travel destinations including countries, 
                  territories, and special zones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PassportRankings;