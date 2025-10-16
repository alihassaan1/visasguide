-- Create ai_generations table
CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  content_type TEXT,
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_generations
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_generations
CREATE POLICY "Users can view their own AI generations"
ON public.ai_generations FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own AI generations"
ON public.ai_generations FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can view all AI generations"
ON public.ai_generations FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete AI generations"
ON public.ai_generations FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create settings_affiliates table
CREATE TABLE public.settings_affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  image_url TEXT,
  position TEXT NOT NULL DEFAULT 'sidebar',
  is_active BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings_affiliates
ALTER TABLE public.settings_affiliates ENABLE ROW LEVEL SECURITY;

-- RLS policies for settings_affiliates
CREATE POLICY "Affiliates are publicly readable"
ON public.settings_affiliates FOR SELECT
USING (true);

CREATE POLICY "Admins can manage affiliate settings"
ON public.settings_affiliates FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_log
CREATE POLICY "Users can view their own activity"
ON public.activity_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.activity_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs"
ON public.activity_log FOR INSERT
WITH CHECK (true);

-- Add columns to content_pages
ALTER TABLE public.content_pages
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Add columns to news_articles
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Create trigger for ai_generations updated_at
CREATE TRIGGER update_ai_generations_updated_at
BEFORE UPDATE ON public.ai_generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for settings_affiliates updated_at
CREATE TRIGGER update_settings_affiliates_updated_at
BEFORE UPDATE ON public.settings_affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_ai_generations_author_id ON public.ai_generations(author_id);
CREATE INDEX idx_ai_generations_created_at ON public.ai_generations(created_at DESC);
CREATE INDEX idx_content_pages_author_id ON public.content_pages(author_id);
CREATE INDEX idx_news_articles_author_id ON public.news_articles(author_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);