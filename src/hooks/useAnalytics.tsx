import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Get visitor IP and location (simplified version)
const getVisitorInfo = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip,
      location: {
        country: data.country_name,
        city: data.city,
        region: data.region
      }
    };
  } catch {
    return { ip: 'unknown', location: {} };
  }
};

// Track page view
export const trackPageView = async (pageSlug: string) => {
  const visitorInfo = await getVisitorInfo();
  const referrer = document.referrer;
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  
  // Detect search engine referrals
  let referrerSource = 'direct';
  let searchEngineQuery = null;
  
  if (referrer) {
    if (referrer.includes('google.com')) {
      referrerSource = 'google';
      searchEngineQuery = new URL(referrer).searchParams.get('q');
    } else if (referrer.includes('bing.com')) {
      referrerSource = 'bing';
      searchEngineQuery = new URL(referrer).searchParams.get('q');
    } else if (referrer.includes('yahoo.com')) {
      referrerSource = 'yahoo';
      searchEngineQuery = new URL(referrer).searchParams.get('p');
    } else if (referrer.includes('duckduckgo.com')) {
      referrerSource = 'duckduckgo';
      searchEngineQuery = new URL(referrer).searchParams.get('q');
    } else {
      referrerSource = 'referral';
    }
  }
  
  await supabase.from('analytics_events').insert({
    event_type: searchEngineQuery ? 'search_engine_referral' : 'page_view',
    page_slug: pageSlug,
    search_engine_query: searchEngineQuery,
    referrer_source: referrerSource,
    visitor_ip: visitorInfo.ip,
    visitor_location: visitorInfo.location,
    user_agent: navigator.userAgent
  });
};

// Track visa search (from country to country)
export const trackVisaSearch = async (
  fromCountryId: string,
  toCountryId: string,
  searchTerm?: string
) => {
  const visitorInfo = await getVisitorInfo();
  
  await supabase.from('analytics_events').insert({
    event_type: 'search',
    from_country_id: fromCountryId,
    to_country_id: toCountryId,
    search_term: searchTerm,
    visitor_ip: visitorInfo.ip,
    visitor_location: visitorInfo.location,
    user_agent: navigator.userAgent
  });
};

// Hook to track page views and time spent
export const usePageTracking = (pageSlug: string) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Track page view on mount
    trackPageView(pageSlug);

    // Track time spent on unmount
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      supabase.from('analytics_events').insert({
        event_type: 'page_view',
        page_slug: pageSlug,
        session_duration_seconds: timeSpent
      });
    };
  }, [pageSlug]);
};
