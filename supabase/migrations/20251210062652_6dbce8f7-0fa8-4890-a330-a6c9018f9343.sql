-- Create authors table with unique profiles
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Content Writer',
  expertise TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  articles_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Authors are publicly readable
CREATE POLICY "Authors are publicly readable"
ON public.authors
FOR SELECT
USING (true);

-- Admins can manage authors
CREATE POLICY "Admins can manage authors"
ON public.authors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add author_id to content_pages and news_articles (nullable, references authors)
ALTER TABLE public.content_pages ADD COLUMN IF NOT EXISTS writer_id UUID REFERENCES public.authors(id);
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS writer_id UUID REFERENCES public.authors(id);

-- Insert initial author profiles
INSERT INTO public.authors (name, slug, bio, role, expertise) VALUES
('Sarah Mitchell', 'sarah-mitchell', 'Sarah is a travel journalist with over 10 years of experience covering visa regulations and immigration policies worldwide. She has visited 45+ countries and specializes in helping travelers navigate complex visa requirements.', 'Senior Travel Editor', ARRAY['Visa Regulations', 'Immigration Policy', 'Travel Planning']),
('James Chen', 'james-chen', 'James brings his background in international law to make visa information accessible to everyone. Based in Singapore, he covers Asia-Pacific travel extensively and has helped thousands of travelers plan their journeys.', 'Visa Policy Analyst', ARRAY['Asian Travel', 'Business Visas', 'Immigration Law']),
('Elena Rodriguez', 'elena-rodriguez', 'Elena is a former consular officer turned travel writer. Her insider knowledge of visa processing helps readers understand what really happens behind the scenes at embassies and consulates.', 'Immigration Correspondent', ARRAY['Consular Procedures', 'Schengen Visas', 'European Travel']),
('Michael Thompson', 'michael-thompson', 'Michael has been writing about international travel for 8 years. He focuses on making complicated visa processes simple and has a knack for finding the fastest routes to approval.', 'Travel Documentation Expert', ARRAY['Document Requirements', 'Express Processing', 'Travel Insurance']),
('Priya Sharma', 'priya-sharma', 'Priya combines her passion for travel with deep research skills to bring you the most up-to-date visa information. She specializes in South Asian travel corridors and digital nomad visas.', 'Digital Nomad Specialist', ARRAY['Remote Work Visas', 'South Asian Travel', 'Long-term Stays']);

-- Create index for faster lookups
CREATE INDEX idx_authors_slug ON public.authors(slug);
CREATE INDEX idx_content_pages_writer_id ON public.content_pages(writer_id);
CREATE INDEX idx_news_articles_writer_id ON public.news_articles(writer_id);