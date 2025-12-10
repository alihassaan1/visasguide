-- Create RPC function to increment email opens
CREATE OR REPLACE FUNCTION increment_email_opens(p_campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE email_campaigns
  SET opened_count = COALESCE(opened_count, 0) + 1
  WHERE id = p_campaign_id;
END;
$$;

-- Create RPC function to increment email clicks
CREATE OR REPLACE FUNCTION increment_email_clicks(p_campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE email_campaigns
  SET clicked_count = COALESCE(clicked_count, 0) + 1
  WHERE id = p_campaign_id;
END;
$$;