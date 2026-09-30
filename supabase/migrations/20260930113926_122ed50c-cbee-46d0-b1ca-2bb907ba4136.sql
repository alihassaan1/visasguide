CREATE OR REPLACE FUNCTION public.normalize_public_content_typography(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN value IS NULL THEN NULL
    ELSE regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(value, '[\t ]*—[\t ]*', ', ', 'g'),
          '[\t ]*–[\t ]*', '-', 'g'
        ),
        '[\t ]+,', ',', 'g'
      ),
      ',([[:alpha:]])', ', \1', 'g'
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_public_content_dashes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'content_pages' THEN
    NEW.title := public.normalize_public_content_typography(NEW.title);
    NEW.meta_title := public.normalize_public_content_typography(NEW.meta_title);
    NEW.meta_description := public.normalize_public_content_typography(NEW.meta_description);
    NEW.content := public.normalize_public_content_typography(NEW.content);
    NEW.excerpt := public.normalize_public_content_typography(NEW.excerpt);
  ELSIF TG_TABLE_NAME = 'news_articles' THEN
    NEW.title := public.normalize_public_content_typography(NEW.title);
    NEW.content := public.normalize_public_content_typography(NEW.content);
    NEW.excerpt := public.normalize_public_content_typography(NEW.excerpt);
    NEW.seo_title := public.normalize_public_content_typography(NEW.seo_title);
    NEW.seo_description := public.normalize_public_content_typography(NEW.seo_description);
  ELSIF TG_TABLE_NAME = 'guides' THEN
    NEW.title := public.normalize_public_content_typography(NEW.title);
    NEW.content := public.normalize_public_content_typography(NEW.content);
    NEW.excerpt := public.normalize_public_content_typography(NEW.excerpt);
    NEW.seo_title := public.normalize_public_content_typography(NEW.seo_title);
    NEW.seo_description := public.normalize_public_content_typography(NEW.seo_description);
  ELSIF TG_TABLE_NAME = 'rss_article_queue' THEN
    NEW.rewritten_title := public.normalize_public_content_typography(NEW.rewritten_title);
    NEW.rewritten_content := public.normalize_public_content_typography(NEW.rewritten_content);
    NEW.seo_title := public.normalize_public_content_typography(NEW.seo_title);
    NEW.seo_description := public.normalize_public_content_typography(NEW.seo_description);
    NEW.excerpt := public.normalize_public_content_typography(NEW.excerpt);
  ELSIF TG_TABLE_NAME = 'etias_country_pages' THEN
    NEW.country_name := public.normalize_public_content_typography(NEW.country_name);
    NEW.nationality := public.normalize_public_content_typography(NEW.nationality);
    NEW.intro := public.normalize_public_content_typography(NEW.intro);
    NEW.who_qualifies := public.normalize_public_content_typography(NEW.who_qualifies);
    NEW.special_notes := public.normalize_public_content_typography(NEW.special_notes);
    NEW.processing_details := public.normalize_public_content_typography(NEW.processing_details);
    NEW.faqs := public.normalize_public_content_typography(NEW.faqs::text)::jsonb;
    NEW.seo_title := public.normalize_public_content_typography(NEW.seo_title);
    NEW.seo_description := public.normalize_public_content_typography(NEW.seo_description);
  ELSIF TG_TABLE_NAME = 'cities' THEN
    NEW.name := public.normalize_public_content_typography(NEW.name);
    NEW.description := public.normalize_public_content_typography(NEW.description);
    NEW.best_time_to_visit := public.normalize_public_content_typography(NEW.best_time_to_visit);
    NEW.safety_tips := public.normalize_public_content_typography(NEW.safety_tips);
    NEW.getting_around := public.normalize_public_content_typography(NEW.getting_around);
    NEW.meta_title := public.normalize_public_content_typography(NEW.meta_title);
    NEW.meta_description := public.normalize_public_content_typography(NEW.meta_description);
  END IF;
  RETURN NEW;
END;
$$;

SET LOCAL session_replication_role = replica;

UPDATE public.content_pages
SET title = public.normalize_public_content_typography(title),
    meta_title = public.normalize_public_content_typography(meta_title),
    meta_description = public.normalize_public_content_typography(meta_description),
    content = public.normalize_public_content_typography(content),
    excerpt = public.normalize_public_content_typography(excerpt)
WHERE concat_ws('', title, meta_title, meta_description, content, excerpt) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';

UPDATE public.news_articles
SET title = public.normalize_public_content_typography(title),
    content = public.normalize_public_content_typography(content),
    excerpt = public.normalize_public_content_typography(excerpt),
    seo_title = public.normalize_public_content_typography(seo_title),
    seo_description = public.normalize_public_content_typography(seo_description)
WHERE concat_ws('', title, content, excerpt, seo_title, seo_description) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';

UPDATE public.guides
SET title = public.normalize_public_content_typography(title),
    content = public.normalize_public_content_typography(content),
    excerpt = public.normalize_public_content_typography(excerpt),
    seo_title = public.normalize_public_content_typography(seo_title),
    seo_description = public.normalize_public_content_typography(seo_description)
WHERE concat_ws('', title, content, excerpt, seo_title, seo_description) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';

UPDATE public.rss_article_queue
SET rewritten_title = public.normalize_public_content_typography(rewritten_title),
    rewritten_content = public.normalize_public_content_typography(rewritten_content),
    seo_title = public.normalize_public_content_typography(seo_title),
    seo_description = public.normalize_public_content_typography(seo_description),
    excerpt = public.normalize_public_content_typography(excerpt)
WHERE concat_ws('', rewritten_title, rewritten_content, seo_title, seo_description, excerpt) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';

UPDATE public.etias_country_pages
SET country_name = public.normalize_public_content_typography(country_name),
    nationality = public.normalize_public_content_typography(nationality),
    intro = public.normalize_public_content_typography(intro),
    who_qualifies = public.normalize_public_content_typography(who_qualifies),
    special_notes = public.normalize_public_content_typography(special_notes),
    processing_details = public.normalize_public_content_typography(processing_details),
    faqs = public.normalize_public_content_typography(faqs::text)::jsonb,
    seo_title = public.normalize_public_content_typography(seo_title),
    seo_description = public.normalize_public_content_typography(seo_description)
WHERE concat_ws('', country_name, nationality, intro, who_qualifies, special_notes, processing_details, faqs::text, seo_title, seo_description) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';

UPDATE public.cities
SET name = public.normalize_public_content_typography(name),
    description = public.normalize_public_content_typography(description),
    best_time_to_visit = public.normalize_public_content_typography(best_time_to_visit),
    safety_tips = public.normalize_public_content_typography(safety_tips),
    getting_around = public.normalize_public_content_typography(getting_around),
    meta_title = public.normalize_public_content_typography(meta_title),
    meta_description = public.normalize_public_content_typography(meta_description)
WHERE concat_ws('', name, description, best_time_to_visit, safety_tips, getting_around, meta_title, meta_description) ~ '([[:alpha:]][ ]+,|,[[:alpha:]]|[—–])';