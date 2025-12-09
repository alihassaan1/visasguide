-- Unschedule existing content-agent cron jobs that are missing auth
SELECT cron.unschedule('content-agent-ctr');
SELECT cron.unschedule('content-agent-create');
SELECT cron.unschedule('content-agent-visa-enrich');
SELECT cron.unschedule('content-agent-blog');
SELECT cron.unschedule('content-agent-faq');

-- Re-create all content-agent cron jobs WITH proper Authorization headers

-- CTR Optimization: Every hour at :00
SELECT cron.schedule(
  'content-agent-ctr',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"bulkCTR": true, "batchSize": 8}'::jsonb
  ) AS request_id;
  $$
);

-- Content Creation: Every hour at :30
SELECT cron.schedule(
  'content-agent-create',
  '30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"batchSize": 5}'::jsonb
  ) AS request_id;
  $$
);

-- Visa Data Enrichment: Every 2 hours at :15
SELECT cron.schedule(
  'content-agent-visa-enrich',
  '15 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"visaEnrichment": true, "batchSize": 10}'::jsonb
  ) AS request_id;
  $$
);

-- Blog Generation: Daily at 3 AM
SELECT cron.schedule(
  'content-agent-blog',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"blogGeneration": true, "batchSize": 3}'::jsonb
  ) AS request_id;
  $$
);

-- FAQ Generation: Daily at 4 AM
SELECT cron.schedule(
  'content-agent-faq',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"faqGeneration": true, "batchSize": 5}'::jsonb
  ) AS request_id;
  $$
);

-- NEW: Visa Requirements Content (country-to-country): Every 30 minutes (aggressive for 38K+ pages)
SELECT cron.schedule(
  'content-agent-visa-requirements',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://awiytryceqehqapytfgn.supabase.co/functions/v1/content-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aXl0cnljZXFlaHFhcHl0ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTMwMzgsImV4cCI6MjA3MzY4OTAzOH0.aNgn6oNZ3SXYrtXBkmW8JSzFACYRkuFgUam3DVA6Z9I"}'::jsonb,
    body := '{"visaRequirementsContent": true, "batchSize": 25}'::jsonb
  ) AS request_id;
  $$
);