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
  ELSIF TG_TABLE_NAME = 'etias_country_pages' THEN
    NEW.country_name := replace(replace(NEW.country_name, '—', ', '), '–', '-');
    NEW.nationality := replace(replace(NEW.nationality, '—', ', '), '–', '-');
    NEW.intro := replace(replace(NEW.intro, '—', ', '), '–', '-');
    NEW.who_qualifies := replace(replace(NEW.who_qualifies, '—', ', '), '–', '-');
    NEW.special_notes := replace(replace(NEW.special_notes, '—', ', '), '–', '-');
    NEW.processing_details := replace(replace(NEW.processing_details, '—', ', '), '–', '-');
    NEW.faqs := replace(replace(NEW.faqs::text, '—', ', '), '–', '-')::jsonb;
    NEW.seo_title := replace(replace(NEW.seo_title, '—', ', '), '–', '-');
    NEW.seo_description := replace(replace(NEW.seo_description, '—', ', '), '–', '-');
  ELSIF TG_TABLE_NAME = 'cities' THEN
    NEW.name := replace(replace(NEW.name, '—', ', '), '–', '-');
    NEW.description := replace(replace(NEW.description, '—', ', '), '–', '-');
    NEW.best_time_to_visit := replace(replace(NEW.best_time_to_visit, '—', ', '), '–', '-');
    NEW.safety_tips := replace(replace(NEW.safety_tips, '—', ', '), '–', '-');
    NEW.getting_around := replace(replace(NEW.getting_around, '—', ', '), '–', '-');
    NEW.meta_title := replace(replace(NEW.meta_title, '—', ', '), '–', '-');
    NEW.meta_description := replace(replace(NEW.meta_description, '—', ', '), '–', '-');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.etias_country_pages;
CREATE TRIGGER normalize_public_content_dashes BEFORE INSERT OR UPDATE ON public.etias_country_pages FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();
DROP TRIGGER IF EXISTS normalize_public_content_dashes ON public.cities;
CREATE TRIGGER normalize_public_content_dashes BEFORE INSERT OR UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.normalize_public_content_dashes();

SET LOCAL session_replication_role = replica;
UPDATE public.etias_country_pages
SET country_name = replace(replace(country_name, '—', ', '), '–', '-'),
    nationality = replace(replace(nationality, '—', ', '), '–', '-'),
    intro = replace(replace(intro, '—', ', '), '–', '-'),
    who_qualifies = replace(replace(who_qualifies, '—', ', '), '–', '-'),
    special_notes = replace(replace(special_notes, '—', ', '), '–', '-'),
    processing_details = replace(replace(processing_details, '—', ', '), '–', '-'),
    faqs = replace(replace(faqs::text, '—', ', '), '–', '-')::jsonb,
    seo_title = replace(replace(seo_title, '—', ', '), '–', '-'),
    seo_description = replace(replace(seo_description, '—', ', '), '–', '-')
WHERE concat_ws('', country_name, nationality, intro, who_qualifies, special_notes, processing_details, faqs::text, seo_title, seo_description) ~ '[—–]';
UPDATE public.cities
SET name = replace(replace(name, '—', ', '), '–', '-'),
    description = replace(replace(description, '—', ', '), '–', '-'),
    best_time_to_visit = replace(replace(best_time_to_visit, '—', ', '), '–', '-'),
    safety_tips = replace(replace(safety_tips, '—', ', '), '–', '-'),
    getting_around = replace(replace(getting_around, '—', ', '), '–', '-'),
    meta_title = replace(replace(meta_title, '—', ', '), '–', '-'),
    meta_description = replace(replace(meta_description, '—', ', '), '–', '-')
WHERE concat_ws('', name, description, best_time_to_visit, safety_tips, getting_around, meta_title, meta_description) ~ '[—–]';