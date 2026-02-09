UPDATE content_pages SET 
  title = REPLACE(title, '2025', '2026'),
  excerpt = REPLACE(excerpt, '2025', '2026'),
  meta_title = REPLACE(meta_title, '2025', '2026'),
  meta_description = REPLACE(meta_description, '2025', '2026')
WHERE title LIKE '%2025%' OR excerpt LIKE '%2025%' OR meta_title LIKE '%2025%' OR meta_description LIKE '%2025%';

UPDATE news_articles SET 
  title = REPLACE(title, '2025', '2026'),
  excerpt = REPLACE(excerpt, '2025', '2026'),
  seo_title = REPLACE(seo_title, '2025', '2026'),
  seo_description = REPLACE(seo_description, '2025', '2026')
WHERE title LIKE '%2025%' OR excerpt LIKE '%2025%' OR seo_title LIKE '%2025%' OR seo_description LIKE '%2025%';

UPDATE guides SET 
  title = REPLACE(title, '2025', '2026'),
  excerpt = REPLACE(excerpt, '2025', '2026'),
  seo_title = REPLACE(seo_title, '2025', '2026'),
  seo_description = REPLACE(seo_description, '2025', '2026')
WHERE title LIKE '%2025%' OR excerpt LIKE '%2025%' OR seo_title LIKE '%2025%' OR seo_description LIKE '%2025%';