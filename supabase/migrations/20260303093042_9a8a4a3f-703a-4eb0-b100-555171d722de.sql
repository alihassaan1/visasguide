UPDATE public.news_articles 
SET title = 'New Student Visa Requirements for Germany 2026',
    slug = 'germany-student-visa-requirements-2026',
    seo_title = CASE WHEN seo_title ILIKE '%2024%' THEN REPLACE(seo_title, '2024', '2026') ELSE seo_title END,
    seo_description = CASE WHEN seo_description ILIKE '%2024%' THEN REPLACE(seo_description, '2024', '2026') ELSE seo_description END,
    excerpt = CASE WHEN excerpt ILIKE '%2024%' THEN REPLACE(excerpt, '2024', '2026') ELSE excerpt END,
    content = CASE WHEN content ILIKE '%2024%' THEN REPLACE(content, '2024', '2026') ELSE content END,
    updated_at = now()
WHERE id = '2aa8aa0f-6a04-45df-9ca6-2fa402089420';