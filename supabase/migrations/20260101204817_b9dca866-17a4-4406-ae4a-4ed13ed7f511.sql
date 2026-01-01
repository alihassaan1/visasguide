
-- Update visa requirements cron job: Run every 10 minutes with batch size 50 (was 30 min, batch 25)
SELECT cron.unschedule(16);

SELECT cron.schedule(
  'content-agent-visa-requirements',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"visaRequirementsContent": true, "batchSize": 50}'::jsonb
  ) AS request_id;
  $$
);

-- Also update the CTR job to run every 30 minutes instead of hourly
SELECT cron.unschedule(11);

SELECT cron.schedule(
  'content-agent-ctr',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"bulkCTR": true, "batchSize": 15}'::jsonb
  ) AS request_id;
  $$
);

-- Update visa enrichment to run hourly with larger batch
SELECT cron.unschedule(13);

SELECT cron.schedule(
  'content-agent-visa-enrich',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"visaEnrichment": true, "batchSize": 20}'::jsonb
  ) AS request_id;
  $$
);
