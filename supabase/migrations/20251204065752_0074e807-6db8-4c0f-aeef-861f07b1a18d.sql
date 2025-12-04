INSERT INTO site_settings (setting_key, setting_value)
VALUES ('analytics_settings', '{"clarity_id": "ug4ihlhgw9"}'::jsonb)
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = site_settings.setting_value || '{"clarity_id": "ug4ihlhgw9"}'::jsonb, updated_at = now();