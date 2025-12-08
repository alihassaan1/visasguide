-- Create platform_accounts table for storing Meta credentials
CREATE TABLE public.platform_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    account_name TEXT NOT NULL,
    account_id TEXT,
    access_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_posts table for tracking all social media posts
CREATE TABLE public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    platform_account_id UUID REFERENCES public.platform_accounts(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'country_guide', 'visa_requirements', 'news', 'infographic')),
    content_page_id UUID REFERENCES public.content_pages(id) ON DELETE SET NULL,
    news_article_id UUID REFERENCES public.news_articles(id) ON DELETE SET NULL,
    caption TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    image_url TEXT,
    tracked_url TEXT,
    short_url TEXT,
    post_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'publishing', 'published', 'failed', 'retrying')),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_count INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    cooldown_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_events table for tracking content changes
CREATE TABLE public.content_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'published')),
    content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'country_guide', 'news', 'visa_requirements')),
    content_page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE,
    news_article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    featured_image_url TEXT,
    processed BOOLEAN NOT NULL DEFAULT false,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    social_post_ids UUID[] DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_clicks table for tracking social media link clicks
CREATE TABLE public.marketing_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    content_slug TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    city TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_content_page_id ON public.social_posts(content_page_id);
CREATE INDEX idx_social_posts_news_article_id ON public.social_posts(news_article_id);
CREATE INDEX idx_social_posts_published_at ON public.social_posts(published_at DESC);
CREATE INDEX idx_content_events_processed ON public.content_events(processed);
CREATE INDEX idx_content_events_created_at ON public.content_events(created_at DESC);
CREATE INDEX idx_marketing_clicks_social_post_id ON public.marketing_clicks(social_post_id);
CREATE INDEX idx_marketing_clicks_clicked_at ON public.marketing_clicks(clicked_at DESC);
CREATE INDEX idx_marketing_clicks_utm_source ON public.marketing_clicks(utm_source);

-- Enable Row Level Security
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_accounts
CREATE POLICY "Admins can manage platform accounts"
ON public.platform_accounts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for social_posts
CREATE POLICY "Admins can manage social posts"
ON public.social_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view social posts"
ON public.social_posts
FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role));

-- RLS Policies for content_events
CREATE POLICY "Admins can manage content events"
ON public.content_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert content events"
ON public.content_events
FOR INSERT
WITH CHECK (true);

-- RLS Policies for marketing_clicks
CREATE POLICY "Admins can view marketing clicks"
ON public.marketing_clicks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert marketing clicks"
ON public.marketing_clicks
FOR INSERT
WITH CHECK (true);

-- Create trigger function to auto-create content events
CREATE OR REPLACE FUNCTION public.create_content_event_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_type TEXT;
    v_content_type TEXT;
BEGIN
    -- Determine event type
    IF TG_OP = 'INSERT' THEN
        v_event_type := 'created';
    ELSE
        v_event_type := 'updated';
    END IF;

    -- Handle content_pages
    IF TG_TABLE_NAME = 'content_pages' THEN
        -- Determine content type based on slug patterns
        IF NEW.slug LIKE 'visa-requirements/%' THEN
            v_content_type := 'visa_requirements';
        ELSIF NEW.slug LIKE 'guide/%' OR NEW.slug LIKE '%-guide' THEN
            v_content_type := 'country_guide';
        ELSE
            v_content_type := 'blog';
        END IF;

        INSERT INTO public.content_events (
            event_type,
            content_type,
            content_page_id,
            title,
            slug,
            featured_image_url
        ) VALUES (
            v_event_type,
            v_content_type,
            NEW.id,
            NEW.title,
            NEW.slug,
            NEW.featured_image_url
        );
    END IF;

    -- Handle news_articles
    IF TG_TABLE_NAME = 'news_articles' THEN
        INSERT INTO public.content_events (
            event_type,
            content_type,
            news_article_id,
            title,
            slug,
            featured_image_url
        ) VALUES (
            v_event_type,
            'news',
            NEW.id,
            NEW.title,
            NEW.slug,
            NEW.featured_image_url
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create triggers on content_pages
CREATE TRIGGER on_content_page_publish
    AFTER INSERT OR UPDATE ON public.content_pages
    FOR EACH ROW
    WHEN (NEW.is_published = true)
    EXECUTE FUNCTION public.create_content_event_on_publish();

-- Create triggers on news_articles
CREATE TRIGGER on_news_article_publish
    AFTER INSERT OR UPDATE ON public.news_articles
    FOR EACH ROW
    WHEN (NEW.status = 'published' AND NEW.published_at IS NOT NULL)
    EXECUTE FUNCTION public.create_content_event_on_publish();

-- Add updated_at trigger for platform_accounts
CREATE TRIGGER update_platform_accounts_updated_at
    BEFORE UPDATE ON public.platform_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for social_posts
CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON public.social_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();