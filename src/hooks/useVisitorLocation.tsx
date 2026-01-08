import { useState, useEffect } from "react";

interface VisitorLocation {
  countryCode: string;
  countryName: string;
  city: string;
  isLoading: boolean;
}

const CACHE_KEY = "visitor_location";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useVisitorLocation(): VisitorLocation {
  const [location, setLocation] = useState<VisitorLocation>({
    countryCode: "",
    countryName: "",
    city: "",
    isLoading: true,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      // Check cache first
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
            setLocation({
              countryCode: parsed.countryCode || "",
              countryName: parsed.countryName || "",
              city: parsed.city || "",
              isLoading: false,
            });
            return;
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const locationData = {
            countryCode: data.country_code || "",
            countryName: data.country_name || "",
            city: data.city || "",
            timestamp: Date.now(),
          };
          
          // Cache the result
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(locationData));
          
          setLocation({
            countryCode: locationData.countryCode,
            countryName: locationData.countryName,
            city: locationData.city,
            isLoading: false,
          });
        } else {
          setLocation(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to fetch visitor location:", error);
        setLocation(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchLocation();
  }, []);

  return location;
}
