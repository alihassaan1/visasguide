import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Shield, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "@/lib/router-compat";

const AffiliateDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Affiliate Disclosure - Visas.Guide | FTC Compliance Statement"
        description="Full disclosure of Visas.Guide's affiliate relationships. Learn how we earn commissions and our commitment to unbiased recommendations."
        canonical="https://visas.guide/affiliate-disclosure"
        keywords={["affiliate disclosure", "FTC compliance", "sponsored content", "travel affiliate"]}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Affiliate Disclosure</h1>
            <p className="text-lg text-muted-foreground">
              Our commitment to transparency in how we earn revenue while providing valuable travel information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: January 2026
            </p>
          </div>

          {/* FTC Disclosure */}
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                FTC Disclosure Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                In accordance with the Federal Trade Commission (FTC) guidelines, we disclose that 
                Visas.Guide may receive compensation for clicks, referrals, or purchases made through 
                affiliate links on this website. This compensation helps us maintain and improve our 
                free visa information resources.
              </p>
            </CardContent>
          </Card>

          {/* How We Earn */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                How We Earn Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Visas.Guide is a free resource for travelers. To keep our content free and accessible, 
                we earn revenue through the following affiliate partnerships:
              </p>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">eSIM Providers</h3>
                  <p className="text-muted-foreground text-sm">
                    We may recommend eSIM providers for travelers who need mobile data abroad. 
                    If you purchase an eSIM through our links, we may earn a commission at no 
                    extra cost to you.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Travel Insurance</h3>
                  <p className="text-muted-foreground text-sm">
                    We recommend travel insurance as an essential part of trip planning. 
                    Purchases made through our insurance partner links may result in a 
                    commission for us.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Tours & Activities (GetYourGuide)</h3>
                  <p className="text-muted-foreground text-sm">
                    We partner with GetYourGuide to offer tour and activity recommendations. 
                    Bookings made through these links earn us a referral commission.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Display Advertising</h3>
                  <p className="text-muted-foreground text-sm">
                    We display advertisements on our website. These ads are served by third-party 
                    networks and we earn revenue based on impressions and clicks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editorial Independence */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Our Promise to You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Unbiased Recommendations</strong>
                    <p className="text-muted-foreground text-sm">
                      Our product recommendations are based on quality, value, and relevance to 
                      travelers—never on commission rates. We recommend products we genuinely 
                      believe will help our readers.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>No Extra Cost to You</strong>
                    <p className="text-muted-foreground text-sm">
                      Using our affiliate links does not cost you anything extra. In many cases, 
                      we negotiate exclusive discounts that save you money.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Editorial Independence</strong>
                    <p className="text-muted-foreground text-sm">
                      Our editorial team operates independently from our business development team. 
                      Affiliate relationships do not influence our visa information or travel advice.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Honest Reviews</strong>
                    <p className="text-muted-foreground text-sm">
                      We only recommend products and services we have researched thoroughly. 
                      We include both pros and cons in our recommendations.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How Links are Marked */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                How Affiliate Links are Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We strive to be transparent about affiliate relationships:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Affiliate links are typically marked with labels such as "Affiliate Link" or 
                  include a disclosure statement nearby.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Sponsored content or paid partnerships are clearly labeled as "Sponsored" or 
                  "In Partnership With."
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Product recommendation sections include a disclosure about potential affiliate compensation.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* What This Means */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                What This Means for You
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                When you click on an affiliate link and make a purchase, we may receive a small 
                commission from the company whose product you purchased. This happens at absolutely 
                no additional cost to you and sometimes even at a discount.
              </p>
              <p>
                These commissions are how we fund our operations and continue to provide free, 
                comprehensive visa information to travelers worldwide. Your support through these 
                links directly contributes to our ability to maintain and improve Visas.Guide.
              </p>
              <p>
                If you prefer not to use affiliate links, you can always navigate directly to the 
                provider&apos;s website. We respect your choice either way, and our visa information 
                remains free regardless of whether you use our affiliate links.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Disclaimer */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Third-Party Links Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                Our website contains links to third-party websites that are not owned or controlled 
                by Visas.Guide. We have no control over, and assume no responsibility for, the content, 
                privacy policies, or practices of any third-party websites.
              </p>
              <p>
                We encourage you to read the terms and conditions and privacy policies of any 
                third-party websites you visit through links on our site.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Questions About Our Affiliate Relationships?</h3>
              <p className="text-muted-foreground mb-4">
                We are committed to transparency. If you have any questions about our affiliate 
                partnerships or how we earn revenue, please do not hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:info@visas.guide" 
                  className="text-primary hover:underline font-medium"
                >
                  Email: info@visas.guide
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <Link 
                  to="/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  Contact Form →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AffiliateDisclosure;
