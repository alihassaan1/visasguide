import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Star, ArrowLeft, Calendar, Shield, Bus } from "lucide-react";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";
import TouristAttractionSchema from "@/components/TouristAttractionSchema";
import VisaRecap from "@/components/VisaRecap";
import GetYourGuideWidget from "@/components/GetYourGuideWidget";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

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


  // Increment view count
  useEffect(() => {
    if (city?.id) {
      void supabase.rpc('increment_city_view_count', { p_city_id: city.id }).then(({ error }) => {
        if (error) console.error('City view tracking failed', error);
      });

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
      
      {/* TouristAttraction Schema for SEO */}
      <TouristAttractionSchema
        name={city.name}
        description={city.description || `Discover tours and activities in ${city.name}, ${city.country?.name}`}
        image={city.hero_image_url}
        address={{ city: city.name, country: city.country?.name || '' }}
        url={`https://visas.guide/${city.country?.slug}/${city.slug}`}
        attractions={city.attractions || []}
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
          {/* Lighter overlay to show image better */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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

        {/* Quick Facts Bar */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {city.population && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Population</p>
                    <p className="font-bold text-lg">{formatNumber(city.population)}</p>
                  </div>
                </div>
              )}
              {city.is_capital && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                    <p className="font-bold text-lg">Capital City</p>
                  </div>
                </div>
              )}
              {city.best_time_to_visit && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Time</p>
                    <p className="font-bold text-lg truncate max-w-[120px]">{city.best_time_to_visit.split(',')[0]}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Country</p>
                  <p className="font-bold text-lg">{city.country?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {city.description && (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </span>
                    About {city.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">{city.description}</p>
                </section>
              )}

              {/* Travel Essentials Cards */}
              {(city.best_time_to_visit || city.safety_tips || city.getting_around) && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Travel Essentials</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {city.best_time_to_visit && (
                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-5 transition-all hover:shadow-lg hover:shadow-green-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Best Time to Visit</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{city.best_time_to_visit}</p>
                        </div>
                      </div>
                    )}
                    {city.safety_tips && (
                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Safety Tips</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{city.safety_tips}</p>
                        </div>
                      </div>
                    )}
                    {city.getting_around && (
                      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-5 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                              <Bus className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Getting Around</h3>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{city.getting_around}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Visa Recap Section */}
              {city.country?.id && (
                <VisaRecap
                  countryId={city.country.id}
                  countrySlug={city.country.slug}
                  countryName={city.country.name}
                />
              )}

              {/* Top Attractions */}
              {city.attractions && city.attractions.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-500" />
                    </span>
                    Top Attractions in {city.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {city.attractions.map((attraction, index) => (
                      <div 
                        key={index} 
                        className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">{attraction}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* GetYourGuide Widget - Only shows if configured in database */}
              <GetYourGuideWidget 
                cityId={city.id}
                countryId={city.country?.id}
                numberOfItems={6}
              />
              
              {/* Affiliate Banners - In Content */}
              <AffiliateBannerContainer position="in-content" />

              {/* Gallery */}
              {city.gallery_images && city.gallery_images.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      📷
                    </span>
                    Photo Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {city.gallery_images.slice(0, 6).map((img, index) => (
                      <div 
                        key={index}
                        className="aspect-video rounded-xl overflow-hidden bg-muted group cursor-pointer"
                      >
                        <img 
                          src={img} 
                          alt={`${city.name} photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Sidebar Affiliates */}
              <AffiliateBannerContainer position="sidebar-right" />

              {/* Back to Country */}
              <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <span className="text-2xl">{city.country?.flag_emoji}</span>
                  Explore {city.country?.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover more cities, visa requirements, and travel tips for {city.country?.name}.
                </p>
                <Link to={`/countries/${city.country?.slug}`}>
                  <Button variant="default" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View Country Guide
                  </Button>
                </Link>
              </div>

              {/* Newsletter */}
              <NewsletterSignup variant="sidebar" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Affiliate Disclosure - Footer */}
      <div className="container mx-auto px-4 pb-4">
        <AffiliateDisclosure />
      </div>
      
      <Footer />
    </div>
  );
};

export default CityPage;
