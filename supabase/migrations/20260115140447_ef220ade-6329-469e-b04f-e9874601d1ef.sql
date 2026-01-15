-- Add scheduled_at column to content_pages for scheduled publishing
ALTER TABLE public.content_pages 
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL;

-- Add index for efficient scheduled publishing queries
CREATE INDEX IF NOT EXISTS idx_content_pages_scheduled 
ON public.content_pages (scheduled_at) 
WHERE scheduled_at IS NOT NULL AND is_published = false;

-- Add comment for documentation
COMMENT ON COLUMN public.content_pages.scheduled_at IS 'When set, the page will be automatically published at this time';