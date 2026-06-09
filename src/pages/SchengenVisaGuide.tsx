import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Globe, Clock, FileText, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import FAQSchema from "@/components/FAQSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const schengenCountries = [
  { name: "Austria", slug: "austria", flag: "🇦🇹" },
  { name: "Belgium", slug: "belgium", flag: "🇧🇪" },
  { name: "Bulgaria", slug: "bulgaria", flag: "🇧🇬" },
  { name: "Croatia", slug: "croatia", flag: "🇭🇷" },
  { name: "Czech Republic", slug: "czech-republic", flag: "🇨🇿" },
  { name: "Denmark", slug: "denmark", flag: "🇩🇰" },
  { name: "Estonia", slug: "estonia", flag: "🇪🇪" },
  { name: "Finland", slug: "finland", flag: "🇫🇮" },
  { name: "France", slug: "france", flag: "🇫🇷" },
  { name: "Germany", slug: "germany", flag: "🇩🇪" },
  { name: "Greece", slug: "greece", flag: "🇬🇷" },
  { name: "Hungary", slug: "hungary", flag: "🇭🇺" },
  { name: "Iceland", slug: "iceland", flag: "🇮🇸" },
  { name: "Italy", slug: "italy", flag: "🇮🇹" },
  { name: "Latvia", slug: "latvia", flag: "🇱🇻" },
  { name: "Liechtenstein", slug: "liechtenstein", flag: "🇱🇮" },
  { name: "Lithuania", slug: "lithuania", flag: "🇱🇹" },
  { name: "Luxembourg", slug: "luxembourg", flag: "🇱🇺" },
  { name: "Malta", slug: "malta", flag: "🇲🇹" },
  { name: "Netherlands", slug: "netherlands", flag: "🇳🇱" },
  { name: "Norway", slug: "norway", flag: "🇳🇴" },
  { name: "Poland", slug: "poland", flag: "🇵🇱" },
  { name: "Portugal", slug: "portugal", flag: "🇵🇹" },
  { name: "Romania", slug: "romania", flag: "🇷🇴" },
  { name: "Slovakia", slug: "slovakia", flag: "🇸🇰" },
  { name: "Slovenia", slug: "slovenia", flag: "🇸🇮" },
  { name: "Spain", slug: "spain", flag: "🇪🇸" },
  { name: "Sweden", slug: "sweden", flag: "🇸🇪" },
  { name: "Switzerland", slug: "switzerland", flag: "🇨🇭" },
];

