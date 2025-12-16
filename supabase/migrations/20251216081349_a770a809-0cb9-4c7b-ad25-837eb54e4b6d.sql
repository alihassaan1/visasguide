-- Create affiliate_programs table to manage program list
CREATE TABLE public.affiliate_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  partner_id text,
  description text,
  logo_url text,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_widgets table for location-specific widgets
CREATE TABLE public.affiliate_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_program text NOT NULL,
  city_id uuid REFERENCES public.cities(id) ON DELETE CASCADE,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE,
  widget_url text NOT NULL,
  widget_type text DEFAULT 'city',
  widget_variant text DEFAULT 'city',
  tour_id text,
  position text DEFAULT 'main-content',
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_widgets ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate_programs
CREATE POLICY "Affiliate programs are publicly readable"
ON public.affiliate_programs FOR SELECT USING (true);

CREATE POLICY "Admins can manage affiliate programs"
ON public.affiliate_programs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for affiliate_widgets
CREATE POLICY "Affiliate widgets are publicly readable"
ON public.affiliate_widgets FOR SELECT USING (true);

CREATE POLICY "Admins can manage affiliate widgets"
ON public.affiliate_widgets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default GetYourGuide program
INSERT INTO public.affiliate_programs (name, slug, partner_id, description, is_active)
VALUES ('GetYourGuide', 'getyourguide', 'WN9V7PZ', 'Tours and activities booking platform', true);

-- Create indexes for faster lookups
CREATE INDEX idx_affiliate_widgets_city ON public.affiliate_widgets(city_id);
CREATE INDEX idx_affiliate_widgets_country ON public.affiliate_widgets(country_id);
CREATE INDEX idx_affiliate_widgets_program ON public.affiliate_widgets(affiliate_program);