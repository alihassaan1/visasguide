-- Update content-images bucket to allow XML uploads
UPDATE storage.buckets
SET allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/xml', 'text/xml']
WHERE id = 'content-images';