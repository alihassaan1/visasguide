import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PopularVisaLinks from "@/components/PopularVisaLinks";
import TrendingVisas from "@/components/TrendingVisas";
import PopularDestinations from "@/components/PopularDestinations";
import VisaTypes from "@/components/VisaTypes";
import RecentGuides from "@/components/RecentGuides";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
        <PopularDestinations />
        <VisaTypes />
        <RecentGuides />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;