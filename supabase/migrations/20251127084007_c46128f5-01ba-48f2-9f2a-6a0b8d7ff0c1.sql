-- Schedule content agent to run automatically every hour
SELECT cron.schedule(
  'content-agent-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);