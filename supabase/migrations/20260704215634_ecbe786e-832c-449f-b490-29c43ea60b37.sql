
ALTER TABLE public.content_pages
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_content_pages_featured
  ON public.content_pages (is_featured, featured_at DESC)
  WHERE is_featured = true;

-- Clear the duplicate placeholder image so the image generator will refill them
UPDATE public.content_pages
SET featured_image_url = NULL
WHERE featured_image_url = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80';
