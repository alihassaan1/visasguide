import { useQuery } from '@tanstack/react-query';

interface VisitorLocation {
  countryCode: string;
  countryName: string;
  city: string;
  isLoading: boolean;
}

const CACHE_KEY = "visitor_location";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useVisitorLocation(): VisitorLocation {
  const { data, isLoading } = useQuery({
    queryKey: ['visitor-location'],
    queryFn: async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const parsed = cached ? JSON.parse(cached) : null;
        if (parsed?.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
          return { countryCode: parsed.countryCode || '', countryName: parsed.countryName || '', city: parsed.city || '' };
        }
      } catch { /* Storage can be unavailable; continue without it. */ }
      let result = { countryCode: '', countryName: '', city: '' };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        if (response.ok) {
          const value = await response.json();
          result = { countryCode: value.country_code || '', countryName: value.country_name || '', city: value.city || '' };
        }
      } catch { /* Optional location must never delay or break page content. */ }
      finally { clearTimeout(timeout); }
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...result, timestamp: Date.now() })); } catch { /* Optional cache. */ }
      return result;
    },
    enabled: typeof window !== 'undefined',
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return { countryCode: data?.countryCode || '', countryName: data?.countryName || '', city: data?.city || '', isLoading };
}
