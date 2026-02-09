import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy | Visas.Guide"
        description="Privacy Policy for Visas.Guide - Learn how we collect, use, and protect your personal information when using our visa information services."
        canonical="https://visas.guide/privacy-policy"
        noIndex={true}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            <h2>1. Information We Collect</h2>
            <p>
              At Visas.Guide, we collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns and trends</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2>7. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>Email: privacy@visas.guide</p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
