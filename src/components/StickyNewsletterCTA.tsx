import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackNewsletterSignup } from "@/hooks/useAnalytics";

const StickyNewsletterCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show after 10 seconds of page load
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    // Auto-hide after 15 seconds of being visible
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 25000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name: 'Newsletter Subscriber',
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
          body: { email, name: 'Newsletter Subscriber' }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast({
        title: "Subscribed!",
        description: "Check your email for confirmation.",
      });

      setEmail("");
      setIsVisible(false);
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary-dark text-primary-foreground p-4 shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-bold text-lg mb-1">📬 Get Weekly Visa Updates & Travel News</p>
            <p className="text-sm text-primary-foreground/90">Stay informed about visa changes, new requirements, and travel tips</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 min-w-[300px]">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-primary-foreground text-primary"
            />
            <Button 
              type="submit" 
              variant="secondary"
              disabled={loading}
            >
              {loading ? "..." : "Subscribe"}
            </Button>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyNewsletterCTA;
