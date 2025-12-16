import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Star, ExternalLink, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePageTracking } from "@/hooks/useAnalytics";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

const CityPage = () => {
  const { countrySlug, citySlug } = useParams<{ countrySlug: string; citySlug: string }>();
  
  usePageTracking(`${countrySlug}/${citySlug}`);

  // Fetch city data
  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['city', citySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          country:countries(id, name, slug, flag_emoji, code)
        `)
        .eq('slug', citySlug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!citySlug
  });

  // Fetch affiliate banners for this city/country
  const { data: affiliateBanners } = useQuery({
    queryKey: ['city-affiliates', city?.country?.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings_affiliates')
        .select('*')
        .eq('is_active', true)
        .in('position', ['in-content', 'horizontal-banner']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!city?.country?.slug
  });

  // Increment view count
  useEffect(() => {
    if (city?.id) {
      supabase.rpc('increment_city_view_count', { p_city_id: city.id });
    }
  }, [city?.id]);

  // Trigger city data generation if missing description
  useEffect(() => {
    if (city && !city.description && city.country) {
      supabase.functions.invoke('generate-city-content', {
        body: { 
          cityId: city.id,
          cityName: city.name,
          countryName: city.country.name
        }
      }).catch(() => {});
    }
  }, [city]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  if (cityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
            <p className="text-muted-foreground mb-6">The city you're looking for doesn't exist in our database.</p>
            <Link to={`/countries/${countrySlug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Country
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const metaTitle = city.meta_title || `${city.name}, ${city.country?.name} - Tours, Activities & Travel Guide`;
  const metaDescription = city.meta_description || 
    `Discover the best tours and activities in ${city.name}, ${city.country?.name}. Book experiences, explore attractions, and plan your perfect trip.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://visas.guide/${city.country?.slug}/${city.slug}`}
        keywords={[`${city.name} tours`, `${city.name} activities`, `things to do in ${city.name}`, `${city.name} travel guide`, city.country?.name || '']}
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <div 
          className="relative h-[300px] md:h-[400px] bg-cover bg-center"
          style={{ 
            backgroundImage: city.hero_image_url 
              ? `url(${city.hero_image_url})` 
              : `url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-white/80 hover:text-white">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/countries" className="text-white/80 hover:text-white">Countries</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/countries/${city.country?.slug}`} className="text-white/80 hover:text-white">
                      {city.country?.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{city.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{city.country?.flag_emoji || '🏙️'}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{city.name}</h1>
                <p className="text-white/80">{city.country?.name} • Discover Tours & Activities</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {city.is_capital && (
                <Badge className="bg-yellow-500/90 text-yellow-950">
                  <Star className="h-3 w-3 mr-1" /> Capital City
                </Badge>
              )}
              {city.population && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Users className="h-3 w-3 mr-1" /> {formatNumber(city.population)} population
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              {city.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      About {city.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{city.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Top Attractions */}
              {city.attractions && city.attractions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top Attractions in {city.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {city.attractions.map((attraction, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <span className="text-primary font-bold">{index + 1}</span>
                          <span className="text-sm">{attraction}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Things to do Section - For GetYourGuide Widget */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎫 Things to do in {city.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Discover the best experiences, guided tours, and activities in {city.name}. 
                    Book ahead and skip the lines!
                  </p>
                  
                  {/* GetYourGuide Widget Placeholder - Add your widget code here */}
                  <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                    <p className="text-muted-foreground text-sm">GetYourGuide widget will appear here</p>
                  </div>
                  
                  {/* Affiliate Banners - In Content */}
                  <AffiliateBannerContainer position="in-content" />
                  
                  {/* Horizontal Banner */}
                  <AffiliateBannerContainer position="horizontal-banner" />
                </CardContent>
              </Card>

              {/* Gallery */}
              {city.gallery_images && city.gallery_images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {city.gallery_images.slice(0, 6).map((img, index) => (
                        <div 
                          key={index}
                          className="aspect-video rounded-lg overflow-hidden bg-muted"
                        >
                          <img 
                            src={img} 
                            alt={`${city.name} photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-5">
              {/* Sidebar Affiliates */}
              <AffiliateBannerContainer position="sidebar-right" />

              {/* Back to Country */}
              <Card>
                <CardContent className="p-5">
                  <h4 className="font-semibold mb-3">Explore {city.country?.name}</h4>
                  <Link to={`/countries/${city.country?.slug}`}>
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to {city.country?.name} Guide
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <NewsletterSignup variant="sidebar" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CityPage;
