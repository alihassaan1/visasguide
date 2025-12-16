-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  hero_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  attractions TEXT[] DEFAULT '{}',
  population BIGINT,
  is_capital BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for country lookups
CREATE INDEX idx_cities_country_id ON public.cities(country_id);
CREATE INDEX idx_cities_slug ON public.cities(slug);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Cities are publicly readable" 
ON public.cities 
FOR SELECT 
USING (true);

-- Admin management
CREATE POLICY "Admins can manage cities" 
ON public.cities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to increment city view count
CREATE OR REPLACE FUNCTION public.increment_city_view_count(p_city_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.cities
  SET view_count = view_count + 1
  WHERE id = p_city_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();