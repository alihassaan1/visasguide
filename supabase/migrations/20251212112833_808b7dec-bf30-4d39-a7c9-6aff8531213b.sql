UPDATE site_settings 
SET setting_value = '{"key": "sk-fb99313113ea4221978dad6cfc4ad295"}'::jsonb, updated_at = now()
WHERE setting_key = 'deepseek_api_key';