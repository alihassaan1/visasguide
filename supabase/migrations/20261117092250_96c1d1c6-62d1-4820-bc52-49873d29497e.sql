ALTER FUNCTION public.log_policy_ddl_drop() SET search_path = public;

DROP POLICY IF EXISTS "Anyone can insert email opens" ON public.email_opens;
DROP POLICY IF EXISTS "Anyone can insert email clicks" ON public.email_clicks;
DROP POLICY IF EXISTS "Anyone can insert marketing clicks" ON public.marketing_clicks;
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "System can insert content events" ON public.content_events;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_log;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (
  is_active = true
  AND length(email) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(name) BETWEEN 1 AND 100
  AND (country_of_interest IS NULL OR length(country_of_interest) <= 100)
);

DROP POLICY IF EXISTS "Search stats are publicly readable" ON public.search_stats;
CREATE POLICY "Search stats are publicly readable" ON public.search_stats
FOR SELECT TO anon, authenticated USING (country_id IS NOT NULL);

DROP POLICY IF EXISTS "Affiliates are publicly readable" ON public.settings_affiliates;
CREATE POLICY "Active affiliates are publicly readable" ON public.settings_affiliates
FOR SELECT TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "GSC index status publicly readable" ON public.gsc_url_index_status;
CREATE POLICY "Admins can read GSC index status" ON public.gsc_url_index_status
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));