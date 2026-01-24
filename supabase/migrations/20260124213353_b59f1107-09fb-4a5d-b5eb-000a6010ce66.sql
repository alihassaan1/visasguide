-- Create table to store Google Search Console performance data
CREATE TABLE public.gsc_search_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  page_slug TEXT,
  query TEXT,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  avg_position DECIMAL(5,2) DEFAULT 0,
  device TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_url, query, date, device, country)
);

-- Create indexes for efficient querying
CREATE INDEX idx_gsc_page_slug ON public.gsc_search_performance(page_slug);
CREATE INDEX idx_gsc_date ON public.gsc_search_performance(date);
CREATE INDEX idx_gsc_position ON public.gsc_search_performance(avg_position);
CREATE INDEX idx_gsc_impressions ON public.gsc_search_performance(impressions DESC);

-- Create aggregated view for page-level metrics
CREATE TABLE public.gsc_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  rows_fetched INTEGER DEFAULT 0,
  rows_inserted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.gsc_search_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_sync_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read GSC data"
ON public.gsc_search_performance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read sync log"
ON public.gsc_sync_log FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role to manage GSC data"
ON public.gsc_search_performance FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to manage sync log"
ON public.gsc_sync_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);