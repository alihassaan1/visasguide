UPDATE site_settings 
SET setting_value = setting_value || '{"ga4_id": "G-8HE3239E51"}'::jsonb, updated_at = now()
WHERE setting_key = 'analytics_settings';