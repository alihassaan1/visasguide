import { useEffect, useRef } from 'react';
import AffiliateDisclosure from './AffiliateDisclosure';

interface GetYourGuideWidgetProps {
  partnerId?: string;
  location?: string;
  locationId?: string;
  numberOfItems?: number;
  widget?: 'activities' | 'city' | 'search';
  className?: string;
  showDisclosure?: boolean;
}

const GetYourGuideWidget = ({
  partnerId = 'WN9V7PZ',
  location,
  locationId,
  numberOfItems = 4,
  widget = 'activities',
  className = '',
  showDisclosure = true
}: GetYourGuideWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Load GetYourGuide script if not already loaded
    if (!scriptLoaded.current && typeof window !== 'undefined') {
      const existingScript = document.querySelector('script[src*="getyourguide.com"]');
      
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

  // Build widget URL based on type
  const getWidgetUrl = () => {
    const baseUrl = 'https://widget.getyourguide.com/default/activities.frame';
    const params = new URLSearchParams({
      partner_id: partnerId,
      number_of_items: numberOfItems.toString(),
      ...(location && { q: location }),
      ...(locationId && { location_id: locationId }),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={`${className}`}>
      {/* Widget Container */}
      <div 
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border/50 shadow-sm"
      >
        <iframe
          src={getWidgetUrl()}
          className="w-full border-0 bg-background"
          style={{ minHeight: numberOfItems > 4 ? '600px' : '450px' }}
          title={`GetYourGuide ${location || 'Activities'} Widget`}
          loading="lazy"
          allow="payment"
        />
      </div>

      {/* Alternative: Native Widget (use data attributes) */}
      {widget === 'search' && (
        <div
          data-gyg-href={`https://www.getyourguide.com${location ? `/s?q=${encodeURIComponent(location)}` : ''}`}
          data-gyg-partner-id={partnerId}
          data-gyg-widget="activities"
          data-gyg-number-of-items={numberOfItems}
          data-gyg-locale-code="en-US"
          data-gyg-currency="USD"
        />
      )}

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
