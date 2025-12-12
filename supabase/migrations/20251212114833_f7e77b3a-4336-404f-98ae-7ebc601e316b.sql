-- Create cron job to generate remaining guides every 5 minutes until complete
SELECT cron.schedule(
  'generate-guide-content',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/generate-guide-content',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"batchSize": 2}'::jsonb
  ) AS request_id;
  $$
);