import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, CheckCircle, Clock, FileCheck, AlertCircle } from "lucide-react";

const VisaFreeCountries = () => {
  const { countryCode } = useParams<{ countryCode: string }>();
  
  const { data: country, isLoading: countryLoading } = useQuery({
    queryKey: ['country', countryCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('code', countryCode?.toUpperCase())
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!countryCode
  });

  const { data: visaRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['visa-free-requirements', country?.id],
    queryFn: async () => {
      if (!country?.id) return [];
      
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          *,
          to_country:countries!visa_requirements_to_country_id_fkey(name, code, flag_emoji, capital, continent)
        `)
        .eq('from_country_id', country.id)
        .order('requirement_type');
      
      if (error) throw error;
      return data;
    },
    enabled: !!country?.id
  });

  const visaFreeCountries = visaRequirements?.filter(req => req.requirement_type === 'visa_free') || [];
  const visaOnArrivalCountries = visaRequirements?.filter(req => req.requirement_type === 'visa_on_arrival') || [];
  const eVisaCountries = visaRequirements?.filter(req => req.requirement_type === 'eTA_required' || req.requirement_type === 'evisa_required') || [];
  const visaRequiredCountries = visaRequirements?.filter(req => req.requirement_type === 'visa_required') || [];

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'visa_free': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'visa_on_arrival': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'eTA_required':
      case 'evisa_required': return <FileCheck className="h-5 w-5 text-blue-600" />;
      case 'visa_required': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  const getRequirementColor = (type: string) => {
    switch (type) {
      case 'visa_free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'visa_on_arrival': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'eTA_required':
      case 'evisa_required': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'visa_required': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatRequirementType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const CountrySection = ({ 
    title, 
    countries, 
    icon, 
    description 
  }: { 
    title: string; 
    countries: any[]; 
    icon: React.ReactNode; 
    description: string;
  }) => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {icon}
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="outline" className="w-fit mt-2">
          {countries.length} {countries.length === 1 ? 'Country' : 'Countries'}
        </Badge>
      </CardHeader>
      <CardContent>
        {countries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((req) => (
              <Link 
                key={req.id} 
                to={`/countries/${req.to_country?.code.toLowerCase()}`}
                className="group"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg hover:border-primary transition-all duration-200">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{req.to_country?.flag_emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {req.to_country?.name}
                      </p>
                      {req.max_stay_days && (
                        <p className="text-xs text-muted-foreground">
                          Max stay: {req.max_stay_days} days
                        </p>
                      )}
                      {req.to_country?.continent && (
                        <p className="text-xs text-muted-foreground">
                          {req.to_country.continent}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getRequirementColor(req.requirement_type)}>
                    {formatRequirementType(req.requirement_type)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No countries found in this category.
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (countryLoading || requirementsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
            "name": `Visa Free Countries for ${country.name} Passport Holders`,
            "description": `Complete list of visa-free countries, visa on arrival, e-visa, and visa required destinations for ${country.name} passport holders. Updated ${new Date().getFullYear()}.`,
            "url": `https://visas.guide/countries/${country.code.toLowerCase()}/visa-free`,
            "mainEntity": {
              "@type": "ItemList",
              "name": `Visa Free Countries for ${country.name}`,
              "numberOfItems": visaFreeCountries.length + visaOnArrivalCountries.length + eVisaCountries.length
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-7xl">{country.flag_emoji || '🏳️'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Visa Free Countries for {country.name} Passport Holders
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Comprehensive guide to all countries {country.name} passport holders can visit. 
            Find visa-free destinations, visa on arrival countries, e-visa options, and visa requirements.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{visaFreeCountries.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Visa Free</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-600">{visaOnArrivalCountries.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Visa on Arrival</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">{eVisaCountries.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">E-Visa</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-3xl font-bold text-red-600">{visaRequiredCountries.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Visa Required</p>
            </div>
          </div>

          {/* Passport Info */}
          {country.passport_rank && (
            <div className="mt-8 inline-block">
              <Badge variant="outline" className="text-lg px-6 py-2">
                <Plane className="h-4 w-4 mr-2" />
                Passport Rank: #{country.passport_rank}
                {country.visa_free_destinations && ` • ${country.visa_free_destinations} destinations`}
              </Badge>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mb-6">
          <Link 
            to={`/countries/${country.code.toLowerCase()}`}
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            ← Back to {country.name} Main Guide
          </Link>
        </div>

        {/* Country Sections */}
        <CountrySection
          title="Visa-Free Countries"
          countries={visaFreeCountries}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          description={`${country.name} passport holders can travel to these countries without a visa.`}
        />

        <CountrySection
          title="Visa on Arrival Countries"
          countries={visaOnArrivalCountries}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          description={`${country.name} passport holders can obtain a visa upon arrival at these destinations.`}
        />

        <CountrySection
          title="E-Visa Countries"
          countries={eVisaCountries}
          icon={<FileCheck className="h-6 w-6 text-blue-600" />}
          description={`${country.name} passport holders can apply for an electronic visa online for these countries.`}
        />

        <CountrySection
          title="Visa Required Countries"
          countries={visaRequiredCountries}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          description={`${country.name} passport holders must obtain a visa before traveling to these countries.`}
        />

        {/* Important Notes */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">Important Travel Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Visa requirements are subject to change. Always verify current requirements with the embassy or consulate before travel.</p>
            <p>• Some visa-free entries may have restrictions on maximum stay duration or purpose of visit.</p>
            <p>• Ensure your passport has at least 6 months validity from your planned entry date.</p>
            <p>• Some countries may require proof of return ticket, accommodation, and sufficient funds.</p>
            <p>• Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisaFreeCountries;
