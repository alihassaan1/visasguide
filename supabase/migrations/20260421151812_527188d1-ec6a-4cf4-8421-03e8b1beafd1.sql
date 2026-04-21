-- Enums for policy change classification
CREATE TYPE public.visa_policy_change_type AS ENUM (
  'visa_free_added',
  'visa_free_removed',
  'evisa_launched',
  'fee_change',
  'processing_time_change',
  'entry_ban',
  'requirement_change',
  'policy_announcement'
);

CREATE TYPE public.visa_policy_severity AS ENUM (
  'info',
  'update',
  'warning',
  'critical'
);

CREATE TYPE public.visa_policy_source_type AS ENUM (
  'official',
  'news',
  'manual'
);

-- Main table
CREATE TABLE public.visa_policy_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  affected_country_ids UUID[] DEFAULT NULL,
  change_type public.visa_policy_change_type NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_description TEXT,
  effective_date DATE,
  announcement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity public.visa_policy_severity NOT NULL DEFAULT 'info',
  source_url TEXT,
  source_name TEXT,
  source_type public.visa_policy_source_type NOT NULL DEFAULT 'manual',
  news_article_id UUID REFERENCES public.news_articles(id) ON DELETE SET NULL,
  rss_queue_id UUID REFERENCES public.rss_article_queue(id) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_vpc_country_id ON public.visa_policy_changes(country_id);
CREATE INDEX idx_vpc_effective_date ON public.visa_policy_changes(effective_date DESC NULLS LAST);
CREATE INDEX idx_vpc_announcement_date ON public.visa_policy_changes(announcement_date DESC);
CREATE INDEX idx_vpc_change_type ON public.visa_policy_changes(change_type);
CREATE INDEX idx_vpc_severity ON public.visa_policy_changes(severity);
CREATE INDEX idx_vpc_published ON public.visa_policy_changes(is_published, published_at DESC);
CREATE INDEX idx_vpc_affected_countries ON public.visa_policy_changes USING GIN(affected_country_ids);

-- Enable RLS
ALTER TABLE public.visa_policy_changes ENABLE ROW LEVEL SECURITY;

-- Public can read published changes
CREATE POLICY "Published policy changes are publicly readable"
ON public.visa_policy_changes
FOR SELECT
USING (is_published = true);

-- Admins full access
CREATE POLICY "Admins can manage all policy changes"
ON public.visa_policy_changes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System inserts (edge functions using service role bypass RLS, but allow anon insert as fallback)
CREATE POLICY "System can insert policy changes"
ON public.visa_policy_changes
FOR INSERT
WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_visa_policy_changes_updated_at
BEFORE UPDATE ON public.visa_policy_changes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();