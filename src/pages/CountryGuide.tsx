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

const CountryGuide = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  
  const { data: country, isLoading: countryLoading } = useQuery({
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

  return (
    <div className="min-h-screen bg-background">
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
        {/* Country Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl font-emoji">{country.flag_emoji || (country.code ? countryCodeToFlagEmoji(country.code) : '🏳️')}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{country.name}</h1>
              <p className="text-xl text-muted-foreground">Complete Visa & Travel Information</p>
            </div>
          </div>
        </div>

        {/* Country Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                {country.visa_free_destinations || 0}
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
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visa Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Visa Requirements for {country.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Countries that can travel to {country.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visaRequirements?.slice(0, 10).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-emoji">{req.from_country?.flag_emoji || (req.from_country?.code ? countryCodeToFlagEmoji(req.from_country.code) : '🏳️')}</span>
                      <span className="font-medium">{req.from_country?.name}</span>
                    </div>
                    <Badge className={getRequirementColor(req.requirement_type)}>
                      {formatRequirementType(req.requirement_type)}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No visa requirement data available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Times
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current visa processing times for {country.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingTimes?.map((time) => (
                  <div key={time.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{time.visa_type}</p>
                      {time.embassy_location && (
                        <p className="text-sm text-muted-foreground">{time.embassy_location}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {time.processing_time_days} days
                    </Badge>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No processing time data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visa-Free Countries Link */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Visa-Free Countries for {country.name} Passport Holders
                </h3>
                <p className="text-muted-foreground">
                  Discover all countries you can visit with a {country.name} passport - visa-free, visa on arrival, e-visa, and more
                </p>
              </div>
              <Link 
                to={`/countries/${country.slug}/visa-free`}
                className="ml-4"
              >
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                  View All Destinations →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Essential Travel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Before You Travel</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Check passport validity (6+ months remaining)</li>
                  <li>• Verify visa requirements for your nationality</li>
                  <li>• Review vaccination requirements</li>
                  <li>• Purchase travel insurance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Documentation</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Valid passport</li>
                  <li>• Visa (if required)</li>
                  <li>• Return/onward ticket proof</li>
                  <li>• Accommodation confirmation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CountryGuide;