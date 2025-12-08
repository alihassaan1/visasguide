-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule RSS feed fetching every 10 minutes
SELECT cron.schedule(
  'rss-feed-fetcher',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/rss-fetcher',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
      body := '{"automated": true}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule RSS content processing every 5 minutes
SELECT cron.schedule(
  'rss-content-processor',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/rss-content-processor',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
      body := '{"automated": true, "batchSize": 5}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule daily cleanup of old processed queue items (older than 30 days)
SELECT cron.schedule(
  'rss-queue-cleanup',
  '0 3 * * *',
  $$
  DELETE FROM public.rss_article_queue 
  WHERE status IN ('published', 'duplicate', 'rejected') 
  AND created_at < NOW() - INTERVAL '30 days';
  $$
);