
-- Remove all embedded JSON-LD script tags from content_pages content
-- to fix duplicate FAQPage structured data detected by Google Search Console
UPDATE content_pages 
SET content = regexp_replace(
  content, 
  '<script\s+type=[''"]application/ld\+json[''"][^>]*>[\s\S]*?</script>', 
  '', 
  'gi'
)
WHERE content LIKE '%application/ld+json%'
AND slug LIKE 'countries/%';
