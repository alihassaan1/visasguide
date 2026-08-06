CREATE OR REPLACE FUNCTION public.get_traffic_trend(p_start timestamp with time zone, p_end timestamp with time zone, p_granularity text DEFAULT 'daily'::text, p_include_bots boolean DEFAULT false, p_bots_only boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF p_granularity = 'hourly' THEN
    SELECT jsonb_agg(row_to_json(t) ORDER BY t.period)
    INTO result
    FROM (
      SELECT
        to_char(date_trunc('hour', created_at), 'HH24:00') as period,
        SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') THEN 1 ELSE 0 END) as "pageViews",
        SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) as searches
      FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND (p_include_bots OR (CASE WHEN p_bots_only THEN is_bot = true ELSE COALESCE(is_bot, false) = false END))
      GROUP BY date_trunc('hour', created_at)
      ORDER BY date_trunc('hour', created_at)
    ) t;
  ELSIF p_granularity = 'monthly' THEN
    SELECT jsonb_agg(row_to_json(t) ORDER BY t.sort_key)
    INTO result
    FROM (
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YYYY') as period,
        to_char(date_trunc('month', created_at), 'YYYY-MM') as sort_key,
        SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') THEN 1 ELSE 0 END) as "pageViews",
        SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) as searches
      FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND (p_include_bots OR (CASE WHEN p_bots_only THEN is_bot = true ELSE COALESCE(is_bot, false) = false END))
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    ) t;
  ELSE
    SELECT jsonb_agg(row_to_json(t) ORDER BY t.sort_key)
    INTO result
    FROM (
      SELECT
        to_char(created_at::date, 'Mon DD') as period,
        to_char(created_at::date, 'YYYY-MM-DD') as sort_key,
        SUM(CASE WHEN event_type IN ('page_view', 'search_engine_referral') THEN 1 ELSE 0 END) as "pageViews",
        SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) as searches
      FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND (p_include_bots OR (CASE WHEN p_bots_only THEN is_bot = true ELSE COALESCE(is_bot, false) = false END))
      GROUP BY created_at::date
      ORDER BY created_at::date
    ) t;
  END IF;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_analytics_distribution(p_start timestamp with time zone, p_end timestamp with time zone, p_field text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF p_field = 'device_type' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT device_type as name, COUNT(*) as value FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND device_type IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY device_type ORDER BY COUNT(*) DESC) t;
  ELSIF p_field = 'browser_name' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT browser_name as name, COUNT(*) as value FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND browser_name IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY browser_name ORDER BY COUNT(*) DESC LIMIT 6) t;
  ELSIF p_field = 'os_name' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT os_name as name, COUNT(*) as value FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND os_name IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY os_name ORDER BY COUNT(*) DESC) t;
  ELSIF p_field = 'referrer_source' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT COALESCE(referrer_source, 'direct') as name, COUNT(*) as value FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND COALESCE(is_bot,false) = false
      GROUP BY referrer_source ORDER BY COUNT(*) DESC LIMIT 20) t;
  ELSIF p_field = 'device_name' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT device_name as name, device_type as type, COUNT(*) as count FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND device_name IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY device_name, device_type ORDER BY COUNT(*) DESC LIMIT 10) t;
  ELSIF p_field = 'screen_resolution' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT (screen_width || 'x' || screen_height) as resolution, COUNT(*) as count FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND screen_width IS NOT NULL AND screen_height IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY screen_width, screen_height ORDER BY COUNT(*) DESC LIMIT 10) t;
  ELSIF p_field = 'bot_traffic' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT
        CASE
          WHEN lower(user_agent) LIKE '%googlebot%' THEN 'Googlebot'
          WHEN lower(user_agent) LIKE '%bingbot%' THEN 'Bingbot'
          WHEN lower(user_agent) LIKE '%facebookexternalhit%' THEN 'Facebook'
          WHEN lower(user_agent) LIKE '%twitterbot%' THEN 'Twitter'
          WHEN lower(user_agent) LIKE '%linkedinbot%' THEN 'LinkedIn'
          WHEN lower(user_agent) LIKE '%slurp%' THEN 'Yahoo'
          WHEN lower(user_agent) LIKE '%duckduckbot%' THEN 'DuckDuckGo'
          WHEN lower(user_agent) LIKE '%yandex%' THEN 'Yandex'
          WHEN lower(user_agent) LIKE '%baidu%' THEN 'Baidu'
          ELSE 'Other Bot'
        END as name,
        COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND is_bot = true
      GROUP BY 1 ORDER BY COUNT(*) DESC) t;
  ELSIF p_field = 'top_pages' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT page_slug as slug, COUNT(*) as views FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND event_type IN ('page_view', 'search_engine_referral')
        AND page_slug IS NOT NULL AND COALESCE(is_bot,false) = false
      GROUP BY page_slug ORDER BY COUNT(*) DESC LIMIT 20) t;
  ELSIF p_field = 'top_pages_bots' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT page_slug as slug, COUNT(*) as views FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND event_type IN ('page_view', 'search_engine_referral')
        AND page_slug IS NOT NULL AND is_bot = true
      GROUP BY page_slug ORDER BY COUNT(*) DESC LIMIT 20) t;
  ELSIF p_field = 'affiliate_clicks' THEN
    SELECT jsonb_agg(row_to_json(t)) INTO result FROM (
      SELECT search_term as name, COUNT(*) as clicks FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end AND event_type = 'affiliate_click'
      GROUP BY search_term ORDER BY COUNT(*) DESC LIMIT 10) t;
  END IF;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;