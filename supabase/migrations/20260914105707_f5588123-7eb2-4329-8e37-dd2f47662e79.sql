SET LOCAL session_replication_role = replica;

UPDATE public.content_pages
SET title = replace(replace(title, '—', ', '), '–', '-'),
    meta_title = replace(replace(meta_title, '—', ', '), '–', '-'),
    meta_description = replace(replace(meta_description, '—', ', '), '–', '-'),
    content = replace(replace(content, '—', ', '), '–', '-'),
    excerpt = replace(replace(excerpt, '—', ', '), '–', '-')
WHERE concat_ws('', title, meta_title, meta_description, content, excerpt) ~ '[—–]';

UPDATE public.news_articles
SET title = replace(replace(title, '—', ', '), '–', '-'),
    content = replace(replace(content, '—', ', '), '–', '-'),
    excerpt = replace(replace(excerpt, '—', ', '), '–', '-'),
    seo_title = replace(replace(seo_title, '—', ', '), '–', '-'),
    seo_description = replace(replace(seo_description, '—', ', '), '–', '-')
WHERE concat_ws('', title, content, excerpt, seo_title, seo_description) ~ '[—–]';

UPDATE public.guides
SET title = replace(replace(title, '—', ', '), '–', '-'),
    content = replace(replace(content, '—', ', '), '–', '-'),
    excerpt = replace(replace(excerpt, '—', ', '), '–', '-'),
    seo_title = replace(replace(seo_title, '—', ', '), '–', '-'),
    seo_description = replace(replace(seo_description, '—', ', '), '–', '-')
WHERE concat_ws('', title, content, excerpt, seo_title, seo_description) ~ '[—–]';

UPDATE public.rss_article_queue
SET rewritten_title = replace(replace(rewritten_title, '—', ', '), '–', '-'),
    rewritten_content = replace(replace(rewritten_content, '—', ', '), '–', '-'),
    seo_title = replace(replace(seo_title, '—', ', '), '–', '-'),
    seo_description = replace(replace(seo_description, '—', ', '), '–', '-'),
    excerpt = replace(replace(excerpt, '—', ', '), '–', '-')
WHERE concat_ws('', rewritten_title, rewritten_content, seo_title, seo_description, excerpt) ~ '[—–]';