import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { trackNewsletterSignup } from "@/hooks/useAnalytics";

interface NewsletterSignupProps {
  variant?: "default" | "sidebar" | "popup";
}

const NewsletterSignup = ({ variant = "default" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
          country_of_interest: country || null,
          subscribed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Record the signup as an analytics event (powers the Newsletter Signups metric)
      try {
        await trackNewsletterSignup(email);
      } catch (trackError) {
        console.error('Newsletter signup tracking failed:', trackError);
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-newsletter-confirmation', {
          body: { email, name }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast({
        title: "Successfully Subscribed!",
        description: "Check your email for confirmation.",
      });

      setEmail("");
      setName("");
      setCountry("");
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === "sidebar") {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Newsletter</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get weekly visa updates and travel news delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Country of Interest (optional)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl border border-border/50 py-10 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Stay Updated on Visa News</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Get weekly visa updates, travel tips, and immigration news.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background"
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto px-8">
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSignup;
