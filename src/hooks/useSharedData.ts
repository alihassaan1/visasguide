import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shared, long-lived caches for rarely-changing public tables.
 * Every component must read these tables through these hooks so the
 * whole app makes ONE request per table per 24h session.
 */
const DAY = 24 * 60 * 60 * 1000;
export const SHARED_QUERY_OPTIONS = {
  staleTime: DAY,
  gcTime: DAY,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;

export const QUERY_KEYS = {
  countries: ["shared", "countries"] as const,
  authors: ["shared", "authors"] as const,
  siteSettings: ["shared", "site_settings"] as const,
  affiliates: ["shared", "settings_affiliates"] as const,
};

export type SharedCountry = {
  id: string;
  name: string;
  code: string;
  slug: string;
  flag_emoji: string | null;
  continent: string | null;
  region: string | null;
  capital: string | null;
  population: number | null;
  currency: string | null;
  language: string | null;
  passport_rank: number | null;
  passport_score: number | null;
  visa_free_destinations: number | null;
  eta_destinations: number | null;
  passport_free_destinations: number | null;
  voa_destinations: number | null;
  evisa_destinations: number | null;
  visa_required_destinations: number | null;
  entry_ban_destinations: number | null;
  annual_tourists: number | null;
  tourism_rank: number | null;
  tourism_revenue_usd: number | null;
  top_source_countries: string[] | null;
  peak_travel_months: string | null;
  tourism_growth_percent: number | null;
  created_at: string;
  updated_at: string;
};

export function useCountries() {
  return useQuery({
    queryKey: QUERY_KEYS.countries,
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("*").order("name");
      if (error) throw error;
      return (data || []) as SharedCountry[];
    },
    ...SHARED_QUERY_OPTIONS,
  });
}

export function useAuthors() {
  return useQuery({
    queryKey: QUERY_KEYS.authors,
    queryFn: async () => {
      const { data, error } = await supabase.from("authors").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
    ...SHARED_QUERY_OPTIONS,
  });
}

/** All site_settings rows in a single query, keyed by setting_key. */
export function useSiteSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.siteSettings,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("setting_key, setting_value");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((r) => {
        map[r.setting_key] = r.setting_value;
      });
      return map;
    },
    ...SHARED_QUERY_OPTIONS,
  });
}

export function useSiteSetting<T = any>(key: string): T | undefined {
  const { data } = useSiteSettings();
  return data?.[key] as T | undefined;
}

/** All active affiliate banners in one query; filter by slot client-side. */
export function useAffiliateBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.affiliates,
    queryFn: async () => {
      const { data, error } = await supabase.from("settings_affiliates").select("*").eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    ...SHARED_QUERY_OPTIONS,
  });
}
