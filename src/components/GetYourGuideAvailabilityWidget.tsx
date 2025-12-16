import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AffiliateDisclosure from './AffiliateDisclosure';

interface GetYourGuideAvailabilityWidgetProps {
  tourId?: string;
  cityId?: string;
  countryId?: string;
  position?: string;
  partnerId?: string;
  variant?: 'horizontal' | 'vertical';
  currency?: string;
  className?: string;
  showDisclosure?: boolean;
}

const GetYourGuideAvailabilityWidget = ({
  tourId: propTourId,
  cityId,
  countryId,
  position = 'main-content',
  partnerId = 'WN9V7PZ',
  variant = 'horizontal',
  currency = 'USD',
  className = '',
  showDisclosure = true
}: GetYourGuideAvailabilityWidgetProps) => {
  const scriptLoaded = useRef(false);

  // Query database for availability widget if tourId not provided directly
  const { data: widgetData } = useQuery({
    queryKey: ['gyg-availability-widget', cityId, countryId, position],
    queryFn: async () => {
      // First try city-specific widget
      if (cityId) {
        const { data } = await supabase
          .from('affiliate_widgets')
          .select('*')
          .eq('affiliate_program', 'getyourguide')
          .eq('widget_variant', 'availability')
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
          .eq('widget_variant', 'availability')
          .eq('country_id', countryId)
          .eq('position', position)
          .eq('is_active', true)
          .maybeSingle();
        return data;
      }
      return null;
    },
    enabled: !propTourId && (!!cityId || !!countryId)
  });

  const tourId = propTourId || widgetData?.tour_id;

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

  // Don't render if no tour ID configured
  if (!tourId) {
    return null;
  }

  return (
    <div className={className}>
      <div 
        data-gyg-href="https://widget.getyourguide.com/default/availability.frame"
        data-gyg-tour-id={tourId}
        data-gyg-locale-code="en-US"
        data-gyg-currency={currency}
        data-gyg-widget="availability"
        data-gyg-variant={variant}
        data-gyg-partner-id={partnerId}
        style={{ minHeight: '120px' }}
      >
        <span>
          Powered by{' '}
          <a target="_blank" rel="sponsored noopener noreferrer" href="https://www.getyourguide.com/">
            GetYourGuide
          </a>
        </span>
      </div>

      {showDisclosure && (
        <div className="mt-2">
          <AffiliateDisclosure variant="compact" />
        </div>
      )}
    </div>
  );
};

export default GetYourGuideAvailabilityWidget;
