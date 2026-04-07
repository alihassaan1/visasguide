import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle, FileText, AlertCircle, Info, Loader2, MapPin, Globe } from "lucide-react";
import RelatedVisaLinks from "@/components/RelatedVisaLinks";
import { stripEmbeddedSchemas } from "@/lib/contentFormatter";
import InternalLinkingModule from "@/components/InternalLinkingModule";
import VisaRequirementsHero from "@/components/VisaRequirementsHero";
import VisaQuickStats from "@/components/VisaQuickStats";
import VisaSidebar from "@/components/VisaSidebar";
import { usePageTracking } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AuthorBio from "@/components/AuthorBio";
import ArticleSchema from "@/components/ArticleSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import SocialShareButtons from "@/components/SocialShareButtons";

const VisaRequirements = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
  // Parse slug to get from and to country slugs
  const slugParts = slug?.split("-to-");
  const fromSlug = slugParts?.[0];
  const toSlug = slugParts?.[1]?.replace(/-visa-requirements$/, '');

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

  // Fetch AI-generated content page
  const { data: contentPage, isLoading: contentLoading } = useQuery({
    queryKey: ['visa-content-page', fromSlug, toSlug],
    queryFn: async () => {
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
      if (visaRequirement || contentPage || isGenerating || generatedContent) return;
      if (isLoading || contentLoading) return;
      if (!fromCountry || !toCountry) return;

      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-visa-content', {
          body: { fromSlug, toSlug }
        });

        if (error) throw error;

        if (data?.success && data?.content) {
          setGeneratedContent(data.content);
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
      } finally {
        setIsGenerating(false);
      }
    };

    generateContent();
  }, [visaRequirement, contentPage, isLoading, contentLoading, fromCountry, toCountry, fromSlug, toSlug, isGenerating, generatedContent, queryClient, toast]);

  if (isLoading || contentLoading || !fromCountry || !toCountry) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-56 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${toCountry.name} Visa Requirements for ${fromCountry.name} Citizens`;
  const metaDescription = `Complete visa requirements guide for ${fromCountry.name} passport holders traveling to ${toCountry.name}. Get up-to-date information on visa types, processing times, fees, and required documents.`;
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
          `do ${fromCountry.name} citizens need a visa for ${toCountry.name}`,
          `${toCountry.name} visa requirements for ${fromCountry.name} citizens`,
          `${toCountry.name} entry requirements`,
        ]}
        noIndex={true}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": pageTitle,
            "description": metaDescription,
            "author": { "@type": "Organization", "name": "Visas Guide" },
            "publisher": { "@type": "Organization", "name": "Visas Guide" },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://visas.guide/visa-requirements/${slug}`
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
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

        {/* Hero Section */}
        <VisaRequirementsHero 
          fromCountry={fromCountry} 
          toCountry={toCountry}
          featuredImage={contentPage?.featured_image_url}
        />

        {/* Quick Stats Bar */}
        {visaRequirement && (
          <VisaQuickStats
            requirementType={visaRequirement.requirement_type}
            maxStayDays={visaRequirement.max_stay_days}
            processingTimeDays={visaRequirement.processing_time_days}
            feeUsd={visaRequirement.fee_usd}
          />
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {visaRequirement ? (
              <>
                {/* Requirements Card */}
                {visaRequirement.requirements && visaRequirement.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {visaRequirement.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-visa-success mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Notes Card */}
                {visaRequirement.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-visa-warning" />
                        Important Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{visaRequirement.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Display AI content if available */}
                {displayContent && (
                  <Card>
                    <CardContent className="prose prose-slate max-w-none pt-6">
                      <div dangerouslySetInnerHTML={{ __html: stripEmbeddedSchemas(displayContent) }} />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : displayContent ? (
              <Card>
                <CardContent className="prose prose-slate max-w-none pt-6">
                  <div dangerouslySetInnerHTML={{ __html: stripEmbeddedSchemas(displayContent) }} />
                </CardContent>
              </Card>
            ) : isGenerating ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Generating Visa Information</h3>
                    <p className="text-muted-foreground max-w-md">
                      We're gathering detailed visa information for {fromCountry.name} citizens traveling to {toCountry.name}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="py-8">
                  <div className="flex items-start gap-4">
                    <Info className="h-6 w-6 text-visa-info mt-1 shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Visa Information Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        We're working on gathering detailed visa information for {fromCountry.name} citizens traveling to {toCountry.name}.
                      </p>
                      
                      <div className="grid gap-4 sm:grid-cols-2 mt-6">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Check Embassy Information
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Contact the {toCountry.name} embassy in {fromCountry.name} for official requirements.
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
            )}

            {/* Social Share */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Share this guide:</span>
              <SocialShareButtons 
                url={`https://visas.guide/visa-requirements/${slug}`}
                title={pageTitle}
              />
            </div>

            {/* Author Bio */}
            <AuthorBio />
          </div>

          {/* Sidebar - 1/3 width */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <VisaSidebar 
                toCountry={toCountry} 
                fromCountry={fromCountry}
                requirementType={visaRequirement?.requirement_type}
              />
            </div>
          </aside>
        </div>

        {/* Related Links Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Information</h2>
          <RelatedVisaLinks fromCountry={fromCountry} toCountry={toCountry} />
        </div>

        {/* Schema */}
        <ArticleSchema
          title={pageTitle}
          description={metaDescription}
          url={`https://visas.guide/visa-requirements/${slug}`}
          keywords={[`${toCountry.name} visa`, `${fromCountry.name} to ${toCountry.name}`, "visa requirements"]}
        />
        <BreadcrumbSchema
          items={[
            { name: "Visa Requirements", url: "/visa-search" },
            { name: fromCountry.name, url: `/countries/${fromSlug}` },
            { name: `${fromCountry.name} to ${toCountry.name}`, url: `/visa-requirements/${slug}` },
          ]}
          showVisual={false}
        />
      </main>

      <Footer />
    </div>
  );
};

export default VisaRequirements;
