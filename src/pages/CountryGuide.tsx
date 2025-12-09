import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, FileText, Globe, Users, MapPin } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { useEffect, useRef } from "react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePageTracking } from "@/hooks/useAnalytics";

const CountryGuide = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  
  // Track page views and time spent
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

  // Fetch country guide content from content_pages
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

  // Track page view when country data loads
  useEffect(() => {
    if (country?.id) {
      supabase.rpc('increment_page_view_count', { p_country_id: country.id });
    }
  }, [country?.id]);

  // Lazy backfill: if core fields are missing, trigger countries-backfill for this country and refetch
  const hasBackfilledRef = useRef(false);
  useEffect(() => {
    if (!country || hasBackfilledRef.current) return;
    const missingCore = !country.capital || !country.currency || !country.region || !country.continent || !country.language || !country.population || country.visa_free_destinations == null;
    if (missingCore) {
      hasBackfilledRef.current = true;
      supabase.functions
        .invoke('countries-backfill', { body: { code: country.code } })
        .then(() => {
          // Refetch country to get fresh data
          refetchCountry();
        })
        .catch(() => {
          // ignore silently; UI already handles fallbacks
        });
    }
  }, [country, refetchCountry]);

  const { data: visaRequirements } = useQuery({
    queryKey: ['visa-requirements', country?.id],
    queryFn: async () => {
      if (!country?.id) return [];
      
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          *,
          from_country:countries!visa_requirements_from_country_id_fkey(name, code, flag_emoji),
          to_country:countries!visa_requirements_to_country_id_fkey(name, code, flag_emoji)
        `)
        .eq('to_country_id', country.id)
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!country?.id
  });

  // Fallback: compute visa-free destinations count if missing in countries table
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

  // Query for visa on arrival count
  const { data: visaOnArrivalCount } = useQuery({
    queryKey: ['visa-on-arrival-count', country?.id],
    queryFn: async () => {
      if (!country?.id) return 0;
      const { count, error } = await supabase
        .from('visa_requirements')
        .select('id', { count: 'exact', head: true })
        .eq('from_country_id', country.id)
        .eq('requirement_type', 'visa_on_arrival');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!country?.id
  });

  // Query for visa required count
  const { data: visaRequiredCount } = useQuery({
    queryKey: ['visa-required-count', country?.id],
    queryFn: async () => {
      if (!country?.id) return 0;
      const { count, error } = await supabase
        .from('visa_requirements')
        .select('id', { count: 'exact', head: true })
        .eq('from_country_id', country.id)
        .eq('requirement_type', 'visa_required');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!country?.id
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
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatRequirementType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (countryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
            <p className="text-muted-foreground">The country you're looking for doesn't exist in our database.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // CTR-optimized country name abbreviations for better search query matching
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
  
  // Get CTR-optimized display name
  const ctrName = countryAbbreviations[country.slug] || country.name;
  
  // Use guide content meta if available (CTR-optimized by content agent)
  const metaTitle = guideContent?.meta_title || 
    `${ctrName} Visa Requirements 2025 | ${country.name !== ctrName ? country.name + ' ' : ''}Entry Guide & Requirements`;
  
  const metaDescription = guideContent?.meta_description || 
    `Do you need a visa for ${ctrName}? ✓ Complete ${country.name} visa requirements ✓ Visa-free countries ✓ Application process ✓ Processing times. Updated 2025 guide.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://visas.guide/countries/${country.slug}`}
        keywords={[`${country.name} visa`, `${country.name} visa requirements`, `${country.name} visa-free countries`, `${country.name} passport`, `${country.name} evisa`, `travel to ${country.name}`, `${country.name} visa application`]}
      />
      
      {/* SEO Meta Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${country.name} Visa Requirements & Travel Guide`,
            "description": `Complete visa requirements, passport information, and travel guide for ${country.name}. Get up-to-date visa information for travelers.`,
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
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
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

        {/* Country Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>{country.flag_emoji || countryCodeToFlagEmoji(country.code) || '🏳️'}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{country.name}</h1>
              <p className="text-xl text-muted-foreground">Complete Visa & Travel Information</p>
            </div>
          </div>
        </div>

        {/* Country Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                #{country.passport_rank || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Passport Rank</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {country.visa_free_destinations || computedVisaFreeCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Visa-Free Access</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {country.population ? (country.population / 1000000).toFixed(1) + 'M' : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Population</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {country.passport_score || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Passport Score</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {visaOnArrivalCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Visa on Arrival</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {visaRequiredCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Visa Required</div>
            </CardContent>
          </Card>
        </div>

        {/* Country Guide Content */}
        {guideContent && (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: guideContent.content }}
              />
            </CardContent>
          </Card>
        )}

        {/* Country Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Country Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Capital City
                </div>
                <p className="font-medium">{country.capital || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Currency
                </div>
                <p className="font-medium">{country.currency || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Region
                </div>
                <p className="font-medium">{country.region || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Language
                </div>
                <p className="font-medium">{country.language || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check YOUR Visa Requirements Widget */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Check If YOU Need a Visa for {country.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Select your passport country to see exact visa requirements
                </p>
              </div>
              <Link to="/visa-search" className="shrink-0">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Check Requirements →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Who Can Visit - Visa Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Who Can Visit {country.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visa requirements by passport nationality
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visaRequirements && visaRequirements.length > 0 ? (
                  visaRequirements.slice(0, 8).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>{req.from_country?.flag_emoji || countryCodeToFlagEmoji(req.from_country?.code) || '🏳️'}</span>
                        <span className="font-medium text-sm">{req.from_country?.name}</span>
                      </div>
                      <Badge className={getRequirementColor(req.requirement_type)}>
                        {formatRequirementType(req.requirement_type)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Visa requirement data coming soon.</p>
                )}
                {visaRequirements && visaRequirements.length > 8 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{visaRequirements.length - 8} more countries
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Times - Only show if data exists */}
          {processingTimes && processingTimes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Processing Times
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estimated visa processing times for {country.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processingTimes.map((time) => (
                    <div key={time.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{time.visa_type}</p>
                        {time.embassy_location && (
                          <p className="text-xs text-muted-foreground">{time.embassy_location}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {time.processing_time_days} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* If no processing times, show travel tips instead */}
          {(!processingTimes || processingTimes.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Travel Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Before You Go</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Check passport validity (6+ months)</li>
                    <li>• Verify visa requirements for your nationality</li>
                    <li>• Review vaccination requirements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Essential Documents</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Valid passport</li>
                    <li>• Visa (if required)</li>
                    <li>• Return/onward ticket proof</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visa-Free Countries Link */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Where Can {country.name} Passport Holders Travel?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visa-free destinations, visa on arrival, and eVisa options
                </p>
              </div>
              <Link 
                to={`/countries/${country.slug}/visa-free`}
                className="shrink-0"
              >
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm whitespace-nowrap">
                  View Destinations →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <div className="mt-12">
          <NewsletterSignup variant="sidebar" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CountryGuide;