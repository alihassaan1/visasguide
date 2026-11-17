import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, DollarSign, FileText, CheckCircle, AlertCircle, ArrowRight, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { Link } from "@/lib/router-compat";
import { CURRENT_YEAR } from "@/lib/constants";

const BusinessVisa = () => {
  const countries = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaType: "B-1 Business Visa",
      processingTime: "2-8 weeks",
      fee: "$185 USD",
      validity: "10 years (multiple entry)",
      maxStay: "6 months per visit",
      difficulty: "Medium"
    },
    {
      country: "United Kingdom", 
      flag: "🇬🇧",
      visaType: "Standard Visitor (Business)",
      processingTime: "3-8 weeks", 
      fee: "£100 USD",
      validity: "6 months to 10 years",
      maxStay: "6 months per visit",
      difficulty: "Hard"
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      visaType: "Schengen Business Visa",
      processingTime: "10-15 days",
      fee: "€80 USD",
      validity: "90 days in 180 days",
      maxStay: "90 days",
      difficulty: "Medium"
    },
    {
      country: "China",
      flag: "🇨🇳",
      visaType: "M Visa (Business)",
      processingTime: "4-7 days",
      fee: "$140-$200 USD",
      validity: "30 days to 10 years",
      maxStay: "30-90 days per entry",
      difficulty: "Medium"
    }
  ];

  const businessActivities = [
    "Attending business meetings and conferences",
    "Negotiating contracts and partnerships", 
    "Conducting market research and surveys",
    "Meeting with clients and suppliers",
    "Attending trade shows and exhibitions",
    "Exploring investment opportunities",
    "Training and consultancy services",
    "Short-term business consultations",
    "Attending board meetings",
    "Due diligence activities"
  ];

  const requirements = [
    "Valid passport (6+ months remaining)",
    "Completed business visa application form",
    "Recent passport-sized photographs",
    "Business invitation letter from host company",
    "Company registration documents",
    "Employment verification letter",
    "Bank statements (3-6 months)",
    "Travel itinerary and accommodation",
    "Business license or registration",
    "Purpose of visit documentation"
  ];

  const tips = [
    {
      title: "Strong Business Justification",
      description: "Clearly explain the business purpose and how it benefits both countries' commercial interests."
    },
    {
      title: "Complete Documentation",
      description: "Ensure all business documents are properly notarized and translated if required."
    },
    {
      title: "Host Company Details",
      description: "Provide comprehensive information about the inviting company including registration and business license."
    },
    {
      title: "Financial Stability",
      description: "Demonstrate sufficient funds and stable employment or business ownership in your home country."
    },
    {
      title: "Previous Travel History",
      description: "A clean travel history with previous business visa compliance strengthens your application."
    },
    {
      title: "Return Intent",
      description: "Show strong ties to your home country and clear intention to return after business activities."
    }
  ];

  const businessFaqs = [
    { question: "Can I work for a local company with a business visa?", answer: "Generally no. Business visas typically prohibit receiving payment from local sources or engaging in employment. You may attend meetings and conduct business activities but cannot work for local companies." },
    { question: "Do I need an invitation letter for a business visa?", answer: "Most countries require a formal invitation letter from the host company or business partner. This letter should include details about the business relationship, purpose of visit, and duration of stay." },
    { question: "How long can I stay with a business visa?", answer: "Stay duration varies by country and visa type. Typical business visas allow stays of 30-90 days per entry, though some countries offer longer validity periods with multiple entry options." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Business Visa Guide ${CURRENT_YEAR} – Requirements, Fees & Application Tips | Visas.Guide`}
        description={`Complete business visa guide for ${CURRENT_YEAR}. Requirements, processing times, fees, and expert tips for international business travel, meetings, and conferences.`}
        canonical="https://visas.guide/visa-types/business"
        keywords={["business visa", "business visa requirements", "business visa application", "work travel visa", "business visitor visa", "commercial visa", "conference visa"]}
      />
      <FAQSchema visible faqs={businessFaqs} pageUrl="https://visas.guide/visa-types/business" />
      <BreadcrumbSchema items={[
        { name: "Visa Types", url: "/visa-types/business" },
        { name: "Business Visa", url: "/visa-types/business" },
      ]} />

      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `Business Visa Requirements and Application Guide ${CURRENT_YEAR}`,
            "description": "Complete guide to business visa requirements, processing times, fees, and application tips for international business travel and meetings.",
            "author": { "@type": "Organization", "name": "Visas Guide" },
            "mainEntityOfPage": "https://visas.guide/visa-types/business"
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Briefcase className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Business Visa Guide
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to business visa requirements, application processes, and tips for successful approval for international business travel, meetings, and conferences.
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6">What is a Business Visa?</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A business visa is a temporary travel document that allows foreign nationals to enter a country for legitimate 
                  business activities such as meetings, conferences, negotiations, and other commercial purposes. Business visas 
                  are typically issued for short to medium-term stays and have specific restrictions on the types of activities permitted.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike work visas, business visas generally do not allow holders to receive payment from sources within the 
                  destination country or engage in long-term employment. The specific conditions vary by country and visa category.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Allowed Activities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Permitted Business Activities</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                Business visas typically allow the following activities (specific permissions vary by country):
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {businessActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-visa-success flex-shrink-0" />
                    <span className="text-foreground">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popular Countries */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Business Visa Destinations</h2>
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
                      <Link to={`/guides/${country.country.toLowerCase().replace(' ', '-')}-business-visa`} className="flex-1">
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
          <h2 className="text-3xl font-bold text-foreground mb-8">Common Business Visa Requirements</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                Most business visa applications require the following documents:
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
          <h2 className="text-3xl font-bold text-foreground mb-8">Expert Tips for Business Visa Success</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="border-0 bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary" />
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
                <h3 className="font-semibold text-foreground mb-3">Can I work for a local company with a business visa?</h3>
                <p className="text-muted-foreground">
                  Generally no. Business visas typically prohibit receiving payment from local sources or engaging in employment. 
                  You may attend meetings and conduct business activities but cannot work for local companies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Do I need an invitation letter for a business visa?</h3>
                <p className="text-muted-foreground">
                  Most countries require a formal invitation letter from the host company or business partner. This letter should 
                  include details about the business relationship, purpose of visit, and duration of stay.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How long can I stay with a business visa?</h3>
                <p className="text-muted-foreground">
                  Stay duration varies by country and visa type. Typical business visas allow stays of 30-90 days per entry, 
                  though some countries offer longer validity periods with multiple entry options.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Apply for Your Business Visa?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Use our visa search tool to find specific business visa requirements for your destination and start your application process today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visa-search">
                  <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                    Search Business Visas
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

export default BusinessVisa;