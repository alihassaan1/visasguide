ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS banner_id uuid;
CREATE INDEX IF NOT EXISTS idx_analytics_events_banner_id ON public.analytics_events (banner_id) WHERE banner_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_start timestamp with time zone, p_end timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'pageViews', COALESCE(SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') THEN 1 ELSE 0 END), 0),
    'humanPageViews', COALESCE(SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') AND COALESCE(is_bot, false) = false THEN 1 ELSE 0 END), 0),
    'botPageViews', COALESCE(SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') AND is_bot = true THEN 1 ELSE 0 END), 0),
    'searches', COALESCE(SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END), 0),
    'searchEngineReferrals', COALESCE(SUM(CASE WHEN event_type = 'search_engine_referral' THEN 1 ELSE 0 END), 0),
    'total', COUNT(*),
    'humanTotal', COALESCE(SUM(CASE WHEN COALESCE(is_bot, false) = false THEN 1 ELSE 0 END), 0),
    'uniqueVisitors', COUNT(DISTINCT visitor_ip),
    'humanUniqueVisitors', COUNT(DISTINCT visitor_ip) FILTER (WHERE COALESCE(is_bot, false) = false),
    'botUniqueVisitors', COUNT(DISTINCT visitor_ip) FILTER (WHERE is_bot = true),
    'botTraffic', COALESCE(SUM(CASE WHEN is_bot = true THEN 1 ELSE 0 END), 0),
    'avgSessionDuration', COALESCE(
      ROUND(AVG(session_duration_seconds) FILTER (WHERE session_duration_seconds > 0 AND COALESCE(is_bot, false) = false)),
      0
    ),
    'affiliateClicks', COALESCE(SUM(CASE WHEN event_type = 'affiliate_click' THEN 1 ELSE 0 END), 0),
    'bannerImpressions', COALESCE(SUM(CASE WHEN event_type = 'banner_impression' THEN 1 ELSE 0 END), 0),
    'newsletterSignups', COALESCE(SUM(CASE WHEN event_type = 'newsletter_signup' THEN 1 ELSE 0 END), 0)
  ) INTO result
  FROM analytics_events
  WHERE created_at >= p_start AND created_at <= p_end;

  RETURN result;
END;
$function$;