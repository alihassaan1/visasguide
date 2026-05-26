import { useEffect, useState } from "react";

const STORAGE_KEY = "vg_detected_country_code";

/**
 * Detect the user's country via IP geolocation (cached in localStorage).
 * Returns ISO 3166-1 alpha-2 country code (e.g. "GB", "US").
 */
export function useDetectedCountry() {
  const [code, setCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (code) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const data = await res.json();
        const cc = (data?.country_code || data?.country || "").toString().toUpperCase();
        if (cancelled || !cc || cc.length !== 2) return;
        try { localStorage.setItem(STORAGE_KEY, cc); } catch {}
        setCode(cc);
      } catch {
        // silent fail
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  return code;
}
