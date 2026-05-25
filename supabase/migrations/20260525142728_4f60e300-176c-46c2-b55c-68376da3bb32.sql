CREATE OR REPLACE FUNCTION public.increment_affiliate_click(p_banner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.settings_affiliates
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_banner_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_affiliate_click(uuid) TO anon, authenticated;