-- Create countries table for visa and passport information
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- ISO country code (US, GB, etc.)
  flag_emoji TEXT,
  continent TEXT,
  region TEXT,
  passport_rank INTEGER,
  passport_score INTEGER,
  visa_free_destinations INTEGER,
  capital TEXT,
  population BIGINT,
  currency TEXT,
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visa requirements table
CREATE TABLE public.visa_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  to_country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL, -- 'visa_free', 'visa_on_arrival', 'visa_required', 'eTA_required'
  max_stay_days INTEGER,
  processing_time_days INTEGER,
  fee_usd DECIMAL(10,2),
  requirements TEXT[], -- Array of document requirements
  notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_country_id, to_country_id)
);

-- Create news articles table for Feedspot integration
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  slug TEXT NOT NULL UNIQUE,
  source_url TEXT,
  source_name TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  categories TEXT[],
  tags TEXT[],
  featured_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guides table for comprehensive visa guides
CREATE TABLE public.guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  guide_type TEXT NOT NULL, -- 'visa_guide', 'passport_guide', 'travel_guide'
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  read_time_minutes INTEGER,
  is_featured BOOLEAN DEFAULT false,
  featured_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processing times table for real-time updates
CREATE TABLE public.processing_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  visa_type TEXT NOT NULL,
  processing_time_days INTEGER NOT NULL,
  embassy_location TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT,
  UNIQUE(country_id, visa_type, embassy_location)
);

-- Create indexes for better performance
CREATE INDEX idx_countries_code ON public.countries(code);
CREATE INDEX idx_countries_passport_rank ON public.countries(passport_rank);
CREATE INDEX idx_visa_requirements_from_country ON public.visa_requirements(from_country_id);
CREATE INDEX idx_visa_requirements_to_country ON public.visa_requirements(to_country_id);
CREATE INDEX idx_news_articles_published ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_featured ON public.news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_guides_country ON public.guides(country_id);
CREATE INDEX idx_guides_type ON public.guides(guide_type);
CREATE INDEX idx_guides_published ON public.guides(published_at DESC);
CREATE INDEX idx_processing_times_country ON public.processing_times(country_id);

-- Enable Row Level Security (make data publicly readable for SEO)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_times ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (good for SEO)
CREATE POLICY "Countries are publicly readable" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Visa requirements are publicly readable" ON public.visa_requirements FOR SELECT USING (true);
CREATE POLICY "Published news articles are publicly readable" ON public.news_articles FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Published guides are publicly readable" ON public.guides FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Processing times are publicly readable" ON public.processing_times FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visa_requirements_updated_at BEFORE UPDATE ON public.visa_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();