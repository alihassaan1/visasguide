-- Fix country page images (all had the same generic Unsplash URL)
UPDATE content_pages SET featured_image_url = '/blog/nepal-destination.jpg' WHERE slug = 'countries/nepal';
UPDATE content_pages SET featured_image_url = '/blog/albania-destination.jpg' WHERE slug = 'countries/albania';
UPDATE content_pages SET featured_image_url = '/blog/belarus-destination.jpg' WHERE slug = 'countries/belarus';

-- Fix missing news article images
UPDATE news_articles SET featured_image_url = '/blog/uk-post-study-work-visa.jpg' WHERE slug = 'uk-post-study-work-visa-extension-2024';
UPDATE news_articles SET featured_image_url = '/blog/australia-fast-track-visa.jpg' WHERE slug = 'australia-fast-track-visa-skilled-workers';