import { useEffect, useRef } from 'react';
import AffiliateDisclosure from './AffiliateDisclosure';

interface GetYourGuideWidgetProps {
  partnerId?: string;
  location?: string;
  locationId?: string;
  numberOfItems?: number;
  className?: string;
  showDisclosure?: boolean;
}

// GetYourGuide numeric location IDs for destinations
const locationIds: Record<string, string> = {
  // Countries
  'thailand': '169040',
  'indonesia': '171310',
  'japan': '169041',
  'singapore': '212',
  'malaysia': '169048',
  'uae': '169055',
  'france': '169016',
  'uk': '169015',
  'usa': '169058',
  'italy': '169017',
  'spain': '169018',
  'germany': '169019',
  'australia': '169033',
  'india': '169039',
  'turkey': '169053',
  'egypt': '169020',
  'south-korea': '169044',
  'vietnam': '169049',
  'philippines': '169051',
  'greece': '169021',
  'portugal': '169022',
  'netherlands': '169023',
  'mexico': '169056',
  'canada': '169057',
  'brazil': '169059',
  
  // Cities
  'bangkok': '187',
  'chiang-mai': '188',
  'phuket': '189',
  'pattaya': '2630',
  'bali': '551',
  'jakarta': '550',
  'tokyo': '193',
  'osaka': '194',
  'kyoto': '195',
  'kuala-lumpur': '199',
  'dubai': '173',
  'abu-dhabi': '2621',
  'paris': '16',
  'london': '57',
  'new-york': '59',
  'los-angeles': '58',
  'rome': '31',
  'venice': '35',
  'milan': '34',
  'barcelona': '45',
  'madrid': '46',
  'berlin': '17',
  'munich': '23',
  'sydney': '207',
  'melbourne': '208',
  'delhi': '197',
  'mumbai': '198',
  'istanbul': '56',
  'cairo': '178',
  'seoul': '236',
  'ho-chi-minh': '200',
  'hanoi': '201',
  'manila': '205',
  'athens': '27',
  'lisbon': '42',
  'amsterdam': '24',
  'cancun': '229',
  'toronto': '184',
  'vancouver': '185',
  'rio-de-janeiro': '230',
};

const GetYourGuideWidget = ({
  partnerId = 'WN9V7PZ',
  location,
  locationId,
  numberOfItems = 6,
  className = '',
  showDisclosure = true
}: GetYourGuideWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Get location ID from slug or use provided locationId
  const getLocationId = (): string => {
    if (locationId) return locationId;
    
    if (location) {
      // Extract city name and try to match
      const cityName = location.toLowerCase()
        .split(',')[0]
        .trim()
        .replace(/\s+/g, '-');
      
      if (locationIds[cityName]) {
        return locationIds[cityName];
      }
      
      // Try country name from "City, Country" format
      const parts = location.split(',');
      if (parts.length > 1) {
        const countryName = parts[1].trim().toLowerCase().replace(/\s+/g, '-');
        if (locationIds[countryName]) {
          return locationIds[countryName];
        }
      }
    }
    return '';
  };

  useEffect(() => {
    // Load GetYourGuide script
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      const existingScript = document.querySelector('script[src*="getyourguide.com/dist/pa.umd"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
        script.async = true;
        script.dataset.gyg_partner_id = partnerId;
        document.body.appendChild(script);
      }
      scriptLoaded.current = true;
    }
  }, [partnerId]);

  const locId = getLocationId();

  return (
    <div className={`${className}`}>
      {/* Native GetYourGuide Widget */}
      <div 
        ref={containerRef}
        data-gyg-href="https://widget.getyourguide.com/default/city.frame"
        data-gyg-location-id={locId || undefined}
        data-gyg-q={!locId && location ? location : undefined}
        data-gyg-locale-code="en-US"
        data-gyg-widget="city"
        data-gyg-number-of-items={numberOfItems}
        data-gyg-partner-id={partnerId}
        data-gyg-currency="USD"
        style={{ minHeight: '400px' }}
      />

      {/* Affiliate Disclosure */}
      {showDisclosure && (
        <div className="mt-3">
          <AffiliateDisclosure variant="compact" />
        </div>
      )}
    </div>
  );
};

export default GetYourGuideWidget;
