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
        <PopularVisaLinks />
        <TrendingVisas />
        <TrendingGuidesSection />
        <PopularDestinations />
        <VisaTypes />
        <RecentGuides />
        <NewsletterSignup />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;