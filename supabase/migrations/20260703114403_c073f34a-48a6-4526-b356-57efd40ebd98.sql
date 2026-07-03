
-- Allow public read of specific non-sensitive site settings so the frontend
-- can inject analytics/tracking scripts for anonymous visitors.
GRANT SELECT ON public.site_settings TO anon, authenticated;

CREATE POLICY "Public can read public site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (setting_key IN (
  'analytics_settings',
  'adsense_code',
  'gdpr_consent_code',
  'site_metadata',
  'seo_settings',
  'monetization_settings',
  'social_links',
  'affiliate_settings'
));
