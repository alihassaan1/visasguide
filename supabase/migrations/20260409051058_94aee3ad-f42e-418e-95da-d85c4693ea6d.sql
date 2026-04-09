
CREATE OR REPLACE FUNCTION public.increment_banner_impression(p_banner_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.settings_affiliates
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = p_banner_id;
END;
$$;
