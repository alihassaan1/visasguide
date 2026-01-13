-- Create storage bucket for featured images
INSERT INTO storage.buckets (id, name, public)
VALUES ('featured-images', 'featured-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for public read access
CREATE POLICY "Public read access for featured images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'featured-images');

-- Service role can insert
CREATE POLICY "Service role can upload featured images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'featured-images');

-- Allow authenticated users to upload (for admin panel)
CREATE POLICY "Authenticated users can upload featured images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'featured-images');