import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEOHead from "@/components/SEOHead";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import DestinationCarousel from "@/components/DestinationCarousel";
import LatestGuidesSection from "@/components/LatestGuidesSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import BreakingPolicyUpdates from "@/components/BreakingPolicyUpdates";
import OrganizationSchema from "@/components/OrganizationSchema";
import SiteNavigationSchema from "@/components/SiteNavigationSchema";
import { CURRENT_YEAR } from "@/lib/constants";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Visa Guide ${CURRENT_YEAR} — Requirements & eVisa Info | Visas.Guide`}
        description="Visa requirements, eVisa info, and processing times for 200+ countries. Trusted by travelers worldwide."
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

        {/* Popular Visa Guides — compact chips strip merged into Quick Access flow */}
        <section className="py-8 bg-background border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
                Popular:
              </span>
              {[
                { href: "/processing-times", emoji: "⏱️", label: "Processing Times" },
                { href: "/passport-index", emoji: "🏆", label: "Passport Rankings" },
                { href: "/countries/jordan", emoji: "🇯🇴", label: "Jordan" },
                { href: "/countries/south-korea", emoji: "🇰🇷", label: "South Korea" },
                { href: "/countries/montenegro", emoji: "🇲🇪", label: "Montenegro" },
                { href: "/schengen-visa-guide", emoji: "🇪🇺", label: "Schengen Visa" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-full text-sm transition-colors"
                >
                  <span className="font-emoji">{link.emoji}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <BreakingPolicyUpdates />
        <LatestNewsSection />

        <div className="container mx-auto px-4">
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
