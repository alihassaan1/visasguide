CREATE OR REPLACE FUNCTION public.increment_content_page_view(p_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.content_pages
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = p_slug;
$$;

GRANT EXECUTE ON FUNCTION public.increment_content_page_view(text) TO anon, authenticated, service_role;