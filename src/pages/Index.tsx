import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEOHead from "@/components/SEOHead";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import DestinationCarousel from "@/components/DestinationCarousel";
import QuickLinks from "@/components/QuickLinks";
import LatestGuidesSection from "@/components/LatestGuidesSection";
import FeaturedAuthorsSection from "@/components/FeaturedAuthorsSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import OrganizationSchema from "@/components/OrganizationSchema";
import SiteNavigationSchema from "@/components/SiteNavigationSchema";
import { CURRENT_YEAR } from "@/lib/constants";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Visa Guide ${CURRENT_YEAR} – Travel Visa Requirements, Visa Destinations & eVisa Info | Visas.Guide`}
        description="Your complete visa guide for 200+ countries. Check travel visa requirements, visa-free destinations, eVisa options, and global visa processing times. Trusted by travelers worldwide."
        canonical="https://visas.guide/"
        keywords={["visa guide", "travel visa requirements", "visa requirements", "visa destinations", "visa destination", "visa map", "visamap", "visa worldwide", "visa list", "visa list by country", "visa requirements by country", "visa-free countries", "evisa", "passport information", "travel documentation", "visa application guide", "schengen visa", "tourist visa", "business visa", "global visa processing times", "passport index", "passport ranking", "passport rankings", "world passport rankings", "passport power ranking"]}
      />
      <AnalyticsTracker />
      <OrganizationSchema />
      <SiteNavigationSchema />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Visas Guide",
            "description": "Complete visa information and requirements for global travel",
            "url": "https://visas.guide",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://visas.guide/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization", 
              "name": "Visas Guide",
              "description": "Trusted visa information platform for travelers worldwide"
            }
          })
        }}
      />

      <Header />
      
      <main>
        <HeroSection />
        <DestinationCarousel />
        
        <div className="container mx-auto px-4 py-6">
          <AffiliateBannerContainer position="horizontal-banner" />
        </div>

        <LatestGuidesSection />

        {/* Popular Visa Guides - Internal Linking for SEO */}
        <section className="py-12 bg-gradient-to-b from-background to-accent/5">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">🔥 Popular Visa Guides</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { href: "/processing-times", emoji: "⏱️", label: "Visa Processing Times" },
                { href: "/passport-index", emoji: "🏆", label: "Passport Rankings" },
                { href: "/countries/jordan", emoji: "🇯🇴", label: "Jordan & Petra Visa" },
                { href: "/countries/south-korea", emoji: "🇰🇷", label: "South Korea Visa" },
                { href: "/countries/montenegro", emoji: "🇲🇪", label: "Montenegro Visa" },
                { href: "/schengen-visa-guide", emoji: "🇪🇺", label: "Schengen Visa Guide" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border hover:border-primary/50 hover:shadow-md transition-all text-center"
                >
                  <span className="text-2xl">{link.emoji}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <FeaturedAuthorsSection />
        <LatestNewsSection />
        
        <div className="container mx-auto px-4">
          <QuickLinks />
          
          <div className="py-12">
            <NewsletterSignup variant="default" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