const SchengenVisaGuide = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Complete Schengen Visa Guide 2026 - Requirements, Countries & Application",
    "description": "Everything you need to know about the Schengen visa: 29 member countries, requirements, application process, fees, and travel tips for visiting Europe.",
    "author": {
      "@type": "Organization",
      "name": "Visas.Guide"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Visas.Guide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://visas.guide/logo.png"
      }
    },
    "datePublished": "2026-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Schengen Visa Guide 2026 — Requirements & How to Apply"
        description="Schengen visa guide: 29 member countries, requirements, application steps, fees, and tips for traveling across Europe."
        canonical="https://visas.guide/schengen-visa-guide"
        keywords={["schengen visa", "schengen countries", "schengen visa requirements", "europe visa", "schengen area", "schengen visa application", "schengen visa fees"]}
      />
      
      <FAQSchema faqs={[
        { question: "How long does a Schengen visa take to process?", answer: "Schengen visa processing typically takes 10-15 business days from the date of application. However, during peak travel seasons it can take up to 45 days. It's recommended to apply at least 4-6 weeks before your intended travel date." },
        { question: "Which countries are in the Schengen area?", answer: "The Schengen area consists of 27 European countries: Austria, Belgium, Croatia, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, and Switzerland." },
        { question: "Can I visit multiple Schengen countries on one visa?", answer: "Yes, a single Schengen visa allows you to travel freely between all 27 Schengen member countries during your authorized stay. You should apply at the embassy of the country where you'll spend the most time, or the country of first entry if spending equal time." },
      ]} pageUrl="https://visas.guide/schengen-visa-guide" />
      <BreadcrumbSchema items={[
        { name: "Schengen Visa Guide", url: "/schengen-visa-guide" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Globe className="h-3 w-3 mr-1" />
            27 Countries, One Visa
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Schengen Visa Guide 2026
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about traveling to 27 European countries with a single Schengen visa. Requirements, application process, and expert tips.
          </p>
        </div>

        {/* Quick Facts */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">27</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">90</div>
              <div className="text-sm text-muted-foreground">Days Max Stay</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">€80</div>
              <div className="text-sm text-muted-foreground">Visa Fee</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">15</div>
              <div className="text-sm text-muted-foreground">Days Processing</div>
            </CardContent>
          </Card>
        </div>

        {/* What is Schengen */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              What is the Schengen Area?
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="text-muted-foreground">
              The Schengen Area is a zone comprising 27 European countries that have abolished passport and other types of border control at their mutual borders. Named after the 1985 Schengen Agreement signed in Schengen, Luxembourg, it allows over 400 million citizens to travel freely within the area.
            </p>
            <p className="text-muted-foreground mt-4">
              For travelers from outside the Schengen Area, a single Schengen visa allows entry to all 27 member countries. This means you can fly into Paris, take a train to Amsterdam, drive to Berlin, and cruise to Copenhagen—all with one visa.
            </p>
          </CardContent>
        </Card>

        {/* Schengen Countries Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              All 27 Schengen Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {schengenCountries.map((country) => (
                <Link
                  key={country.slug}
                  to={`/countries/${country.slug}`}
                  className="group flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary hover:shadow-md transition-all"
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary-foreground transition-colors">{country.name}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visa Types */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Types of Schengen Visas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">Type A - Airport Transit Visa</h3>
                <p className="text-sm text-muted-foreground">For travelers passing through the international transit area of a Schengen airport without entering the Schengen Area.</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">Type C - Short-Stay Visa (Most Common)</h3>
                <p className="text-sm text-muted-foreground">For stays up to 90 days within any 180-day period. Used for tourism, business, family visits, or short courses.</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">Type D - National Long-Stay Visa</h3>
                <p className="text-sm text-muted-foreground">For stays longer than 90 days. Required for work, study, or family reunification. Issued by individual countries.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Schengen Visa Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Required Documents</h3>
                <ul className="space-y-2">
                  {[
                    "Valid passport (3+ months beyond stay)",
                    "Completed visa application form",
                    "Two recent passport photos",
                    "Travel health insurance (€30,000 min)",
                    "Proof of accommodation",
                    "Round-trip flight reservation",
                    "Proof of financial means",
                    "Employment/enrollment letter"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Application Process</h3>
                <ol className="space-y-3">
                  {[
                    "Determine which embassy to apply at (main destination country)",
                    "Schedule an appointment at the embassy/VFS",
                    "Complete the application form online",
                    "Gather all required documents",
                    "Attend the visa interview",
                    "Pay the visa fee (€80 for adults)",
                    "Wait for processing (up to 15 days)",
                    "Collect your passport with visa"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Processing Time & Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Processing Time</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Standard processing: <strong>15 calendar days</strong></li>
                  <li>• Extended (peak season): <strong>Up to 45 days</strong></li>
                  <li>• Apply: <strong>6 months to 15 days before travel</strong></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Visa Fees (2026)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Adults: <strong>€80</strong></li>
                  <li>• Children (6-12): <strong>€40</strong></li>
                  <li>• Children (under 6): <strong>Free</strong></li>
                  <li>• VFS/TLS service fee: <strong>~€25-35</strong> (additional)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-amber-900">
              <li>• <strong>90/180 Rule:</strong> You can stay maximum 90 days within any 180-day period in the entire Schengen Area.</li>
              <li>• <strong>Main Destination:</strong> Apply at the embassy of the country where you'll spend the most time.</li>
              <li>• <strong>First Entry:</strong> While not strictly required, it's recommended to enter through the country that issued your visa.</li>
              <li>• <strong>Insurance:</strong> Travel insurance must cover all Schengen countries, not just your destination.</li>
              <li>• <strong>Biometrics:</strong> First-time applicants must provide fingerprints at the visa application center.</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Check Your Visa Requirements</h2>
          <p className="text-muted-foreground mb-6">Select your nationality to see if you need a Schengen visa</p>
          <Link
            to="/visa-search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Check Visa Requirements →
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SchengenVisaGuide;
