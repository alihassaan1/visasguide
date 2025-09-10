import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, FileText, Clock, CreditCard, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Requirements = () => {
  const generalRequirements = [
    {
      title: "Valid Passport",
      description: "Passport valid for at least 6 months beyond travel date",
      icon: FileText,
      mandatory: true
    },
    {
      title: "Application Form",
      description: "Completed visa application form with accurate information",
      icon: FileText,
      mandatory: true
    },
    {
      title: "Passport Photos",
      description: "Recent passport-sized photographs meeting specific requirements",
      icon: Users,
      mandatory: true
    },
    {
      title: "Travel Itinerary",
      description: "Proof of return ticket or onward travel arrangements",
      icon: Clock,
      mandatory: true
    },
    {
      title: "Financial Proof",
      description: "Bank statements showing sufficient funds for travel",
      icon: CreditCard,
      mandatory: true
    },
    {
      title: "Travel Insurance",
      description: "Comprehensive travel insurance coverage (country dependent)",
      icon: AlertCircle,
      mandatory: false
    }
  ];

  const documentsByVisaType = [
    {
      type: "Tourist Visa",
      documents: [
        "Hotel reservations or invitation letter",
        "Proof of employment or enrollment",
        "Travel insurance",
        "Bank statements (3-6 months)"
      ]
    },
    {
      type: "Business Visa", 
      documents: [
        "Business invitation letter",
        "Company registration documents",
        "Employment letter",
        "Business bank statements"
      ]
    },
    {
      type: "Student Visa",
      documents: [
        "Acceptance letter from institution",
        "Proof of tuition payment",
        "Academic transcripts",
        "Proof of accommodation"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Requirements & Documents
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to visa requirements, necessary documents, and application procedures for international travel
          </p>
        </div>

        {/* General Requirements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">General Requirements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalRequirements.map((requirement, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${requirement.mandatory ? 'bg-visa-success/10' : 'bg-visa-warning/10'}`}>
                      <requirement.icon className={`h-6 w-6 ${requirement.mandatory ? 'text-visa-success' : 'text-visa-warning'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-foreground">{requirement.title}</h3>
                        <Badge variant={requirement.mandatory ? "default" : "secondary"} className="text-xs">
                          {requirement.mandatory ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{requirement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Documents by Visa Type */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Documents by Visa Type</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {documentsByVisaType.map((visaType, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-foreground">{visaType.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {visaType.documents.map((doc, docIndex) => (
                      <li key={docIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-visa-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Important Tips */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Important Tips</h2>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Before You Apply</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Check visa requirements for your specific nationality</li>
                    <li>• Verify passport validity (6+ months remaining)</li>
                    <li>• Gather all required documents in advance</li>
                    <li>• Apply well before your travel date</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Common Mistakes</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Incomplete or incorrect application forms</li>
                    <li>• Insufficient proof of financial means</li>
                    <li>• Missing or incorrect passport photos</li>
                    <li>• Lack of travel insurance coverage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Requirements;