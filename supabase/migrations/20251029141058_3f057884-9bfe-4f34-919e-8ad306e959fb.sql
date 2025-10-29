-- Create analytics events table for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'search', 'page_view', 'search_engine_referral'
  from_country_id UUID REFERENCES public.countries(id),
  to_country_id UUID REFERENCES public.countries(id),
  page_slug TEXT,
  search_term TEXT,
  referrer_source TEXT, -- 'google', 'bing', 'yahoo', 'direct', etc.
  search_engine_query TEXT,
  visitor_ip TEXT,
  visitor_location JSONB, -- {country, city, region}
  user_agent TEXT,
  session_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all analytics
CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_from_country ON public.analytics_events(from_country_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_to_country ON public.analytics_events(to_country_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_slug ON public.analytics_events(page_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_referrer ON public.analytics_events(referrer_source);