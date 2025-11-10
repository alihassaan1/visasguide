import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle, XCircle, AlertCircle, Clock, DollarSign, FileText, Globe, Plane, Loader2 } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { usePageTracking } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const VisaRequirements = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Parse slug to get from and to country slugs (format: "india-to-uae")
  const slugParts = slug?.split("-to-");
  const fromSlug = slugParts?.[0];
  const toSlug = slugParts?.[1];

  usePageTracking(`visa-requirements-${slug}`);

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries-visa-req'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const fromCountry = countries.find(c => c.slug === fromSlug);
  const toCountry = countries.find(c => c.slug === toSlug);

  // Toast and import handler
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const handleImport = async () => {
    if (!fromCountry) return;
    try {
      setImporting(true);
      const { error } = await supabase.functions.invoke('visa-data-import', {
        body: { source: 'travel-buddy', fromCountryCodeFilter: fromCountry.code }
      });
      if (error) throw error;
      toast({
        title: 'Import started',
        description: 'Fetching visa data. Please refresh this page in ~1 minute.',
      });
    } catch (e: any) {
      toast({
        title: 'Import failed',
        description: e?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  // Fetch visa requirement
  const { data: visaRequirement, isLoading } = useQuery({
    queryKey: ['visa-requirement', fromCountry?.id, toCountry?.id],
    queryFn: async () => {
      if (!fromCountry || !toCountry) return null;

      const { data, error } = await supabase
        .from('visa_requirements')
        .select('*')
        .eq('from_country_id', fromCountry.id)
        .eq('to_country_id', toCountry.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!fromCountry && !!toCountry
  });

  const getRequirementBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'visa free':
      case 'visa_free':
        return <Badge className="bg-visa-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Visa Free</Badge>;
      case 'evisa':
      case 'e_visa':
        return <Badge className="bg-visa-info text-white"><Globe className="h-3 w-3 mr-1" />eVisa Available</Badge>;
      case 'visa on arrival':
      case 'visa_on_arrival':
        return <Badge className="bg-visa-warning text-white"><Plane className="h-3 w-3 mr-1" />Visa on Arrival</Badge>;
      case 'visa required':
      case 'visa_required':
        return <Badge className="bg-visa-error text-white"><FileText className="h-3 w-3 mr-1" />Visa Required</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  if (isLoading || !fromCountry || !toCountry) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${toCountry.name} Visa Requirements for ${fromCountry.name} Citizens`;
  const metaDescription = `Complete visa requirements guide for ${fromCountry.name} passport holders traveling to ${toCountry.name}. Get up-to-date information on visa types, processing times, fees, and required documents.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageTitle}
        description={metaDescription}
        canonical={`https://visas.guide/visa-requirements/${slug}`}
        keywords={[
          `${toCountry.name} visa`,
          `${toCountry.name} visa for ${fromCountry.name}`,
          `${fromCountry.name} to ${toCountry.name} visa`,
          `${toCountry.name} visa requirements`,
          `${toCountry.name} visa application`,
          `${fromCountry.name} passport ${toCountry.name} visa`
        ]}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": pageTitle,
            "description": metaDescription,
            "author": {
              "@type": "Organization",
              "name": "Visas Guide"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Visas Guide"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://visas.guide/visa-requirements/${slug}`
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/visa-search">Visa Requirements</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{fromCountry.name} to {toCountry.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="mr-3" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
              {toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️'}
            </span>
            {toCountry.name} Visa Requirements for {fromCountry.name} Citizens
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete guide for {fromCountry.name} passport holders traveling to {toCountry.name}
          </p>
        </div>

        {visaRequirement ? (
          <div className="grid gap-6">
            {/* Visa Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                    {fromCountry.flag_emoji || countryCodeToFlagEmoji(fromCountry.code) || '🏳️'}
                  </span>
                  <span className="text-2xl">→</span>
                  <span className="text-3xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                    {toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️'}
                  </span>
                  <span>Visa Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    {getRequirementBadge(visaRequirement.requirement_type)}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {visaRequirement.max_stay_days && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-visa-info mt-1" />
                        <div>
                          <p className="font-medium">Maximum Stay</p>
                          <p className="text-2xl font-bold">{visaRequirement.max_stay_days} days</p>
                        </div>
                      </div>
                    )}
                    
                    {visaRequirement.processing_time_days && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-visa-warning mt-1" />
                        <div>
                          <p className="font-medium">Processing Time</p>
                          <p className="text-2xl font-bold">{visaRequirement.processing_time_days} days</p>
                        </div>
                      </div>
                    )}
                    
                    {visaRequirement.fee_usd && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-visa-success mt-1" />
                        <div>
                          <p className="font-medium">Visa Fee</p>
                          <p className="text-2xl font-bold">${visaRequirement.fee_usd}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Card */}
            {visaRequirement.requirements && visaRequirement.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {visaRequirement.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-visa-success mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            {visaRequirement.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{visaRequirement.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Visa Information Available</h3>
              <p className="text-muted-foreground mb-6">
                We don't have visa requirement information for this country combination yet.
              </p>
              <div className="flex flex-col items-center gap-3 mb-6">
                <Button onClick={handleImport} disabled={importing}>
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Try importing data now
                </Button>
                <p className="text-sm text-muted-foreground">This may take up to a minute. Refresh after it completes.</p>
              </div>
              <Link 
                to={`/countries/${toCountry.slug}`}
                className="text-primary hover:underline"
              >
                View general information about {toCountry.name} →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Related Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={`/countries/${fromCountry.slug}`} className="block text-primary hover:underline">
              → View {fromCountry.name} passport information
            </Link>
            <Link to={`/countries/${toCountry.slug}`} className="block text-primary hover:underline">
              → View {toCountry.name} visa requirements
            </Link>
            <Link to="/visa-search" className="block text-primary hover:underline">
              → Search other visa requirements
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VisaRequirements;
