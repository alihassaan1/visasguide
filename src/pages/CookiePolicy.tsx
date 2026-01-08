import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <title>Cookie Policy | Visas.Guide</title>
      <meta name="description" content="Cookie Policy for Visas.Guide - Learn about how we use cookies and similar technologies." />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold">Cookie Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: January 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>Visas.Guide uses cookies for various purposes:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Track visitor activity to provide relevant advertisements</li>
            </ul>

            <h2>3. Types of Cookies We Use</h2>
            
            <h3>Session Cookies</h3>
            <p>
              These are temporary cookies that expire when you close your browser. They help us track your activities during a single browsing session.
            </p>

            <h3>Persistent Cookies</h3>
            <p>
              These cookies remain on your device for a set period or until you delete them. They help us recognize you when you return to our website.
            </p>

            <h3>Third-Party Cookies</h3>
            <p>
              We may use third-party services like Google Analytics that place cookies on your device to help us analyze website traffic and improve our service.
            </p>

            <h2>4. Managing Cookies</h2>
            <p>
              You can control and manage cookies in various ways:
            </p>
            <ul>
              <li>Browser Settings: Most browsers allow you to refuse or accept cookies</li>
              <li>Third-Party Tools: Use privacy tools to manage tracking cookies</li>
              <li>Opt-Out: You can opt-out of specific third-party cookies through their websites</li>
            </ul>

            <h2>5. Cookie Duration</h2>
            <p>The duration of cookies varies depending on their purpose:</p>
            <ul>
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Analytics cookies: Typically expire after 1-2 years</li>
              <li>Preference cookies: May persist for several months to years</li>
            </ul>

            <h2>6. Impact of Disabling Cookies</h2>
            <p>
              If you disable cookies, some features of our website may not function properly. You may experience:
            </p>
            <ul>
              <li>Inability to save preferences</li>
              <li>Reduced personalization</li>
              <li>Limited access to certain features</li>
            </ul>

            <h2>7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. Please check this page periodically for updates.
            </p>

            <h2>8. More Information</h2>
            <p>
              For more information about how we use cookies and protect your privacy, please refer to our Privacy Policy.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p>Email: privacy@visas.guide</p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
