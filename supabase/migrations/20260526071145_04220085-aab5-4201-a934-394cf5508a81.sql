CREATE TABLE public.etias_country_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_slug text NOT NULL UNIQUE,
  country_name text NOT NULL,
  nationality text NOT NULL,
  intro text,
  who_qualifies text,
  special_notes text,
  processing_details text,
  faqs jsonb DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  featured_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.etias_country_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published ETIAS country pages are publicly readable"
ON public.etias_country_pages FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage ETIAS country pages"
ON public.etias_country_pages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_etias_country_pages_updated_at
BEFORE UPDATE ON public.etias_country_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_etias_country_pages_slug ON public.etias_country_pages(country_slug);
CREATE INDEX idx_etias_country_pages_published ON public.etias_country_pages(is_published, published_at DESC);