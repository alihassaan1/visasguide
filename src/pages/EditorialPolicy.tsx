import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, RefreshCw, Users, Shield, BookOpen } from "lucide-react";

const EditorialPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Editorial Policy - Visas.Guide | Content Standards & Fact-Checking"
        description="Learn about Visas.Guide's editorial standards, fact-checking process, and commitment to providing accurate, unbiased visa information to travelers worldwide."
        canonical="https://visas.guide/editorial-policy"
        keywords={["editorial policy", "content standards", "fact checking", "visa information accuracy"]}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Editorial Policy</h1>
            <p className="text-lg text-muted-foreground">
              Our commitment to accuracy, transparency, and trustworthiness in visa information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: December 2024
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Our Editorial Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                At Visas.Guide, we understand that visa information directly impacts your ability to travel. 
                Incorrect or outdated information can lead to denied entry, missed flights, and significant 
                financial losses. That is why we hold ourselves to the highest editorial standards.
              </p>
              <p>
                Our mission is to provide accurate, comprehensive, and up-to-date visa information that 
                travelers can rely on when planning their journeys. We aim to simplify complex immigration 
                policies without sacrificing accuracy.
              </p>
            </CardContent>
          </Card>

          {/* Content Sources */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Information Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We source our information from authoritative and official channels:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Official Government Websites</strong>
                    <p className="text-muted-foreground text-sm">
                      Ministry of Foreign Affairs, immigration departments, and official visa portals of each country.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Embassy and Consulate Communications</strong>
                    <p className="text-muted-foreground text-sm">
                      Direct announcements and policy updates from diplomatic missions worldwide.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>IATA Travel Centre</strong>
                    <p className="text-muted-foreground text-sm">
                      Industry-standard travel information used by airlines and travel agencies.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Expert Consultations</strong>
                    <p className="text-muted-foreground text-sm">
                      Immigration lawyers, former consular officers, and visa consultants on our team.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Fact-Checking Process */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Fact-Checking Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Every piece of content goes through our rigorous verification process:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Before Publication</h3>
                  <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
                    <li>Research from multiple official sources</li>
                    <li>Cross-reference with IATA and embassy data</li>
                    <li>Expert review by immigration specialist</li>
                    <li>Final editorial review for clarity</li>
                  </ol>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Ongoing Maintenance</h3>
                  <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
                    <li>Daily monitoring of policy announcements</li>
                    <li>Quarterly comprehensive reviews</li>
                    <li>Reader feedback verification</li>
                    <li>Automatic alerts for expiring information</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Disclosure */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                AI-Assisted Content Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                In the interest of full transparency, we disclose our use of AI technology:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-[120px]">AI Assistance:</span>
                  <span className="text-muted-foreground">
                    Some of our content is drafted with the assistance of AI tools to help process 
                    and structure large amounts of visa data efficiently.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-[120px]">Human Review:</span>
                  <span className="text-muted-foreground">
                    All AI-assisted content is reviewed, fact-checked, and edited by our human 
                    editorial team before publication.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold min-w-[120px]">Quality Control:</span>
                  <span className="text-muted-foreground">
                    We maintain the same rigorous standards for AI-assisted content as we do for 
                    fully human-written content.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Update Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Content Update Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Breaking Policy Changes</strong>
                    <p className="text-muted-foreground text-sm">
                      Updated within 24-48 hours of official announcements.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Routine Updates</strong>
                    <p className="text-muted-foreground text-sm">
                      All content is reviewed at least quarterly for accuracy.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Last Updated Dates</strong>
                    <p className="text-muted-foreground text-sm">
                      Every article displays when it was last reviewed and updated.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Editorial Independence */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Editorial Independence
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Our editorial team operates independently from our business and advertising teams. 
                Content decisions are made based solely on accuracy, relevance, and value to our readers.
              </p>
              <p>
                While we may earn commissions from affiliate partnerships (see our{" "}
                <a href="/affiliate-disclosure" className="text-primary hover:underline">Affiliate Disclosure</a>), 
                these relationships never influence our editorial recommendations or content accuracy.
              </p>
              <p>
                We do not accept payment for favorable coverage, and we clearly distinguish between 
                editorial content and sponsored or promotional material.
              </p>
            </CardContent>
          </Card>

          {/* Corrections Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Corrections Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                We take errors seriously. If you find incorrect information on our site:
              </p>
              <ol>
                <li>Contact us immediately at <a href="mailto:info@visas.guide" className="text-primary hover:underline">info@visas.guide</a></li>
                <li>We will investigate and verify the issue within 24 hours</li>
                <li>If an error is confirmed, we will correct it promptly and add a correction note</li>
                <li>Significant corrections will be prominently noted at the top of the article</li>
              </ol>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Questions About Our Editorial Standards?</h3>
              <p className="text-muted-foreground mb-4">
                We welcome feedback and questions about our editorial process.
              </p>
              <a 
                href="mailto:editorial@visas.guide" 
                className="text-primary hover:underline font-medium"
              >
                Contact our Editorial Team →
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditorialPolicy;
