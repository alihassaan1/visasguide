-- Reset all ai_generated flags to false
UPDATE content_pages SET ai_generated = false WHERE ai_generated = true;
UPDATE news_articles SET ai_generated = false WHERE ai_generated = true;

-- Publish the 3 draft news articles
UPDATE news_articles SET status = 'published', published_at = now() WHERE status = 'draft';