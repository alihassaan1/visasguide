
-- 1. Remove overly-permissive public SELECT on email_campaigns
DROP POLICY IF EXISTS "Email campaigns are publicly readable for stats" ON public.email_campaigns;

-- Admins can already manage (existing "Admins can manage email campaigns" policy covers SELECT).

-- 2. Remove overly-permissive public SELECT on site_settings
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

-- Admins can already manage via existing "Admins can manage site settings" policy.

-- 3. Fix content-images bucket: restrict write policies from public role to service_role
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete" ON storage.objects;

CREATE POLICY "Service role can upload content images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'content-images');

CREATE POLICY "Service role can update content images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'content-images');

CREATE POLICY "Service role can delete content images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'content-images');

-- Also allow admin users to manage content images from the admin UI
CREATE POLICY "Admins can upload content images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

-- 4. Featured-images: restrict INSERT to admins only
DROP POLICY IF EXISTS "Authenticated users can upload featured images" ON storage.objects;

CREATE POLICY "Admins can upload featured images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'featured-images' AND public.has_role(auth.uid(), 'admin'));
