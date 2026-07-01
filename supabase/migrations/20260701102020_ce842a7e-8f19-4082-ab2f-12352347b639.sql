
CREATE OR REPLACE FUNCTION public.get_bot_traffic_breakdown(p_start timestamptz, p_end timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(t) ORDER BY t.hits DESC)
  INTO result
  FROM (
    SELECT
      bot AS name,
      category,
      COUNT(*) AS hits,
      COUNT(DISTINCT visitor_ip) AS unique_ips,
      MAX(created_at) AS last_seen
    FROM (
      SELECT
        created_at,
        visitor_ip,
        CASE
          WHEN user_agent ILIKE '%googlebot-image%' THEN 'Googlebot-Image'
          WHEN user_agent ILIKE '%googlebot-news%' THEN 'Googlebot-News'
          WHEN user_agent ILIKE '%googlebot-video%' THEN 'Googlebot-Video'
          WHEN user_agent ILIKE '%googlebot%' THEN 'Googlebot'
          WHEN user_agent ILIKE '%google-inspectiontool%' THEN 'Google-InspectionTool'
          WHEN user_agent ILIKE '%adsbot-google%' THEN 'AdsBot-Google'
          WHEN user_agent ILIKE '%google-extended%' THEN 'Google-Extended (Gemini)'
          WHEN user_agent ILIKE '%googleother%' THEN 'GoogleOther'
          WHEN user_agent ILIKE '%bingbot%' THEN 'Bingbot'
          WHEN user_agent ILIKE '%oai-searchbot%' THEN 'OAI-SearchBot'
          WHEN user_agent ILIKE '%gptbot%' THEN 'GPTBot (OpenAI)'
          WHEN user_agent ILIKE '%chatgpt-user%' THEN 'ChatGPT-User'
          WHEN user_agent ILIKE '%claudebot%' OR user_agent ILIKE '%claude-web%' OR user_agent ILIKE '%anthropic%' THEN 'ClaudeBot (Anthropic)'
          WHEN user_agent ILIKE '%perplexity%' THEN 'PerplexityBot'
          WHEN user_agent ILIKE '%applebot-extended%' THEN 'Applebot-Extended'
          WHEN user_agent ILIKE '%applebot%' THEN 'Applebot'
          WHEN user_agent ILIKE '%bytespider%' THEN 'Bytespider (ByteDance)'
          WHEN user_agent ILIKE '%amazonbot%' THEN 'Amazonbot'
          WHEN user_agent ILIKE '%meta-external%' OR user_agent ILIKE '%facebookbot%' THEN 'Meta / Facebook'
          WHEN user_agent ILIKE '%ccbot%' THEN 'CCBot (Common Crawl)'
          WHEN user_agent ILIKE '%duckduck%' THEN 'DuckDuckBot'
          WHEN user_agent ILIKE '%yandex%' THEN 'YandexBot'
          WHEN user_agent ILIKE '%baidu%' THEN 'Baiduspider'
          WHEN user_agent ILIKE '%sogou%' THEN 'Sogou'
          WHEN user_agent ILIKE '%yisou%' THEN 'YisouSpider'
          WHEN user_agent ILIKE '%petal%' THEN 'PetalBot (Huawei)'
          WHEN user_agent ILIKE '%seznam%' THEN 'SeznamBot'
          WHEN user_agent ILIKE '%yeti%' OR user_agent ILIKE '%naver%' THEN 'NaverBot'
          WHEN user_agent ILIKE '%qwant%' THEN 'Qwantify'
          WHEN user_agent ILIKE '%kagi%' THEN 'Kagibot'
          WHEN user_agent ILIKE '%youbot%' THEN 'YouBot'
          WHEN user_agent ILIKE '%mistral%' THEN 'MistralAI'
          WHEN user_agent ILIKE '%cohere%' THEN 'Cohere'
          WHEN user_agent ILIKE '%diffbot%' THEN 'Diffbot'
          WHEN user_agent ILIKE '%ahrefs%' THEN 'AhrefsBot'
          WHEN user_agent ILIKE '%semrush%' THEN 'SemrushBot'
          WHEN user_agent ILIKE '%mj12%' THEN 'MJ12bot'
          WHEN user_agent ILIKE '%dotbot%' THEN 'DotBot'
          WHEN user_agent ILIKE '%linkedinbot%' THEN 'LinkedInBot'
          WHEN user_agent ILIKE '%twitterbot%' THEN 'Twitterbot'
          WHEN user_agent ILIKE '%slackbot%' THEN 'Slackbot'
          WHEN user_agent ILIKE '%telegrambot%' THEN 'TelegramBot'
          WHEN user_agent ILIKE '%whatsapp%' THEN 'WhatsApp'
          WHEN user_agent ILIKE '%bot%' OR user_agent ILIKE '%crawler%' OR user_agent ILIKE '%spider%' THEN 'Other bot'
          ELSE NULL
        END AS bot,
        CASE
          WHEN user_agent ILIKE '%googlebot%' OR user_agent ILIKE '%bingbot%' OR user_agent ILIKE '%duckduck%'
            OR user_agent ILIKE '%yandex%' OR user_agent ILIKE '%baidu%' OR user_agent ILIKE '%sogou%'
            OR user_agent ILIKE '%yisou%' OR user_agent ILIKE '%petal%' OR user_agent ILIKE '%seznam%'
            OR user_agent ILIKE '%yeti%' OR user_agent ILIKE '%naver%' OR user_agent ILIKE '%qwant%'
            OR user_agent ILIKE '%kagi%' OR user_agent ILIKE '%adsbot-google%' OR user_agent ILIKE '%google-inspectiontool%'
            OR user_agent ILIKE '%googleother%'
            THEN 'Search engine'
          WHEN user_agent ILIKE '%gptbot%' OR user_agent ILIKE '%oai-searchbot%' OR user_agent ILIKE '%chatgpt%'
            OR user_agent ILIKE '%claude%' OR user_agent ILIKE '%anthropic%' OR user_agent ILIKE '%perplexity%'
            OR user_agent ILIKE '%google-extended%' OR user_agent ILIKE '%applebot%' OR user_agent ILIKE '%bytespider%'
            OR user_agent ILIKE '%amazonbot%' OR user_agent ILIKE '%meta-external%' OR user_agent ILIKE '%ccbot%'
            OR user_agent ILIKE '%youbot%' OR user_agent ILIKE '%mistral%' OR user_agent ILIKE '%cohere%'
            OR user_agent ILIKE '%diffbot%'
            THEN 'AI crawler'
          WHEN user_agent ILIKE '%ahrefs%' OR user_agent ILIKE '%semrush%' OR user_agent ILIKE '%mj12%'
            OR user_agent ILIKE '%dotbot%'
            THEN 'SEO tool'
          WHEN user_agent ILIKE '%facebookbot%' OR user_agent ILIKE '%linkedinbot%' OR user_agent ILIKE '%twitterbot%'
            OR user_agent ILIKE '%slackbot%' OR user_agent ILIKE '%telegrambot%' OR user_agent ILIKE '%whatsapp%'
            THEN 'Social / Messaging'
          ELSE 'Other'
        END AS category
      FROM analytics_events
      WHERE created_at >= p_start AND created_at <= p_end
        AND user_agent IS NOT NULL
    ) sub
    WHERE bot IS NOT NULL
    GROUP BY bot, category
  ) t;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_bot_traffic_breakdown(timestamptz, timestamptz) TO anon, authenticated, service_role;
