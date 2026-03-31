import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Shield, ChevronLeft, ChevronRight, TrendingUp, MapPin, Plane, Award, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CURRENT_YEAR = new Date().getFullYear();

const PassportRankings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
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

  const continents = useMemo(() => {
    if (!allCountries) return [];
    const unique = [...new Set(allCountries.map(c => c.continent).filter(Boolean))];
    return unique.sort();
  }, [allCountries]);

  const filteredCountries = useMemo(() => {
    if (!allCountries) return [];
    let filtered = allCountries;
    
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedContinent !== "all") {
      filtered = filtered.filter(country => country.continent === selectedContinent);
    }
    
    return filtered;
  }, [allCountries, searchTerm, selectedContinent]);

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCountries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCountries, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-500 text-white';
    if (rank <= 10) return 'bg-emerald-500 text-white';
    if (rank <= 25) return 'bg-blue-500 text-white';
    if (rank <= 50) return 'bg-indigo-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const topCountries = allCountries?.slice(0, 5) || [];
  const totalCountriesCount = allCountries?.length || 0;
  const avgScore = allCountries ? Math.round(allCountries.reduce((sum, c) => sum + (c.passport_score || 0), 0) / allCountries.length) : 0;
  const maxScore = allCountries ? Math.max(...allCountries.map(c => c.passport_score || 0)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Passport Index ${CURRENT_YEAR}: World Passport Rankings & Travel Freedom | Visas.Guide`}
        description={`Compare ${totalCountriesCount || 199} passports ranked by global travel freedom in ${CURRENT_YEAR}. See visa-free access, visa on arrival, eVisa, and passport strength scores for every country. Updated ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}.`}
        canonical="https://visas.guide/passport-index"
        keywords={[
          'passport index', `passport rankings ${CURRENT_YEAR}`, 'strongest passports',
          'passport power rankings', 'visa free countries', 'passport strength',
          'global mobility', 'travel freedom index', 'passport score',
          'visa free access', 'best passports', 'passport comparison',
          'most powerful passport', 'visa on arrival', 'eVisa countries',
          `passport index ${CURRENT_YEAR}`, 'henley passport index',
          'destination significance score'
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `Passport Index Rankings ${CURRENT_YEAR}`,
            "description": `Comprehensive passport ranking system evaluating ${totalCountriesCount || 199} countries based on visa-free access, visa on arrival, eVisas, and global mobility. Updated ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}.`,
            "url": "https://visas.guide/passport-index",
            "keywords": "passport rankings, passport index, visa free countries, passport power, global mobility",
            "creator": { "@type": "Organization", "name": "Visas.Guide", "url": "https://visas.guide" },
            "license": "https://visas.guide/terms-of-service",
            "temporalCoverage": String(CURRENT_YEAR),
            "spatialCoverage": { "@type": "Place", "name": "Worldwide" }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the most powerful passport in ${CURRENT_YEAR}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": topCountries.length > 0 
                    ? `The ${topCountries[0].name} passport is ranked #1 in ${CURRENT_YEAR} with a score of ${topCountries[0].passport_score}, offering visa-free or visa-on-arrival access to the most destinations worldwide.`
                    : `Check our latest rankings for the most up-to-date passport power data.`
                }
              },
              {
                "@type": "Question",
                "name": "How is passport strength measured?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Passport strength is measured by counting the number of destinations a passport holder can access without a prior visa, including visa-free entry, visa on arrival (VOA), electronic travel authorization (eTA), and eVisa destinations."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between visa-free and visa on arrival?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Visa-free means you can enter a country without any visa. Visa on arrival (VOA) means you receive your visa at the port of entry. Both allow travel without advance visa application, but VOA may involve fees and paperwork at arrival."
                }
              }
            ]
          })
        }}
      />

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Globe className="h-4 w-4" />
                <span>Updated {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Passport Index {CURRENT_YEAR}: World Passport Rankings
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Comprehensive ranking of {totalCountriesCount || 199} passports by travel freedom. 
                Compare visa-free access, visa on arrival, eTA, eVisa, and overall mobility scores 
                for every country and territory worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="container mx-auto px-4 -mt-6 relative z-10 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Strongest</span>
              </div>
              <p className="text-lg font-bold">{topCountries[0]?.name || '—'}</p>
              <p className="text-sm text-muted-foreground">Score: {topCountries[0]?.passport_score || '—'}</p>
            </div>
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Highest Score</span>
              </div>
              <p className="text-lg font-bold">{maxScore}</p>
              <p className="text-sm text-muted-foreground">destinations accessible</p>
            </div>
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Countries</span>
              </div>
              <p className="text-lg font-bold">{totalCountriesCount}</p>
              <p className="text-sm text-muted-foreground">ranked worldwide</p>
            </div>
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Plane className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Avg Score</span>
              </div>
              <p className="text-lg font-bold">{avgScore}</p>
              <p className="text-sm text-muted-foreground">global average</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-12">
          {/* Top 5 Highlight */}
          {topCountries.length > 0 && !searchTerm && selectedContinent === "all" && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Top 5 Most Powerful Passports in {CURRENT_YEAR}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {topCountries.map((country, i) => (
                  <Link 
                    key={country.id} 
                    to={`/countries/${country.slug}`}
                    className="bg-card rounded-lg border p-4 hover:shadow-md transition-all hover:border-primary/50 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{country.flag_emoji || '🏳️'}</span>
                      <Badge className={getRankBadge(country.passport_rank!)}>
                        #{country.passport_rank}
                      </Badge>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{country.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-medium">{country.passport_score}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Visa-free</span>
                        <span className="font-medium">{country.visa_free_destinations || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by country name or code..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button 
                  variant={selectedContinent === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleContinentChange("all")}
                >
                  All
                </Button>
                {continents.map(c => (
                  <Button 
                    key={c} 
                    variant={selectedContinent === c ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleContinentChange(c!)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            {filteredCountries.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} countries
              </p>
            )}
          </section>

          {/* Rankings Table */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              {selectedContinent !== "all" ? `${selectedContinent} Passport Rankings` : `Complete Passport Rankings ${CURRENT_YEAR}`}
            </h2>
            <div className="bg-card rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Globe className="h-8 w-8 animate-spin mx-auto mb-3 opacity-50" />
                  <p>Loading passport rankings...</p>
                </div>
              ) : paginatedCountries.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold w-[200px]">Country</TableHead>
                          <TableHead className="font-bold text-center">Rank</TableHead>
                          <TableHead className="font-bold text-center">Score</TableHead>
                          <TableHead className="font-bold text-center">
                            <span className="hidden sm:inline">Visa Free</span>
                            <span className="sm:hidden">VF</span>
                          </TableHead>
                          <TableHead className="font-bold text-center">eTA</TableHead>
                          <TableHead className="font-bold text-center">
                            <span className="hidden sm:inline">Passport Free</span>
                            <span className="sm:hidden">PF</span>
                          </TableHead>
                          <TableHead className="font-bold text-center">VOA</TableHead>
                          <TableHead className="font-bold text-center">eVisa</TableHead>
                          <TableHead className="font-bold text-center">
                            <span className="hidden sm:inline">Visa Required</span>
                            <span className="sm:hidden">VR</span>
                          </TableHead>
                          <TableHead className="font-bold text-center">
                            <span className="hidden sm:inline">Entry Ban</span>
                            <span className="sm:hidden">EB</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCountries.map((country) => (
                          <TableRow key={country.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <Link 
                                to={`/countries/${country.slug}`}
                                className="flex items-center gap-2 hover:text-primary transition-colors font-medium"
                              >
                                <span className="text-xl">{country.flag_emoji || '🏳️'}</span>
                                <span>{country.name}</span>
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={getRankBadge(country.passport_rank!)}>
                                {getOrdinalSuffix(country.passport_rank!)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-semibold">{country.passport_score || '—'}</TableCell>
                            <TableCell className="text-center">{country.visa_free_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).eta_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).passport_free_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).voa_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).evisa_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).visa_required_destinations || 0}</TableCell>
                            <TableCell className="text-center">{(country as any).entry_ban_destinations || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={currentPage === 1}>First</Button>
                        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="hidden sm:flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                              <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => goToPage(pageNum)} className="w-9">
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  {searchTerm ? `No countries found matching "${searchTerm}"` : 'No countries found.'}
                </div>
              )}
            </div>
          </section>

          {/* Column Legend */}
          <section className="mt-6 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Info className="h-4 w-4" />
              Understanding the Columns
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><span className="font-medium">Score</span> — Total accessible destinations (visa-free + eTA + VOA + eVisa)</div>
              <div><span className="font-medium">Visa Free</span> — Countries allowing entry without any visa</div>
              <div><span className="font-medium">eTA</span> — Electronic travel authorization required before travel</div>
              <div><span className="font-medium">Passport Free</span> — Entry with national ID card only, no passport needed</div>
              <div><span className="font-medium">VOA</span> — Visa issued at the port of entry upon arrival</div>
              <div><span className="font-medium">eVisa</span> — Electronic visa obtained online before travel</div>
              <div><span className="font-medium">Visa Required</span> — Must apply at embassy/consulate in advance</div>
              <div><span className="font-medium">Entry Ban</span> — Countries with travel restrictions or bans</div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="strongest">
                <AccordionTrigger>What is the most powerful passport in {CURRENT_YEAR}?</AccordionTrigger>
                <AccordionContent>
                  {topCountries.length > 0 ? (
                    <p>
                      The <strong>{topCountries[0].name}</strong> passport holds the #1 rank in {CURRENT_YEAR} with a 
                      score of <strong>{topCountries[0].passport_score}</strong>, meaning its holders can access {topCountries[0].passport_score} destinations 
                      worldwide through visa-free entry, visa on arrival, eTA, or eVisa. It is followed by{' '}
                      {topCountries.slice(1, 5).map((c, i) => (
                        <span key={c.id}>
                          <strong>{c.name}</strong> (#{c.passport_rank})
                          {i < 3 ? (i === 2 ? ', and ' : ', ') : '.'}
                        </span>
                      ))}
                    </p>
                  ) : <p>Loading ranking data...</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="measurement">
                <AccordionTrigger>How is passport strength measured?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Passport strength is measured by counting the total number of destinations a passport holder 
                    can access without obtaining a traditional visa in advance. This includes: visa-free entry, 
                    visa on arrival (VOA), electronic travel authorization (eTA), and electronic visa (eVisa) 
                    destinations. The passport score represents the sum of all these accessible destinations.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="difference">
                <AccordionTrigger>What is the difference between visa-free and visa on arrival?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    <strong>Visa-free</strong> means you can enter a country by simply showing your passport at 
                    immigration — no visa paperwork or fees. <strong>Visa on arrival (VOA)</strong> means you 
                    receive your visa stamp at the airport or border upon arrival, which may involve filling 
                    out forms and paying a fee. Both options allow travel without applying for a visa at an 
                    embassy beforehand.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="eta">
                <AccordionTrigger>What is an eTA (Electronic Travel Authorization)?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    An eTA is an electronic entry requirement linked to your passport. Countries like Canada, 
                    Australia, and several others require travelers from visa-exempt nations to obtain an eTA 
                    online before boarding their flight. The process is usually quick, inexpensive, and can be 
                    completed entirely online in minutes.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="improve">
                <AccordionTrigger>Can passport rankings change over time?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Yes, passport rankings change frequently as countries sign new visa agreements, introduce 
                    electronic visa programs, or impose travel restrictions. Geopolitical events, diplomatic 
                    relations, and bilateral agreements all influence how many destinations a passport can 
                    access. Rankings are updated regularly to reflect the latest changes.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PassportRankings;
