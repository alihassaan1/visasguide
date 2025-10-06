-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update content_pages policies for admin access
DROP POLICY IF EXISTS "Published content pages are publicly readable" ON public.content_pages;

CREATE POLICY "Published content pages are publicly readable"
ON public.content_pages
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage content pages"
ON public.content_pages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update rss_feeds policies
DROP POLICY IF EXISTS "RSS feeds are publicly readable" ON public.rss_feeds;

CREATE POLICY "RSS feeds are publicly readable"
ON public.rss_feeds
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage RSS feeds"
ON public.rss_feeds
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update news_articles policies
DROP POLICY IF EXISTS "Published news articles are publicly readable" ON public.news_articles;

CREATE POLICY "Published news articles are publicly readable"
ON public.news_articles
FOR SELECT
USING (published_at IS NOT NULL);

CREATE POLICY "Admins can manage news articles"
ON public.news_articles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));