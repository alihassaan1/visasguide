import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle, XCircle, AlertCircle, Clock, DollarSign, FileText, Globe, Plane, MapPin, Info, Loader2 } from "lucide-react";
import RelatedVisaLinks from "@/components/RelatedVisaLinks";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { usePageTracking } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AuthorBio from "@/components/AuthorBio";
import ArticleSchema from "@/components/ArticleSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const VisaRequirements = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
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

  // Fetch AI-generated content page if visa data doesn't exist - try multiple slug formats
  const { data: contentPage, isLoading: contentLoading } = useQuery({
    queryKey: ['visa-content-page', fromSlug, toSlug],
    queryFn: async () => {
      // Try multiple slug formats for compatibility
      const slugFormats = [
        `${fromSlug}-to-${toSlug}-visa-requirements`,
        `visa-requirements/${fromSlug}-to-${toSlug}`,
        `${fromSlug}-to-${toSlug}`,
      ];
      
      for (const slugFormat of slugFormats) {
        const { data, error } = await supabase
          .from('content_pages')
          .select('*')
          .eq('slug', slugFormat)
          .eq('is_published', true)
          .maybeSingle();
        
        if (data && !error) return data;
      }
      
      // Also search with ILIKE for partial matches
      const { data: iLikeData, error: iLikeError } = await supabase
        .from('content_pages')
        .select('*')
        .ilike('slug', `%${fromSlug}%${toSlug}%visa%`)
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();
      
      if (iLikeData && !iLikeError) return iLikeData;
      
      return null;
    },
    enabled: !!fromSlug && !!toSlug && !visaRequirement
  });

  // Auto-generate content when no data exists
  useEffect(() => {
    const generateContent = async () => {
      // Don't generate if we already have data, content, or are already generating
      if (visaRequirement || contentPage || isGenerating || generatedContent) return;
      // Don't generate if still loading
      if (isLoading || contentLoading) return;
      // Don't generate if we don't have country data
      if (!fromCountry || !toCountry) return;

      setIsGenerating(true);
      
      try {
        console.log(`Auto-generating visa content for ${fromSlug} → ${toSlug}`);
        
        const { data, error } = await supabase.functions.invoke('generate-visa-content', {
          body: { fromSlug, toSlug }
        });

        if (error) throw error;

        if (data?.success && data?.content) {
          setGeneratedContent(data.content);
          // Invalidate the content page query to pick up the newly saved content
          queryClient.invalidateQueries({ queryKey: ['visa-content-page', fromSlug, toSlug] });
          
          if (!data.cached) {
            toast({
              title: "Content Generated",
              description: "Visa information has been generated for this route."
            });
          }
        }
      } catch (error: any) {
        console.error('Error generating visa content:', error);
        // Don't show error toast for every failed generation
      } finally {
        setIsGenerating(false);
      }
    };

    generateContent();
  }, [visaRequirement, contentPage, isLoading, contentLoading, fromCountry, toCountry, fromSlug, toSlug, isGenerating, generatedContent, queryClient, toast]);

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

  if (isLoading || contentLoading || !fromCountry || !toCountry) {
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

  // Determine which content to display
  const displayContent = generatedContent || contentPage?.content;

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
        ) : displayContent ? (
          // Display AI-generated content (either newly generated or from database)
          <div className="space-y-6">
            {contentPage?.featured_image_url && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img 
                  src={contentPage.featured_image_url} 
                  alt={contentPage.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            
            <Card>
              <CardContent className="prose prose-slate max-w-none pt-6">
                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
              </CardContent>
            </Card>
          </div>
        ) : isGenerating ? (
          // Show generating state
          <Card className="border-dashed border-2">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generating Visa Information</h3>
                <p className="text-muted-foreground max-w-md">
                  We're gathering detailed visa information for {fromCountry.name} citizens traveling to {toCountry.name}. 
                  This will only take a moment...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Fallback Content - shown if generation fails */}
            <Card className="border-dashed border-2">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Country flags display */}
                  <div className="flex items-center gap-4 text-6xl">
                    <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                      {fromCountry.flag_emoji || countryCodeToFlagEmoji(fromCountry.code) || '🏳️'}
                    </span>
                    <span className="text-2xl text-muted-foreground">→</span>
                    <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                      {toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <Info className="h-6 w-6 text-visa-info mt-1 shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Visa Information Coming Soon</h3>
                        <p className="text-muted-foreground">
                          We're working on gathering detailed visa information for {fromCountry.name} citizens traveling to {toCountry.name}. 
                          In the meantime, here's what we recommend:
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 mt-6">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Check Embassy Information
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Contact the {toCountry.name} embassy or consulate in {fromCountry.name} for official visa requirements.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          General Travel Tips
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Ensure your passport is valid for at least 6 months beyond your travel dates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dynamic Related Links Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Related Information</h2>
          <RelatedVisaLinks fromCountry={fromCountry} toCountry={toCountry} />
        </div>

        {/* Author Bio - E-E-A-T Signal */}
        <div className="mt-8">
          <AuthorBio />
        </div>

        {/* Article Schema for SEO */}
        <ArticleSchema
          title={`${toCountry?.name} Visa Requirements for ${fromCountry?.name} Citizens`}
          description={`Complete visa guide for ${fromCountry?.name} passport holders visiting ${toCountry?.name}. Requirements, fees, processing times, and application process.`}
          url={`https://visas.guide/visa-requirements/${slug}`}
          keywords={[
            `${toCountry?.name} visa`,
            `${fromCountry?.name} to ${toCountry?.name}`,
            "visa requirements",
            "travel documentation"
          ]}
        />

        {/* Breadcrumb Schema for SEO */}
        <BreadcrumbSchema
          items={[
            { name: "Visa Requirements", url: "/visa-search" },
            { name: fromCountry?.name || "", url: `/countries/${fromSlug}` },
            { name: `${fromCountry?.name} to ${toCountry?.name}`, url: `/visa-requirements/${slug}` },
          ]}
          showVisual={false}
        />
      </main>

      <Footer />
    </div>
  );
};

export default VisaRequirements;
