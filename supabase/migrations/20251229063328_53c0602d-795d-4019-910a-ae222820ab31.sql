-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content-images');

-- Create policy for service role uploads
CREATE POLICY "Service role can upload" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'content-images');

-- Create policy for service role updates
CREATE POLICY "Service role can update" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'content-images');

-- Create policy for service role deletes
CREATE POLICY "Service role can delete" ON storage.objects 
FOR DELETE 
USING (bucket_id = 'content-images');