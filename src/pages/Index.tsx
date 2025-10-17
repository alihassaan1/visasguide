import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PopularVisaLinks from "@/components/PopularVisaLinks";
import TrendingVisas from "@/components/TrendingVisas";
import PopularDestinations from "@/components/PopularDestinations";
import VisaTypes from "@/components/VisaTypes";
import RecentGuides from "@/components/RecentGuides";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import TrendingGuidesSection from "@/components/TrendingGuidesSection";
import SEOHead from "@/components/SEOHead";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";
import affiliateGetYourGuide from "@/assets/affiliate-getyourguide.jpg";
import affiliateEsim from "@/assets/affiliate-esim.jpg";
import affiliateInsurance from "@/assets/affiliate-insurance.jpg";

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
      
      {/* Structured Data for SEO */}
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
        
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Banner at top */}
        <div className="mb-8">
          <AffiliateBannerContainer position="horizontal-banner" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[280px_1fr_280px] gap-6">
          {/* Left Sidebar - Affiliate Banners */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <AffiliateBannerContainer position="sidebar-left" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <PopularVisaLinks />
            <TrendingVisas />
            
            {/* In-Content Banner */}
            <div className="my-8">
              <AffiliateBannerContainer position="in-content" />
            </div>

            <TrendingGuidesSection />
            <PopularDestinations />
            <VisaTypes />
            <RecentGuides />
          </main>

          {/* Right Sidebar - Newsletter & Affiliate Banners */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <NewsletterSignup variant="sidebar" />
              <AffiliateBannerContainer position="sidebar-right" />
            </div>
          </aside>
        </div>

        {/* Footer Banner */}
        <div className="mt-12">
          <AffiliateBannerContainer position="footer" />
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;