-- Create rss_article_queue table to track processing status of fetched articles
CREATE TABLE public.rss_article_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rss_feed_id uuid REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  original_title text NOT NULL,
  original_content text,
  original_image_url text,
  source_name text,
  source_author text,
  original_pub_date timestamp with time zone,
  status text NOT NULL DEFAULT 'pending',
  rewritten_title text,
  rewritten_content text,
  generated_image_url text,
  seo_title text,
  seo_description text,
  excerpt text,
  extracted_tags text[],
  extracted_country text,
  extracted_visa_type text,
  similarity_score float,
  error_message text,
  retry_count integer DEFAULT 0,
  news_article_id uuid REFERENCES public.news_articles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  published_at timestamp with time zone,
  CONSTRAINT unique_original_url UNIQUE (original_url)
);

-- Create index for status queries
CREATE INDEX idx_rss_article_queue_status ON public.rss_article_queue(status);
CREATE INDEX idx_rss_article_queue_created_at ON public.rss_article_queue(created_at DESC);
CREATE INDEX idx_rss_article_queue_feed_id ON public.rss_article_queue(rss_feed_id);

-- Enable RLS
ALTER TABLE public.rss_article_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage article queue"
ON public.rss_article_queue
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view article queue"
ON public.rss_article_queue
FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Add fetch_interval and auto_publish to rss_feeds if not exists
ALTER TABLE public.rss_feeds ADD COLUMN IF NOT EXISTS fetch_interval_minutes integer DEFAULT 10;
ALTER TABLE public.rss_feeds ADD COLUMN IF NOT EXISTS auto_publish boolean DEFAULT true;
ALTER TABLE public.rss_feeds ADD COLUMN IF NOT EXISTS articles_fetched integer DEFAULT 0;
ALTER TABLE public.rss_feeds ADD COLUMN IF NOT EXISTS last_error text;