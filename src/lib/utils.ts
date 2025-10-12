import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert ISO 3166-1 alpha-2 country code (e.g., "US") to flag emoji
export function countryCodeToFlagEmoji(code?: string): string {
  if (!code) return '';
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return '';
  try {
    const codePoints = [...cc].map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
}
