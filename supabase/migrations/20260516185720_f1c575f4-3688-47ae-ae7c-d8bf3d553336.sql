CREATE TABLE IF NOT EXISTS public.gsc_url_index_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL UNIQUE,
  verdict text,
  coverage_state text,
  indexing_state text,
  last_crawl_time timestamptz,
  page_fetch_state text,
  robots_txt_state text,
  referring_urls text[],
  sitemap text[],
  google_canonical text,
  user_canonical text,
  raw_response jsonb,
  inspected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gsc_url_index_status_verdict ON public.gsc_url_index_status(verdict);
CREATE INDEX IF NOT EXISTS idx_gsc_url_index_status_coverage ON public.gsc_url_index_status(coverage_state);
CREATE INDEX IF NOT EXISTS idx_gsc_url_index_status_inspected ON public.gsc_url_index_status(inspected_at);

ALTER TABLE public.gsc_url_index_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GSC index status publicly readable"
  ON public.gsc_url_index_status FOR SELECT
  USING (true);

CREATE POLICY "Service role manages GSC index status"
  ON public.gsc_url_index_status FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_gsc_url_index_status_updated_at
  BEFORE UPDATE ON public.gsc_url_index_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();