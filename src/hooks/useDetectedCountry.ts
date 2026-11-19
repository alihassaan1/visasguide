import { useVisitorLocation } from './useVisitorLocation';

/**
 * Detect the user's country via IP geolocation (cached in localStorage).
 * Returns ISO 3166-1 alpha-2 country code (e.g. "GB", "US").
 */
export function useDetectedCountry() {
  const { countryCode } = useVisitorLocation();
  const code = countryCode.toUpperCase();
  return code.length === 2 ? code : null;
}
