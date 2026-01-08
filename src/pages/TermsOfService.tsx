import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <title>Terms of Service | Visas.Guide</title>
      <meta name="description" content="Terms of Service for Visas.Guide - Read our terms and conditions for using our visa information services." />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold">Terms of Service</CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Visas.Guide, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>

            <h2>2. Use of Service</h2>
            <p>Visas.Guide provides visa information and travel documentation guidance. You agree to:</p>
            <ul>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not interfere with the proper working of the service</li>
              <li>Verify all visa information with official government sources before travel</li>
            </ul>

            <h2>3. Information Accuracy</h2>
            <p>
              While we strive to provide accurate and up-to-date visa information, Visas.Guide does not guarantee the accuracy, completeness, or timeliness of the information provided. Visa requirements can change frequently, and you should always verify requirements with official embassy or consulate sources.
            </p>

            <h2>4. Disclaimer of Warranties</h2>
            <p>
              The service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              Visas.Guide shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This includes but is not limited to visa application denials, travel delays, or financial losses.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on Visas.Guide, including text, graphics, logos, and software, is the property of Visas.Guide and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2>8. User Content</h2>
            <p>
              If you submit content to our service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute such content in connection with the service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason, including breach of these Terms.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable international laws, without regard to conflict of law provisions.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p>Email: legal@visas.guide</p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
