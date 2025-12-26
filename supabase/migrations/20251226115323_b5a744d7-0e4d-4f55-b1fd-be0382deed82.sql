-- Update analytics_settings to use standardized key names that match what dashboard expects
UPDATE site_settings 
SET setting_value = jsonb_build_object(
  'google_analytics_id', 'G-8HE3239E51',
  'microsoft_clarity_id', 'ug4ihlhgw9',
  'google_tag_manager_id', '',
  'google_adsense_publisher_id', 'ca-pub-7028612619001508',
  'facebook_pixel_id', '',
  'tiktok_pixel_id', '',
  'linkedin_insight_tag', '',
  'twitter_pixel_id', '',
  'pinterest_tag_id', ''
),
updated_at = now()
WHERE setting_key = 'analytics_settings';