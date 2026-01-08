-- Add geo-targeting and scheduling fields to settings_affiliates
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS target_countries TEXT[] DEFAULT '{}';
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS target_page_patterns TEXT[] DEFAULT '{}';
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS exclude_countries TEXT[] DEFAULT '{}';
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE settings_affiliates ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;