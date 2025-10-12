-- Create search_stats table to track country searches and page views
CREATE TABLE IF NOT EXISTS public.search_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  search_count INTEGER NOT NULL DEFAULT 0,
  page_view_count INTEGER NOT NULL DEFAULT 0,
  last_searched TIMESTAMP WITH TIME ZONE,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id)
);

-- Enable RLS
ALTER TABLE public.search_stats ENABLE ROW LEVEL SECURITY;

-- Public read access to search stats
CREATE POLICY "Search stats are publicly readable" 
ON public.search_stats 
FOR SELECT 
USING (true);

-- Allow anonymous increments (we'll use a function for this)
CREATE POLICY "Anyone can update search stats" 
ON public.search_stats 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert search stats" 
ON public.search_stats 
FOR INSERT 
WITH CHECK (true);

-- Function to increment search count
CREATE OR REPLACE FUNCTION public.increment_search_count(p_country_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.search_stats (country_id, search_count, last_searched)
  VALUES (p_country_id, 1, now())
  ON CONFLICT (country_id)
  DO UPDATE SET
    search_count = search_stats.search_count + 1,
    last_searched = now(),
    updated_at = now();
END;
$$;

-- Function to increment page view count
CREATE OR REPLACE FUNCTION public.increment_page_view_count(p_country_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.search_stats (country_id, page_view_count, last_viewed)
  VALUES (p_country_id, 1, now())
  ON CONFLICT (country_id)
  DO UPDATE SET
    page_view_count = search_stats.page_view_count + 1,
    last_viewed = now(),
    updated_at = now();
END;
$$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_search_stats_country_id ON public.search_stats(country_id);
CREATE INDEX IF NOT EXISTS idx_search_stats_search_count ON public.search_stats(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_stats_page_view_count ON public.search_stats(page_view_count DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_search_stats_updated_at
  BEFORE UPDATE ON public.search_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();