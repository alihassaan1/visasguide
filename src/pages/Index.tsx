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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visas Guide 2025 – Complete Visa Requirements, eVisa & Visa-Free Information | Visas.Guide"
        description="Visas.Guide helps travelers navigate visa requirements for 200+ countries with up-to-date visa-free lists, eVisa details, and travel documentation tips. Your trusted source for global visa information."
        canonical="https://visas.guide/"
        keywords={["visa requirements", "travel visa", "evisa", "visa-free countries", "passport information", "travel documentation", "visa application guide", "schengen visa", "tourist visa", "business visa"]}
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
        <LatestGuidesSection />
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
