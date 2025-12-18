import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Search, Home, MapPin, FileText, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 error for analytics
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Track 404 in analytics_events for content gap analysis
    const track404 = async () => {
      try {
        await supabase.from("analytics_events").insert({
          event_type: "404_error",
          page_slug: location.pathname,
          referrer_source: document.referrer || null,
        });
      } catch (e) {
        console.error("Failed to track 404:", e);
      }
    };
    track404();
  }, [location.pathname]);

  const popularDestinations = [
    { name: "United States", slug: "united-states", flag: "🇺🇸" },
    { name: "United Kingdom", slug: "united-kingdom", flag: "🇬🇧" },
    { name: "Canada", slug: "canada", flag: "🇨🇦" },
    { name: "Germany", slug: "germany", flag: "🇩🇪" },
    { name: "France", slug: "france", flag: "🇫🇷" },
    { name: "Australia", slug: "australia", flag: "🇦🇺" },
  ];

  const quickLinks = [
    { name: "Visa Search", href: "/visa-search", icon: Search },
    { name: "All Countries", href: "/countries", icon: Globe },
    { name: "Visa Guides", href: "/guides", icon: FileText },
    { name: "Passport Rankings", href: "/passport-index", icon: MapPin },
  ];

  return (
    <>
      <SEOHead
        title="Page Not Found - Visas.Guide"
        description="The page you're looking for doesn't exist. Find visa information, requirements, and travel guides for over 190+ countries on Visas.Guide."
        canonical={`https://visas.guide${location.pathname}`}
        noIndex={true}
      />
      
      <Header />
      
      <main className="min-h-[70vh] bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <span className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                404
              </span>
              <p className="text-xl text-muted-foreground mt-4">
                Oops! This page seems to have traveled to an unknown destination.
              </p>
            </div>

            {/* Search Box */}
            <div className="mb-12">
              <p className="text-sm text-muted-foreground mb-3">
                Try searching for what you're looking for:
              </p>
              <form 
                action="/visa-search" 
                method="GET"
                className="flex gap-2 max-w-md mx-auto"
              >
                <Input
                  type="text"
                  name="q"
                  placeholder="Search countries, visas, guides..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="mb-12">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="mb-12">
              <h2 className="text-lg font-semibold mb-4">Popular Destinations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularDestinations.map((dest) => (
                  <Link
                    key={dest.slug}
                    to={`/countries/${dest.slug}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                  >
                    <span className="text-xl">{dest.flag}</span>
                    <span className="text-sm font-medium">{dest.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Back to Home */}
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default NotFound;
