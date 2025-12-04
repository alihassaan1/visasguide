import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Parse user agent to extract device/browser/OS info
const parseUserAgent = (ua: string) => {
  // Bot detection
  const isBot = /bot|crawler|spider|googlebot|bingbot|facebookexternalhit|slurp|duckduckbot|yandexbot|baiduspider|sogou|exabot|ia_archiver/i.test(ua);
  
  // Device type detection
  const isTablet = /tablet|ipad|playbook|silk/i.test(ua);
  const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua) && !isTablet;
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  
  // Device name extraction
  let deviceName = 'Unknown Device';
  if (/iPhone/i.test(ua)) {
    const match = ua.match(/iPhone\s*(\d+)?/i);
    deviceName = match && match[1] ? `iPhone ${match[1]}` : 'iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceName = 'iPad';
  } else if (/Samsung/i.test(ua)) {
    const match = ua.match(/Samsung\s+([^\s;)]+)/i);
    deviceName = match ? `Samsung ${match[1]}` : 'Samsung Device';
  } else if (/SM-[A-Z0-9]+/i.test(ua)) {
    const match = ua.match(/SM-([A-Z0-9]+)/i);
    deviceName = match ? `Samsung ${match[1]}` : 'Samsung Device';
  } else if (/Pixel/i.test(ua)) {
    const match = ua.match(/Pixel\s*(\d+\s*\w*)?/i);
    deviceName = match && match[1] ? `Google Pixel ${match[1].trim()}` : 'Google Pixel';
  } else if (/OnePlus/i.test(ua)) {
    const match = ua.match(/OnePlus\s*([^\s;)]+)?/i);
    deviceName = match && match[1] ? `OnePlus ${match[1]}` : 'OnePlus Device';
  } else if (/HUAWEI|Honor/i.test(ua)) {
    const match = ua.match(/(HUAWEI|Honor)\s*([^\s;)]+)?/i);
    deviceName = match ? `${match[1]} ${match[2] || ''}`.trim() : 'Huawei Device';
  } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
    const match = ua.match(/(Xiaomi|Redmi|POCO)\s*([^\s;)]+)?/i);
    deviceName = match ? `${match[1]} ${match[2] || ''}`.trim() : 'Xiaomi Device';
  } else if (/Macintosh/i.test(ua)) {
    deviceName = 'Mac';
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC';
  } else if (/Linux/i.test(ua) && !isMobile) {
    deviceName = 'Linux PC';
  } else if (/Android/i.test(ua)) {
    deviceName = 'Android Device';
  }
  
  // Browser detection
  let browserName = 'Unknown';
  let browserVersion = '';
  
  if (/Edg\//i.test(ua)) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/i)?.[1] || '';
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browserName = 'Opera';
    browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/i)?.[1] || '';
  } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/i)?.[1] || '';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/i)?.[1] || '';
  } else if (/Firefox/i.test(ua)) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/i)?.[1] || '';
  } else if (/MSIE|Trident/i.test(ua)) {
    browserName = 'Internet Explorer';
    browserVersion = ua.match(/(?:MSIE |rv:)([\d.]+)/i)?.[1] || '';
  }
  
  // OS detection
  let osName = 'Unknown';
  let osVersion = '';
  
  if (/Windows NT/i.test(ua)) {
    osName = 'Windows';
    const ntVersion = ua.match(/Windows NT ([\d.]+)/i)?.[1];
    const versionMap: Record<string, string> = {
      '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP'
    };
    osVersion = ntVersion ? (versionMap[ntVersion] || ntVersion) : '';
  } else if (/Mac OS X/i.test(ua)) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X ([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
  } else if (/iPhone OS|iPad/i.test(ua)) {
    osName = 'iOS';
    osVersion = ua.match(/(?:iPhone OS|CPU OS) ([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
  } else if (/Android/i.test(ua)) {
    osName = 'Android';
    osVersion = ua.match(/Android ([\d.]+)/i)?.[1] || '';
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux';
  } else if (/CrOS/i.test(ua)) {
    osName = 'Chrome OS';
  }
  
  return { deviceType, deviceName, browserName, browserVersion, osName, osVersion, isBot };
};

// Get screen info
const getScreenInfo = () => ({
  screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
  screenHeight: typeof window !== 'undefined' ? window.screen.height : 0
});

// Get visitor IP and location
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

// Track page view with full device info
export const trackPageView = async (pageSlug: string) => {
  const visitorInfo = await getVisitorInfo();
  const referrer = document.referrer;
  const userAgent = navigator.userAgent;
  const deviceInfo = parseUserAgent(userAgent);
  const screenInfo = getScreenInfo();
  
  // Detect search engine referrals
  let referrerSource = 'direct';
  let searchEngineQuery = null;
  
  if (referrer) {
    try {
      if (referrer.includes('google.')) {
        referrerSource = 'google';
        searchEngineQuery = new URL(referrer).searchParams.get('q');
      } else if (referrer.includes('bing.')) {
        referrerSource = 'bing';
        searchEngineQuery = new URL(referrer).searchParams.get('q');
      } else if (referrer.includes('yahoo.')) {
        referrerSource = 'yahoo';
        searchEngineQuery = new URL(referrer).searchParams.get('p');
      } else if (referrer.includes('duckduckgo.')) {
        referrerSource = 'duckduckgo';
        searchEngineQuery = new URL(referrer).searchParams.get('q');
      } else if (referrer.includes('yandex.')) {
        referrerSource = 'yandex';
        searchEngineQuery = new URL(referrer).searchParams.get('text');
      } else if (referrer.includes('baidu.')) {
        referrerSource = 'baidu';
        searchEngineQuery = new URL(referrer).searchParams.get('wd');
      } else {
        referrerSource = referrer; // Store full referrer URL
      }
    } catch {
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
    user_agent: userAgent,
    device_type: deviceInfo.deviceType,
    device_name: deviceInfo.deviceName,
    browser_name: deviceInfo.browserName,
    browser_version: deviceInfo.browserVersion,
    os_name: deviceInfo.osName,
    os_version: deviceInfo.osVersion,
    screen_width: screenInfo.screenWidth,
    screen_height: screenInfo.screenHeight,
    is_bot: deviceInfo.isBot
  });
};

// Track visa search
export const trackVisaSearch = async (
  fromCountryId: string,
  toCountryId: string,
  searchTerm?: string
) => {
  const visitorInfo = await getVisitorInfo();
  const userAgent = navigator.userAgent;
  const deviceInfo = parseUserAgent(userAgent);
  const screenInfo = getScreenInfo();
  
  await supabase.from('analytics_events').insert({
    event_type: 'search',
    from_country_id: fromCountryId,
    to_country_id: toCountryId,
    search_term: searchTerm,
    visitor_ip: visitorInfo.ip,
    visitor_location: visitorInfo.location,
    user_agent: userAgent,
    device_type: deviceInfo.deviceType,
    device_name: deviceInfo.deviceName,
    browser_name: deviceInfo.browserName,
    browser_version: deviceInfo.browserVersion,
    os_name: deviceInfo.osName,
    os_version: deviceInfo.osVersion,
    screen_width: screenInfo.screenWidth,
    screen_height: screenInfo.screenHeight,
    is_bot: deviceInfo.isBot
  });
};

// Track newsletter signup
export const trackNewsletterSignup = async (email: string) => {
  const visitorInfo = await getVisitorInfo();
  const userAgent = navigator.userAgent;
  const deviceInfo = parseUserAgent(userAgent);
  
  await supabase.from('analytics_events').insert({
    event_type: 'newsletter_signup',
    visitor_ip: visitorInfo.ip,
    visitor_location: visitorInfo.location,
    user_agent: userAgent,
    device_type: deviceInfo.deviceType,
    browser_name: deviceInfo.browserName,
    is_bot: deviceInfo.isBot
  });
};

// Track affiliate click
export const trackAffiliateClick = async (affiliateName: string, pageSlug: string) => {
  const visitorInfo = await getVisitorInfo();
  const deviceInfo = parseUserAgent(navigator.userAgent);
  
  await supabase.from('analytics_events').insert({
    event_type: 'affiliate_click',
    page_slug: pageSlug,
    search_term: affiliateName, // Store affiliate name in search_term field
    visitor_ip: visitorInfo.ip,
    visitor_location: visitorInfo.location,
    device_type: deviceInfo.deviceType,
    is_bot: deviceInfo.isBot
  });
};

// Hook to track page views and time spent
export const usePageTracking = (pageSlug: string) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    trackPageView(pageSlug);

    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const deviceInfo = parseUserAgent(navigator.userAgent);
      const screenInfo = getScreenInfo();
      
      supabase.from('analytics_events').insert({
        event_type: 'page_exit',
        page_slug: pageSlug,
        session_duration_seconds: timeSpent,
        device_type: deviceInfo.deviceType,
        device_name: deviceInfo.deviceName,
        browser_name: deviceInfo.browserName,
        os_name: deviceInfo.osName,
        screen_width: screenInfo.screenWidth,
        screen_height: screenInfo.screenHeight,
        is_bot: deviceInfo.isBot
      });
    };
  }, [pageSlug]);
};
