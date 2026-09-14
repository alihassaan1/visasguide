CREATE OR REPLACE FUNCTION public.normalize_public_content_dashes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'content_pages' THEN
    NEW.title := replace(replace(NEW.title, '—', ', '), '–', '-');
    NEW.meta_title := replace(replace(NEW.meta_title, '—', ', '), '–', '-');
    NEW.meta_description := replace(replace(NEW.meta_description, '—', ', '), '–', '-');
    NEW.content := replace(replace(NEW.content, '—', ', '), '–', '-');
    NEW.excerpt := replace(replace(NEW.excerpt, '—', ', '), '–', '-');
  ELSIF TG_TABLE_NAME = 'news_articles' THEN
    NEW.title := replace(replace(NEW.title, '—', ', '), '–', '-');
    NEW.content := replace(replace(NEW.content, '—', ', '), '–', '-');
    NEW.excerpt := replace(replace(NEW.excerpt, '—', ', '), '–', '-');
    NEW.seo_title := replace(replace(NEW.seo_title, '—', ', '), '–', '-');
    NEW.seo_description := replace(replace(NEW.seo_description, '—', ', '), '–', '-');
  ELSIF TG_TABLE_NAME = 'guides' THEN
    NEW.title := replace(replace(NEW.title, '—', ', '), '–', '-');
    NEW.content := replace(replace(NEW.content, '—', ', '), '–', '-');
    NEW.excerpt := replace(replace(NEW.excerpt, '—', ', '), '–', '-');
    NEW.seo_title := replace(replace(NEW.seo_title, '—', ', '), '–', '-');
    NEW.seo_description := replace(replace(NEW.seo_description, '—', ', '), '–', '-');
  ELSIF TG_TABLE_NAME = 'rss_article_queue' THEN
    NEW.rewritten_title := replace(replace(NEW.rewritten_title, '—', ', '), '–', '-');
    NEW.rewritten_content := replace(replace(NEW.rewritten_content, '—', ', '), '–', '-');
    NEW.seo_title := replace(replace(NEW.seo_title, '—', ', '), '–', '-');
    NEW.seo_description := replace(replace(NEW.seo_description, '—', ', '), '–', '-');
    NEW.excerpt := replace(replace(NEW.excerpt, '—', ', '), '–', '-');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.content_pages;
CREATE TRIGGER normalize_public_content_dashes
BEFORE INSERT OR UPDATE ON public.content_pages
FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();

DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.news_articles;
CREATE TRIGGER normalize_public_content_dashes
BEFORE INSERT OR UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();

DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.guides;
CREATE TRIGGER normalize_public_content_dashes
BEFORE INSERT OR UPDATE ON public.guides
FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();

DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.rss_article_queue;
CREATE TRIGGER normalize_public_content_dashes
BEFORE INSERT OR UPDATE ON public.rss_article_queue
FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();