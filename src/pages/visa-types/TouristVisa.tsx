import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Clock, DollarSign, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { Link } from "@/lib/router-compat";
import { CURRENT_YEAR } from "@/lib/constants";

const TouristVisa = () => {
  const countries = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaType: "B-2 Tourist Visa",
      processingTime: "2-8 weeks",
      fee: "$185 USD",
      validity: "10 years (multiple entry)",
      maxStay: "6 months per visit",
      difficulty: "Medium"
    },
    {
      country: "United Kingdom", 
      flag: "🇬🇧",
      visaType: "Standard Visitor Visa",
      processingTime: "3-8 weeks",
      fee: "£100 USD",
      validity: "6 months to 10 years",
      maxStay: "6 months per visit",
      difficulty: "Hard"
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      visaType: "Schengen Tourist Visa",
      processingTime: "10-15 days",
      fee: "€80 USD",
      validity: "90 days in 180 days",
      maxStay: "90 days",
      difficulty: "Medium"
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      visaType: "Visitor Visa (subclass 600)",
      processingTime: "20-30 days",
      fee: "$150 AUD",
      validity: "12 months",
      maxStay: "3-12 months",
      difficulty: "Medium"
    }
  ];

  const requirements = [
    "Valid passport (6+ months remaining)",
    "Completed visa application form",
    "Recent passport-sized photographs",
    "Proof of accommodation (hotel bookings)",
    "Return flight tickets or travel itinerary",
    "Bank statements (3-6 months)",
    "Travel insurance coverage",
    "Invitation letter (if applicable)",
    "Employment verification letter",
    "Criminal background check (some countries)"
  ];

  const tips = [
    {
      title: "Apply Early",
      description: "Submit your application at least 4-6 weeks before your travel date to allow for processing delays."
    },
    {
      title: "Complete Documentation",
      description: "Ensure all required documents are provided and meet the specific requirements of the destination country."
    },
    {
      title: "Proof of Ties",
      description: "Demonstrate strong ties to your home country through employment, property, or family connections."
    },
    {
      title: "Travel Insurance", 
      description: "Many countries require comprehensive travel insurance. Purchase adequate coverage before applying."
    },
    {
      title: "Interview Preparation",
      description: "Be prepared to attend a visa interview and answer questions about your travel plans honestly."
    },
    {
      title: "Financial Proof",
      description: "Show sufficient funds to cover your entire trip, including accommodation, meals, and activities."
    }
  ];

  const touristFaqs = [
    { question: "How long does it take to get a tourist visa?", answer: "Processing times vary significantly by country and visa type. Electronic visas (eVisas) can be processed within 1-5 business days, while traditional visas may take 2-8 weeks or longer during peak seasons." },
    { question: "Can I extend my tourist visa?", answer: "Extension policies vary by country. Some destinations allow tourists to extend their stay for additional periods, while others require leaving and re-entering the country. Check specific country requirements." },
    { question: "What if my tourist visa application is rejected?", answer: "If rejected, you may be able to reapply after addressing the reasons for rejection. Some countries allow appeals, while others require waiting periods. Visa fees are typically non-refundable." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Tourist Visa Guide ${CURRENT_YEAR} – Requirements, Fees & Application Tips | Visas.Guide`}
        description={`Complete tourist visa guide for ${CURRENT_YEAR}. Check requirements, processing times, fees, and expert tips for popular travel destinations worldwide.`}
        canonical="https://visas.guide/visa-types/tourist"
        keywords={["tourist visa", "tourist visa requirements", "tourist visa application", "travel visa", "visitor visa", "holiday visa", "tourist visa fees", "tourist visa processing time"]}
      />
      <FAQSchema visible faqs={touristFaqs} pageUrl="https://visas.guide/visa-types/tourist" />
      <BreadcrumbSchema items={[
        { name: "Visa Types", url: "/visa-types/tourist" },
        { name: "Tourist Visa", url: "/visa-types/tourist" },
      ]} />

      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `Tourist Visa Requirements and Application Guide ${CURRENT_YEAR}`,
            "description": "Complete guide to tourist visa requirements, processing times, fees, and application tips for popular travel destinations worldwide.",
            "author": { "@type": "Organization", "name": "Visas Guide" },
            "mainEntityOfPage": "https://visas.guide/visa-types/tourist"
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Camera className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Tourist Visa Guide
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about tourist visa requirements, application processes, and tips for successful approval for leisure travel worldwide.
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6">What is a Tourist Visa?</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A tourist visa is a temporary travel document that allows foreign nationals to enter a country for leisure, sightseeing, 
                  visiting friends and family, or other non-business activities. Tourist visas are typically issued for short-term stays 
                  ranging from a few days to several months, depending on the destination country's regulations.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Most tourist visas prohibit holders from engaging in paid employment, conducting business activities, or studying. 
                  The specific conditions and restrictions vary by country and visa type, making it essential to understand the 
                  requirements for your intended destination.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popular Countries */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Tourist Visa Destinations</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {countries.map((country, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{country.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {country.country}
                          </h3>
                          <p className="text-muted-foreground">{country.visaType}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          country.difficulty === "Easy" ? "text-visa-success border-visa-success" :
                          country.difficulty === "Medium" ? "text-visa-warning border-visa-warning" :
                          "text-visa-danger border-visa-danger"
                        }
                      >
                        {country.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-visa-info" />
                        <div>
                          <p className="text-xs text-muted-foreground">Processing Time</p>
                          <p className="text-sm font-medium text-foreground">{country.processingTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-visa-warning" />
                        <div>
                          <p className="text-xs text-muted-foreground">Visa Fee</p>
                          <p className="text-sm font-medium text-foreground">{country.fee}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-visa-success" />
                        <div>
                          <p className="text-xs text-muted-foreground">Validity</p>
                          <p className="text-sm font-medium text-foreground">{country.validity}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Max Stay</p>
                          <p className="text-sm font-medium text-foreground">{country.maxStay}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Link to={`/countries/${country.country.toLowerCase().replace(' ', '-')}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Requirements
                        </Button>
                      </Link>
                      <Link to={`/guides/${country.country.toLowerCase().replace(' ', '-')}-tourist-visa`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                          Application Guide
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Common Tourist Visa Requirements</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                While requirements vary by country, most tourist visa applications require the following documents:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-visa-success flex-shrink-0" />
                    <span className="text-foreground">{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tips Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Expert Tips for Tourist Visa Success</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="border-0 bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{tip.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How long does it take to get a tourist visa?</h3>
                <p className="text-muted-foreground">
                  Processing times vary significantly by country and visa type. Electronic visas (eVisas) can be processed 
                  within 1-5 business days, while traditional visas may take 2-8 weeks or longer during peak seasons.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Can I extend my tourist visa?</h3>
                <p className="text-muted-foreground">
                  Extension policies vary by country. Some destinations allow tourists to extend their stay for additional 
                  periods, while others require leaving and re-entering the country. Check specific country requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">What if my tourist visa application is rejected?</h3>
                <p className="text-muted-foreground">
                  If rejected, you may be able to reapply after addressing the reasons for rejection. Some countries allow 
                  appeals, while others require waiting periods. Visa fees are typically non-refundable.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Apply for Your Tourist Visa?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Use our visa search tool to find specific requirements for your destination and start your application process today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visa-search">
                  <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                    Search Visa Requirements
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/guides">
                  <Button variant="outline">
                    Browse All Guides
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TouristVisa;