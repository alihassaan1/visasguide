import { useEffect, useRef } from 'react';
import AffiliateDisclosure from './AffiliateDisclosure';

interface GetYourGuideWidgetProps {
  partnerId?: string;
  location?: string;
  locationId?: string;
  numberOfItems?: number;
  widget?: 'activities' | 'city';
  className?: string;
  showDisclosure?: boolean;
}

// GetYourGuide location IDs for popular destinations
const locationIds: Record<string, string> = {
  'thailand': 'l169040',
  'bangkok': 'l187',
  'chiang-mai': 'l188',
  'phuket': 'l189',
  'pattaya': 'l2630',
  'indonesia': 'l171310',
  'bali': 'l551',
  'jakarta': 'l550',
  'japan': 'l169041',
  'tokyo': 'l193',
  'osaka': 'l194',
  'kyoto': 'l195',
  'singapore': 'l212',
  'malaysia': 'l169048',
  'kuala-lumpur': 'l199',
  'uae': 'l169055',
  'dubai': 'l173',
  'abu-dhabi': 'l2621',
  'france': 'l169016',
  'paris': 'l16',
  'uk': 'l169015',
  'london': 'l57',
  'usa': 'l169058',
  'new-york': 'l59',
  'los-angeles': 'l58',
  'italy': 'l169017',
  'rome': 'l31',
  'venice': 'l35',
  'spain': 'l169018',
  'barcelona': 'l45',
  'madrid': 'l46',
  'germany': 'l169019',
  'berlin': 'l17',
  'australia': 'l169033',
  'sydney': 'l207',
  'india': 'l169039',
  'delhi': 'l197',
  'turkey': 'l169053',
  'istanbul': 'l56',
  'egypt': 'l169020',
  'cairo': 'l178',
  'south-korea': 'l169044',
  'seoul': 'l236',
};

const GetYourGuideWidget = ({
  partnerId = 'WN9V7PZ',
  location,
  locationId,
  numberOfItems = 6,
  widget = 'activities',
  className = '',
  showDisclosure = true
}: GetYourGuideWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get location ID from slug or use provided locationId
  const getLocationId = () => {
    if (locationId) return locationId;
    
    // Try to match location name to ID
    if (location) {
      const slug = location.toLowerCase()
        .split(',')[0]
        .trim()
        .replace(/\s+/g, '-');
      return locationIds[slug] || '';
    }
    return '';
  };

  // Build widget URL
  const getWidgetUrl = () => {
    const locId = getLocationId();
    const baseUrl = widget === 'city' 
      ? 'https://widget.getyourguide.com/default/city.frame'
      : 'https://widget.getyourguide.com/default/activities.frame';
    
    const params = new URLSearchParams({
      partner_id: partnerId,
      number_of_items: numberOfItems.toString(),
      currency: 'USD',
      locale_code: 'en-US',
    });

    if (locId) {
      params.append('location_id', locId);
    } else if (location) {
      params.append('q', location);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={`${className}`}>
      {/* Widget Container - Seamless integration */}
      <div ref={containerRef}>
        <iframe
          src={getWidgetUrl()}
          className="w-full border-0 bg-transparent"
          style={{ 
            minHeight: numberOfItems > 4 ? '800px' : '550px',
            overflow: 'hidden'
          }}
          title={`GetYourGuide ${location || 'Activities'} Widget`}
          loading="lazy"
          allow="payment"
          scrolling="no"
        />
      </div>

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
