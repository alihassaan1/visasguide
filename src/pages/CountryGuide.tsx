import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, FileText, Globe, Users, MapPin, TrendingUp, Plane, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePageTracking } from "@/hooks/useAnalytics";
import CountryHero from "@/components/CountryHero";
import AuthorBio from "@/components/AuthorBio";
import RelatedContent from "@/components/RelatedContent";
import ArticleSchema from "@/components/ArticleSchema";
import SocialShareButtons from "@/components/SocialShareButtons";
import { CountryCombobox } from "@/components/CountryCombobox";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";
import VisaAlertTicker from "@/components/VisaAlertTicker";
import CityCards from "@/components/CityCards";
import GetYourGuideWidget from "@/components/GetYourGuideWidget";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

const CountryGuide = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const navigate = useNavigate();
  const [selectedPassportCountry, setSelectedPassportCountry] = useState<string>("");
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  
  usePageTracking(`countries/${countrySlug}`);
  
  const { data: country, isLoading: countryLoading, refetch: refetchCountry } = useQuery({
    queryKey: ['country', countrySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('slug', countrySlug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!countrySlug
  });

  const { data: guideContent } = useQuery({
    queryKey: ['country-guide-content', countrySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', `countries/${countrySlug}`)
        .eq('is_published', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!countrySlug
  });

  useEffect(() => {
    if (country?.id) {
      supabase.rpc('increment_page_view_count', { p_country_id: country.id });
    }
  }, [country?.id]);

  // Lazy backfill for missing core data
  const hasBackfilledRef = useRef(false);
  const hasTravelStatsBackfilledRef = useRef(false);
  
  useEffect(() => {
    if (!country || hasBackfilledRef.current) return;
    const missingCore = !country.capital || !country.currency || !country.region || !country.continent || !country.language || !country.population || country.visa_free_destinations == null;
    if (missingCore) {
      hasBackfilledRef.current = true;
      supabase.functions
        .invoke('countries-backfill', { body: { code: country.code } })
        .then(() => refetchCountry())
        .catch(() => {});
    }
  }, [country, refetchCountry]);

  useEffect(() => {
    if (!country || hasTravelStatsBackfilledRef.current) return;
    const missingTravelStats = !country.annual_tourists && !country.tourism_rank;
    if (missingTravelStats) {
      hasTravelStatsBackfilledRef.current = true;
      supabase.functions
        .invoke('countries-travel-stats-backfill', { 
          body: { countryId: country.id, countryName: country.name } 
        })
        .then(() => refetchCountry())
        .catch(() => {});
    }
  }, [country, refetchCountry]);

  // Fetch all countries for passport selector
  const { data: allCountries } = useQuery({
    queryKey: ['all-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code, flag_emoji, slug')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: visaRequirements } = useQuery({
    queryKey: ['visa-requirements', country?.id],
    queryFn: async () => {
      if (!country?.id) return [];
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          *,
          from_country:countries!visa_requirements_from_country_id_fkey(name, code, flag_emoji, slug),
          to_country:countries!visa_requirements_to_country_id_fkey(name, code, flag_emoji)
        `)
        .eq('to_country_id', country.id)
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!country?.id
  });

  const { data: computedVisaFreeCount } = useQuery({
    queryKey: ['visa-free-count', country?.id],
    queryFn: async () => {
      if (!country?.id) return 0;
      const { count, error } = await supabase
        .from('visa_requirements')
        .select('id', { count: 'exact', head: true })
        .eq('from_country_id', country.id)
        .in('requirement_type', ['visa_free', 'visa_on_arrival', 'eTA_required', 'evisa_required']);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!country?.id && (country?.visa_free_destinations == null || country?.visa_free_destinations === 0)
  });

  const { data: processingTimes } = useQuery({
    queryKey: ['processing-times', country?.id],
    queryFn: async () => {
      if (!country?.id) return [];
      const { data, error } = await supabase
        .from('processing_times')
        .select('*')
        .eq('country_id', country.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!country?.id
  });

  const getRequirementColor = (type: string) => {
    switch (type) {
      case 'visa_free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'visa_on_arrival': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'eTA_required': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'visa_required': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatRequirementType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (countryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
            <p className="text-muted-foreground">The country you're looking for doesn't exist in our database.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const countryAbbreviations: Record<string, string> = {
    'saint-kitts-and-nevis': 'St Kitts',
    'united-states': 'USA',
    'united-kingdom': 'UK',
    'united-arab-emirates': 'UAE',
    'czech-republic': 'Czechia',
    'south-korea': 'South Korea',
    'new-zealand': 'New Zealand',
    'hong-kong': 'Hong Kong',
    'saudi-arabia': 'Saudi Arabia',
  };
  
  const ctrName = countryAbbreviations[country.slug] || country.name;
  
  const metaTitle = guideContent?.meta_title || 
    `${ctrName} Visa Requirements 2025 | ${country.name !== ctrName ? country.name + ' ' : ''}Entry Guide & Requirements`;
  
  const metaDescription = guideContent?.meta_description || 
    `Do you need a visa for ${ctrName}? ✓ Complete ${country.name} visa requirements ✓ Visa-free countries ✓ Application process ✓ Processing times. Updated 2025 guide.`;

  const visaFreeCount = country.visa_free_destinations || computedVisaFreeCount || 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://visas.guide/countries/${country.slug}`}
        keywords={[`${country.name} visa`, `${country.name} visa requirements`, `${country.name} visa-free countries`, `${country.name} passport`, `${country.name} evisa`, `travel to ${country.name}`]}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${country.name} Visa Requirements & Travel Guide`,
            "description": `Complete visa requirements, passport information, and travel guide for ${country.name}.`,
            "url": `https://visas.guide/countries/${country.slug}`,
            "mainEntity": {
              "@type": "Country",
              "name": country.name,
              "identifier": country.code
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/countries">Countries</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{country.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Country Hero */}
        <CountryHero country={country} />

        {/* Visa Alert Ticker */}
        <VisaAlertTicker countryId={country.id} countryName={country.name} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visa Summary Cards - Simplified 4 key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">#{country.passport_rank || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground mt-1">Passport Rank</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{visaFreeCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Visa-Free Access</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {country.annual_tourists ? formatNumber(country.annual_tourists) : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Annual Tourists</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {country.tourism_rank ? `#${country.tourism_rank}` : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Tourism Rank</div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Cities */}
            <CityCards 
              countryId={country.id} 
              countrySlug={country.slug} 
              countryName={country.name} 
            />

            {/* Check Your Visa CTA */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-5">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  Do YOU Need a Visa for {country.name}?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select your passport country to see exact requirements
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <CountryCombobox
                      countries={allCountries || []}
                      value={selectedPassportCountry}
                      onValueChange={setSelectedPassportCountry}
                      placeholder="Your passport country..."
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (selectedPassportCountry && allCountries) {
                        const fromCountry = allCountries.find(c => c.id === selectedPassportCountry);
                        if (fromCountry) {
                          navigate(`/visa-requirements/${fromCountry.slug}-to-${country.slug}-visa-requirements`);
                        }
                      }
                    }}
                    disabled={!selectedPassportCountry}
                    className="shrink-0"
                  >
                    Check Requirements →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Who Can Visit Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Who Can Visit {country.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {visaRequirements && visaRequirements.length > 0 ? (
                    <>
                      {visaRequirements.slice(0, showAllVisitors ? 50 : 8).map((req) => (
                        <Link 
                          key={req.id} 
                          to={`/visa-requirements/${req.from_country?.slug}-to-${country.slug}-visa-requirements`}
                          className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{req.from_country?.flag_emoji || countryCodeToFlagEmoji(req.from_country?.code) || '🏳️'}</span>
                            <span className="font-medium text-sm">{req.from_country?.name}</span>
                          </div>
                          <Badge className={`text-xs ${getRequirementColor(req.requirement_type)}`}>
                            {formatRequirementType(req.requirement_type)}
                          </Badge>
                        </Link>
                      ))}
                      {visaRequirements.length > 8 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllVisitors(!showAllVisitors)}
                          className="w-full mt-2 text-muted-foreground hover:text-foreground"
                        >
                          {showAllVisitors ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Show {Math.min(visaRequirements.length - 8, 42)} More Countries
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm py-4 text-center">Visa requirement data coming soon.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Processing Times & Entry Requirements */}
            {processingTimes && processingTimes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Processing Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {processingTimes.slice(0, 5).map((time) => (
                      <div key={time.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{time.visa_type}</p>
                          {time.embassy_location && (
                            <p className="text-xs text-muted-foreground">{time.embassy_location}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {time.processing_time_days} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entry Requirements Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Entry Requirements Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Essential Documents</h4>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>Valid passport (6+ months validity)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>Visa or eVisa (if required)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>Return/onward ticket</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">May Be Required</h4>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <span>Proof of accommodation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <span>Proof of sufficient funds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <span>Travel insurance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country Guide Content */}
            {guideContent && (
              <Card>
                <CardContent className="p-6">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: guideContent.content }}
                  />
                </CardContent>
              </Card>
            )}

            {/* GetYourGuide Widget - Only shows if configured in database */}
            <GetYourGuideWidget 
              countryId={country.id}
              numberOfItems={4}
            />

            {/* Social Share */}
            <SocialShareButtons
              url={`https://visas.guide/countries/${country.slug}`}
              title={`${country.name} Visa Guide`}
              description={`Complete visa requirements and travel guide for ${country.name}`}
            />

            {/* Author Bio */}
            <AuthorBio writerId={guideContent?.writer_id} />
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-5">
            {/* Country Quick Facts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Quick Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Capital
                  </span>
                  <span className="font-medium">{country.capital || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Currency
                  </span>
                  <span className="font-medium">{country.currency || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Region
                  </span>
                  <span className="font-medium">{country.region || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Language
                  </span>
                  <span className="font-medium">{country.language || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Population
                  </span>
                  <span className="font-medium">
                    {country.population ? formatNumber(country.population) : 'N/A'}
                  </span>
                </div>
                {country.tourism_revenue_usd && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" /> Tourism Revenue
                    </span>
                    <span className="font-medium">${formatNumber(country.tourism_revenue_usd)}</span>
                  </div>
                )}
                {country.peak_travel_months && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Peak Season
                    </span>
                    <span className="font-medium text-right text-xs">{country.peak_travel_months}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Visitor Origins */}
            {country.top_source_countries && country.top_source_countries.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Top Visitor Origins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {country.top_source_countries.slice(0, 5).map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* GetYourGuide Tours & Affiliate Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tours & Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AffiliateBannerContainer position="sidebar-right" />
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <NewsletterSignup variant="sidebar" />

            {/* Related Content */}
            <RelatedContent
              currentSlug={country.slug}
              contentType="country"
              country={country.slug}
            />
          </div>
        </div>

        {/* Article Schema */}
        <ArticleSchema
          title={`${country.name} Visa Guide`}
          description={`Complete visa requirements and travel guide for ${country.name}. Entry requirements, visa types, and travel tips.`}
          url={`https://visas.guide/countries/${country.slug}`}
          keywords={[
            `${country.name} visa`,
            `${country.name} travel guide`,
            "visa requirements",
            country.continent || ""
          ].filter(Boolean)}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CountryGuide;
