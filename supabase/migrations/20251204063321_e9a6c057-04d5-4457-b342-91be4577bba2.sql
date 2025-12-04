-- Add device/browser/screen analytics columns to analytics_events
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device_name text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS browser_name text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS browser_version text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS os_name text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS os_version text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS screen_width integer;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS screen_height integer;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_browser_name ON analytics_events(browser_name);
CREATE INDEX IF NOT EXISTS idx_analytics_is_bot ON analytics_events(is_bot);