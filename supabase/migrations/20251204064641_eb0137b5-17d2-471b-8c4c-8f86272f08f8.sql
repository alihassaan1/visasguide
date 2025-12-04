-- Email campaigns table to track sent newsletters
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  content text,
  sent_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Email opens tracking table
CREATE TABLE IF NOT EXISTS public.email_opens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_email text NOT NULL,
  opened_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address text
);

-- Email clicks tracking table  
CREATE TABLE IF NOT EXISTS public.email_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_email text,
  link_url text,
  clicked_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address text
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_campaigns
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Email campaigns are publicly readable for stats" ON public.email_campaigns
  FOR SELECT USING (true);

-- RLS Policies for email_opens
CREATE POLICY "Admins can view email opens" ON public.email_opens
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert email opens" ON public.email_opens
  FOR INSERT WITH CHECK (true);

-- RLS Policies for email_clicks
CREATE POLICY "Admins can view email clicks" ON public.email_clicks
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert email clicks" ON public.email_clicks
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_opens_campaign_id ON public.email_opens(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_opened_at ON public.email_opens(opened_at);
CREATE INDEX IF NOT EXISTS idx_email_clicks_campaign_id ON public.email_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON public.email_campaigns(sent_at);