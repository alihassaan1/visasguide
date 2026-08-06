CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE INDEX IF NOT EXISTS idx_content_pages_created_at_desc ON public.content_pages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_title_trgm ON public.content_pages USING gin (title public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug_trgm ON public.content_pages USING gin (slug public.gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.get_content_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'published', COUNT(*) FILTER (WHERE is_published),
    'views', COALESCE(SUM(view_count), 0)
  )
  FROM public.content_pages;
$$;

REVOKE EXECUTE ON FUNCTION public.get_content_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_content_stats() TO authenticated, service_role;