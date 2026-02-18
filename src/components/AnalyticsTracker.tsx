import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics 4 Tracker
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Track newsletter signups
  const trackNewsletterSignup = (email: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'newsletter_signup', {
        event_category: 'engagement',
        event_label: 'Newsletter Subscription',
        value: 1
      });
    }
  };

  // Track affiliate clicks
  const trackAffiliateClick = (affiliateName: string, url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: affiliateName,
        affiliate_url: url,
        value: 1
      });
    }
  };

  // Track search queries
  const trackSearch = (query: string, resultCount: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: query,
        result_count: resultCount
      });
    }
  };

  return null;
};

// Export tracking functions for use in components
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

export default AnalyticsTracker;
