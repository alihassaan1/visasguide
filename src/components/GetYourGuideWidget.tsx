import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AffiliateDisclosure from './AffiliateDisclosure';

interface GetYourGuideWidgetProps {
  partnerId?: string;
  location?: string;
  locationId?: string;
  cityId?: string;
  countryId?: string;
  position?: string;
  numberOfItems?: number;
  className?: string;
  showDisclosure?: boolean;
}

const GetYourGuideWidget = ({
  partnerId = 'WN9V7PZ',
  location,
  locationId,
  cityId,
  countryId,
  position = 'main-content',
  numberOfItems = 6,
  className = '',
  showDisclosure = true
}: GetYourGuideWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Query database for widget configuration if cityId or countryId provided
  const { data: widgetData, isLoading } = useQuery({
    queryKey: ['gyg-city-widget', cityId, countryId, position],
    queryFn: async () => {
      // First try city-specific widget
      if (cityId) {
        const { data } = await supabase
          .from('affiliate_widgets')
          .select('*')
          .eq('affiliate_program', 'getyourguide')
          .eq('widget_variant', 'city')
          .eq('city_id', cityId)
          .eq('position', position)
          .eq('is_active', true)
          .maybeSingle();
        if (data) return data;
      }
      // Fall back to country-level widget
      if (countryId) {
        const { data } = await supabase
          .from('affiliate_widgets')
          .select('*')
          .eq('affiliate_program', 'getyourguide')
          .eq('widget_variant', 'city')
          .eq('country_id', countryId)
          .eq('position', position)
          .eq('is_active', true)
          .maybeSingle();
        return data;
      }
      return null;
    },
    enabled: !!cityId || !!countryId
  });

  // Use widget URL from database or fall back to location prop
  const widgetUrl = widgetData?.widget_url;

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

  // If using database query and no widget found, render nothing (clean page)
  if ((cityId || countryId) && !isLoading && !widgetData && !locationId && !location) {
    return null;
  }

  // Determine what to render
  const hasDbWidget = !!widgetUrl;
  const hasLocationId = !!locationId;
  const hasLocation = !!location;

  // If no configuration at all, render nothing
  if (!hasDbWidget && !hasLocationId && !hasLocation) {
    return null;
  }

  // Only render if we have a valid widget URL (no more Italy fallback)
  if (!widgetUrl) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Native GetYourGuide Widget */}
      <div 
        ref={containerRef}
        data-gyg-href={widgetUrl}
        data-gyg-location-id={locationId || undefined}
        data-gyg-q={!locationId && location ? location : undefined}
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
