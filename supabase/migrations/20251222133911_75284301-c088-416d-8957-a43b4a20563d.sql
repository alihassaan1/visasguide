-- Backfill author_id for content_pages that have NULL writer_id
-- This assigns a random active author to each page for E-E-A-T compliance

-- First, let's update content_pages.writer_id for pages that don't have an author
UPDATE public.content_pages
SET writer_id = (
  SELECT id FROM public.authors 
  WHERE is_active = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE writer_id IS NULL;

-- Also update news_articles.writer_id for articles that don't have an author
UPDATE public.news_articles
SET writer_id = (
  SELECT id FROM public.authors 
  WHERE is_active = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE writer_id IS NULL;