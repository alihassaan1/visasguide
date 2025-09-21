-- Create RSS feeds table
CREATE TABLE public.rss_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

-- Create policies for RSS feeds (public read, admin manage)
CREATE POLICY "RSS feeds are publicly readable" 
ON public.rss_feeds 
FOR SELECT 
USING (true);

-- Create admin users table for content management
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add source_type to news_articles to track RSS vs manual articles
ALTER TABLE public.news_articles 
ADD COLUMN source_type TEXT DEFAULT 'manual',
ADD COLUMN original_url TEXT,
ADD COLUMN rss_feed_id UUID;

-- Create foreign key for RSS feed relationship
ALTER TABLE public.news_articles 
ADD CONSTRAINT fk_news_articles_rss_feed 
FOREIGN KEY (rss_feed_id) REFERENCES public.rss_feeds(id) ON DELETE SET NULL;

-- Create trigger for RSS feeds updated_at
CREATE TRIGGER update_rss_feeds_updated_at
BEFORE UPDATE ON public.rss_feeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample RSS feeds for visa/immigration news
INSERT INTO public.rss_feeds (name, url, category) VALUES
  ('USCIS News', 'https://www.uscis.gov/rss/news', 'Immigration News'),
  ('UK Gov Immigration', 'https://www.gov.uk/government/publications.rss?departments%5B%5D=uk-visas-and-immigration', 'Visa Updates'),
  ('Canada Immigration News', 'https://www.canada.ca/en/services/immigration-citizenship.rss', 'Policy Changes'),
  ('Australia Immigration', 'https://www.homeaffairs.gov.au/rss/rss.xml', 'Border Updates');

-- Insert some sample news articles for testing
INSERT INTO public.news_articles (
  title, slug, excerpt, content, categories, tags, author, published_at, source_type, seo_title, seo_description
) VALUES 
  (
    'New Student Visa Requirements for Germany 2024',
    'germany-student-visa-requirements-2024',
    'Germany introduces updated student visa requirements affecting international applicants starting January 2024.',
    '<h2>Overview of Changes</h2><p>Germany has announced significant changes to its student visa application process, affecting thousands of international students planning to study in the country. The new requirements aim to streamline the application process while ensuring proper documentation.</p><h2>Key Requirements</h2><ul><li>Enhanced financial proof requirements</li><li>Updated health insurance documentation</li><li>Academic qualification verification</li><li>Language proficiency updates</li></ul><h2>Implementation Timeline</h2><p>These changes will be implemented gradually throughout 2024, with full enforcement beginning in March 2024.</p>',
    ARRAY['Visa Updates', 'Policy Changes'],
    ARRAY['Germany', 'Student Visa', '2024', 'Requirements'],
    'Visa Guide Editorial Team',
    NOW() - INTERVAL '2 days',
    'manual',
    'Germany Student Visa Requirements 2024 - Complete Guide',
    'Complete guide to new German student visa requirements for 2024. Updated documentation, financial proof, and application process changes for international students.'
  ),
  (
    'Australia Introduces Fast-Track Visa Processing for Skilled Workers',
    'australia-fast-track-visa-skilled-workers',
    'Australia launches expedited processing for skilled worker visas to address labor shortages in key industries.',
    '<h2>Fast-Track Program Overview</h2><p>Australia has introduced a new fast-track processing system for skilled worker visas to address critical labor shortages across various industries. This initiative aims to reduce processing times from months to weeks for eligible applicants.</p><h2>Eligible Occupations</h2><ul><li>Healthcare professionals</li><li>IT specialists</li><li>Engineers</li><li>Teachers</li><li>Tradespeople</li></ul><h2>Processing Times</h2><p>The new system promises processing times of 2-4 weeks for complete applications, compared to the previous 6-12 month timeframe.</p>',
    ARRAY['Immigration News', 'Processing Times'],
    ARRAY['Australia', 'Skilled Worker', 'Fast Track', 'Processing'],
    'Immigration News Team',
    NOW() - INTERVAL '1 day',
    'manual',
    'Australia Fast-Track Skilled Worker Visa Processing 2024',
    'Australia introduces fast-track visa processing for skilled workers. Learn about eligible occupations, reduced processing times, and application requirements.'
  ),
  (
    'UK Post-Study Work Visa Extension Announced',
    'uk-post-study-work-visa-extension-2024',
    'The UK government extends the post-study work visa duration for international graduates from top universities.',
    '<h2>Extension Details</h2><p>The UK government has announced an extension to the post-study work visa program, allowing international graduates from designated universities to work in the UK for up to 3 years after graduation, up from the previous 2-year limit.</p><h2>Eligible Universities</h2><p>The extension applies to graduates from universities ranked in the top 50 globally, as determined by major university ranking systems.</p><h2>Application Process</h2><ul><li>Online application system</li><li>Document verification required</li><li>Processing fee of £715</li><li>Decision within 8 weeks</li></ul>',
    ARRAY['Visa Updates', 'Policy Changes'],
    ARRAY['UK', 'Post Study', 'Work Visa', 'Extension'],
    'UK Immigration Correspondent',
    NOW() - INTERVAL '3 hours',
    'manual',
    'UK Post-Study Work Visa Extended to 3 Years - 2024 Update',
    'UK extends post-study work visa to 3 years for top university graduates. Complete details on eligibility, application process, and requirements.'
  );

-- Enable realtime for news_articles table
ALTER TABLE public.news_articles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.news_articles;

-- Enable realtime for rss_feeds table  
ALTER TABLE public.rss_feeds REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rss_feeds;