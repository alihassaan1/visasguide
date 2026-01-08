// Site-wide constants for easy maintenance

// Current year - update this once per year instead of searching entire codebase
export const CURRENT_YEAR = 2026;

// Site info
export const SITE_NAME = "Visas.Guide";
export const SITE_URL = "https://visas.guide";

// Country image mappings for guides without featured images
export const countryHeroImages: Record<string, string> = {
  'united-states': '/src/assets/destinations/usa.jpg',
  'usa': '/src/assets/destinations/usa.jpg',
  'united-kingdom': '/src/assets/destinations/uk.jpg',
  'uk': '/src/assets/destinations/uk.jpg',
  'canada': '/src/assets/destinations/canada.jpg',
  'france': '/src/assets/destinations/france.jpg',
  'germany': '/src/assets/destinations/germany.jpg',
  'japan': '/src/assets/destinations/japan.jpg',
  'thailand': '/src/assets/destinations/thailand.jpg',
  'singapore': '/src/assets/destinations/singapore.jpg',
  'malaysia': '/src/assets/destinations/malaysia.jpg',
  'indonesia': '/src/assets/destinations/indonesia.jpg',
  'south-korea': '/src/assets/destinations/south-korea.jpg',
  'united-arab-emirates': '/src/assets/destinations/uae.jpg',
  'uae': '/src/assets/destinations/uae.jpg',
  'pakistan': '/src/assets/destinations/pakistan.jpg',
  'poland': '/src/assets/destinations/poland.jpg',
  'hungary': '/src/assets/destinations/hungary.jpg',
  'slovakia': '/src/assets/destinations/slovakia.jpg',
  'slovenia': '/src/assets/destinations/slovenia.jpg',
  'iceland': '/src/assets/destinations/iceland.jpg',
  'lithuania': '/src/assets/destinations/lithuania.jpg',
  'ivory-coast': '/src/assets/destinations/ivory-coast.jpg',
  'angola': '/src/assets/destinations/angola.jpg',
  'south-sudan': '/src/assets/destinations/south-sudan.jpg',
};

// Region-based fallback images
export const regionImages: Record<string, string> = {
  'europe': '/src/assets/destinations/france.jpg',
  'asia': '/src/assets/destinations/japan.jpg',
  'middle-east': '/src/assets/destinations/uae.jpg',
  'africa': '/src/assets/destinations/angola.jpg',
  'north-america': '/src/assets/destinations/canada.jpg',
  'south-america': '/src/assets/destinations/canada.jpg',
  'oceania': '/src/assets/destinations/singapore.jpg',
};

// Default fallback image
export const defaultGuideImage = '/src/assets/destinations/france.jpg';
