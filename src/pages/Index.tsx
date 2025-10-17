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
        
        {/* Horizontal Banner */}
        <div className="container mx-auto px-4 py-4">
          <AffiliateBannerContainer position="horizontal-banner" />
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              <AffiliateBannerContainer position="sidebar-left" />
              
              {/* Demo affiliate banner - eSIM */}
              <a 
                href="https://www.airalo.com" 
                target="_blank" 
                rel="sponsored noopener noreferrer"
                className="block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={affiliateEsim} alt="eSIM Global Coverage" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-sm">Stay Connected Worldwide</h3>
                  <p className="text-xs text-muted-foreground mb-3">Get eSIM for 190+ countries</p>
                  <div className="text-xs text-primary font-medium">Get eSIM →</div>
                </div>
              </a>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-12">
              <PopularVisaLinks />
              <TrendingVisas />
              
              {/* In-content affiliate */}
              <div className="my-8">
                <AffiliateBannerContainer position="in-content" />
              </div>
              
              <TrendingGuidesSection />
              <PopularDestinations />
              <VisaTypes />
              <RecentGuides />
            </div>

            {/* Right Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              <AffiliateBannerContainer position="sidebar-right" />
              
              {/* Demo affiliate banner - Tours */}
              <a 
                href="https://www.getyourguide.com" 
                target="_blank" 
                rel="sponsored noopener noreferrer"
                className="block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={affiliateGetYourGuide} alt="GetYourGuide Tours" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-sm">Book Tours & Activities</h3>
                  <p className="text-xs text-muted-foreground mb-3">Explore top destinations worldwide</p>
                  <div className="text-xs text-primary font-medium">Browse Tours →</div>
                </div>
              </a>
              
              {/* Demo affiliate banner - Insurance */}
              <a 
                href="https://www.worldnomads.com" 
                target="_blank" 
                rel="sponsored noopener noreferrer"
                className="block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={affiliateInsurance} alt="Travel Insurance" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-sm">Travel Insurance</h3>
                  <p className="text-xs text-muted-foreground mb-3">Protect your journey</p>
                  <div className="text-xs text-primary font-medium">Get Quote →</div>
                </div>
              </a>
              
              <NewsletterSignup />
            </aside>
          </div>
        </div>
        
        {/* Footer Banner */}
        <div className="container mx-auto px-4 py-4">
          <AffiliateBannerContainer position="footer" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;