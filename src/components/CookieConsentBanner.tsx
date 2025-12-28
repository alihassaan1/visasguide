import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateConsent = (granted: boolean) => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
        analytics_storage: "granted", // Always keep analytics
      });
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent", "accepted");
    updateConsent(true);
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential");
    updateConsent(false);
    setIsVisible(false);
  };

  const handleClose = () => {
    // Treat closing as accepting essential only
    localStorage.setItem("cookie_consent", "essential");
    updateConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                We use cookies to improve your experience
              </p>
              <p>
                We use cookies for analytics and to personalize content and ads. 
                By clicking "Accept All", you consent to our use of cookies. 
                Read our{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptEssential}
              className="whitespace-nowrap"
            >
              Essential Only
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="whitespace-nowrap bg-primary hover:bg-primary/90"
            >
              Accept All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              aria-label="Close cookie banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
