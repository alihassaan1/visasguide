import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PassportRankings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data: allCountries, isLoading } = useQuery({
    queryKey: ['passport-rankings-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .not('passport_rank', 'is', null)
        .order('passport_rank', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!allCountries) return [];
    if (!searchTerm) return allCountries;
    
    return allCountries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCountries, searchTerm]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCountries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCountries, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-500 text-white';
    if (rank <= 10) return 'bg-green-500 text-white';
    if (rank <= 25) return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Passport Index Rankings 2026: Ranking Passports by Global Travel Freedom | Visas.Guide"
        description="Discover the world's most powerful passports in 2026. Compare 199 countries ranked by visa-free access, visa on arrival, eVisas, and global mobility. Find passport strength scores, travel freedom rankings, and destination access for every country. Updated January 2026."
        canonical="https://visas.guide/passport-index"
        keywords={[
          'passport index',
          'passport rankings 2026',
          'strongest passports',
          'passport power rankings',
          'visa free countries',
          'passport strength',
          'global mobility',
          'travel freedom index',
          'passport score',
          'visa free access',
          'best passports',
          'passport comparison',
          'visa requirements by country',
          'passport ranking by country',
          'most powerful passport',
          'visa on arrival',
          'eVisa countries',
          'travel document rankings',
          'passport index 2026',
          'henley passport index',
          'destination significance score'
        ]}
      />

      {/* Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Passport Index Rankings 2026",
            "description": "Comprehensive passport ranking system evaluating 199 countries and territories based on visa-free access, visa on arrival, eVisas, and global mobility. Updated for January 2026.",
            "url": "https://visas.guide/passport-index",
            "keywords": "passport rankings, passport index, visa free countries, passport power, global mobility, travel freedom",
            "creator": {
              "@type": "Organization",
              "name": "Visas.Guide",
              "url": "https://visas.guide"
            },
            "license": "https://visas.guide/terms-of-service",
            "temporalCoverage": "2026",
            "spatialCoverage": {
              "@type": "Place",
              "name": "Worldwide"
            },
            "about": {
              "@type": "Thing",
              "name": "Passport Strength Rankings",
              "description": "Rankings based on Destination Significance Score (DSS) measuring visa-free access, visa on arrival, and eVisa availability"
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Passport Index Rankings 2026: Ranking Passports by Global Travel Freedom</h1>
          <p className="text-xl text-muted-foreground mb-6">
            The Passport Index is a passport ranking system that evaluates 199 countries and territories based on factors like visa-free access, visa on arrival, eVisas, and global mobility.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Results count */}
          {filteredCountries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} countries
            </p>
          )}
        </div>

        {/* What is the Strongest Passport */}
        {allCountries && allCountries.length > 0 && !searchTerm && (
          <div className="mb-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">What is the Strongest Passport in the World?</h2>
            <p className="text-muted-foreground">
              The {allCountries[0].name} passport is the strongest passport in the world, with a score of {allCountries[0].passport_score} as of January 2026. 
              It is followed by the {allCountries[1]?.name}, {allCountries[2]?.name}, {allCountries[3]?.name} and {allCountries[4]?.name} passports respectively, 
              to complete the top-five list of strongest passports for January 2026.
            </p>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4">Here is the complete list of all the passports ranked according to their score:</h3>

        {/* Rankings Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading rankings...</div>
          ) : paginatedCountries && paginatedCountries.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Country Name</TableHead>
                      <TableHead className="font-bold">Passport Score</TableHead>
                      <TableHead className="font-bold">Passport Rank</TableHead>
                      <TableHead className="font-bold">Visa Free</TableHead>
                      <TableHead className="font-bold">eTA</TableHead>
                      <TableHead className="font-bold">Passport Free</TableHead>
                      <TableHead className="font-bold">VOA</TableHead>
                      <TableHead className="font-bold">eVisa</TableHead>
                      <TableHead className="font-bold">Visa Required</TableHead>
                      <TableHead className="font-bold">Entry Ban</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCountries.map((country) => (
                      <TableRow key={country.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Link 
                            to={`/countries/${country.slug}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors font-medium"
                          >
                            <span className="text-xl">{country.flag_emoji || '🏳️'}</span>
                            <span>{country.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold">{country.passport_score || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getRankBadge(country.passport_rank!)}>
                            {country.passport_rank}
                            {country.passport_rank === 1 ? 'st' : country.passport_rank === 2 ? 'nd' : country.passport_rank === 3 ? 'rd' : 'th'}
                          </Badge>
                        </TableCell>
                        <TableCell>{country.visa_free_destinations || 0}</TableCell>
                        <TableCell>{(country as any).eta_destinations || 0}</TableCell>
                        <TableCell>{(country as any).passport_free_destinations || 0}</TableCell>
                        <TableCell>{(country as any).voa_destinations || 0}</TableCell>
                        <TableCell>{(country as any).evisa_destinations || 0}</TableCell>
                        <TableCell>{(country as any).visa_required_destinations || 0}</TableCell>
                        <TableCell>{(country as any).entry_ban_destinations || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? `No countries found matching "${searchTerm}"` : 'No countries found.'}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PassportRankings;