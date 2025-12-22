-- Update author avatars with the generated images
-- Note: Since these are local src/assets paths, we need to use the production URL format

UPDATE public.authors SET avatar_url = '/authors/elena-rodriguez.jpg' WHERE slug = 'elena-rodriguez';
UPDATE public.authors SET avatar_url = '/authors/james-chen.jpg' WHERE slug = 'james-chen';
UPDATE public.authors SET avatar_url = '/authors/michael-thompson.jpg' WHERE slug = 'michael-thompson';
UPDATE public.authors SET avatar_url = '/authors/priya-sharma.jpg' WHERE slug = 'priya-sharma';
UPDATE public.authors SET avatar_url = '/authors/sarah-mitchell.jpg' WHERE slug = 'sarah-mitchell';