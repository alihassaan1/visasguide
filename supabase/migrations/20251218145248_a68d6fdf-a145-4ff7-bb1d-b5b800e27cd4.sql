-- Add cities for Singapore
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Singapore City', 'singapore-city', id, true, true, 'Explore Singapore City - a vibrant metropolis', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80'
FROM countries WHERE slug = 'singapore' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Sentosa', 'sentosa', id, true, false, 'Discover Sentosa island resort', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80'
FROM countries WHERE slug = 'singapore' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Marina Bay', 'marina-bay', id, true, false, 'Visit iconic Marina Bay area', 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&q=80'
FROM countries WHERE slug = 'singapore' ON CONFLICT DO NOTHING;

-- Add cities for Taiwan
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Taipei', 'taipei', id, true, true, 'Explore Taipei, Taiwan capital city', 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80'
FROM countries WHERE slug = 'taiwan' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Kaohsiung', 'kaohsiung', id, true, false, 'Discover Kaohsiung port city', 'https://images.unsplash.com/photo-1552553302-9211bf7f7053?w=800&q=80'
FROM countries WHERE slug = 'taiwan' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Taichung', 'taichung', id, true, false, 'Visit Taichung cultural hub', 'https://images.unsplash.com/photo-1558563855-753c546eaf5a?w=800&q=80'
FROM countries WHERE slug = 'taiwan' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Tainan', 'tainan', id, true, false, 'Explore historic Tainan', 'https://images.unsplash.com/photo-1590228947012-fa801aa7c155?w=800&q=80'
FROM countries WHERE slug = 'taiwan' ON CONFLICT DO NOTHING;

-- Add cities for Argentina
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Buenos Aires', 'buenos-aires', id, true, true, 'Discover Buenos Aires, Paris of South America', 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80'
FROM countries WHERE slug = 'argentina' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Mendoza', 'mendoza', id, true, false, 'Explore Mendoza wine region', 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80'
FROM countries WHERE slug = 'argentina' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Bariloche', 'bariloche', id, true, false, 'Visit San Carlos de Bariloche', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80'
FROM countries WHERE slug = 'argentina' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Ushuaia', 'ushuaia', id, true, false, 'End of the world - Ushuaia', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
FROM countries WHERE slug = 'argentina' ON CONFLICT DO NOTHING;

-- Add cities for Chile
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Santiago', 'santiago', id, true, true, 'Explore Santiago, Chile capital', 'https://images.unsplash.com/photo-1594498257728-767a0e4a8e52?w=800&q=80'
FROM countries WHERE slug = 'chile' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Valparaiso', 'valparaiso', id, true, false, 'Colorful Valparaiso hills', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80'
FROM countries WHERE slug = 'chile' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Atacama', 'atacama', id, true, false, 'Atacama Desert adventures', 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800&q=80'
FROM countries WHERE slug = 'chile' ON CONFLICT DO NOTHING;

-- Add cities for Czech Republic
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Prague', 'prague', id, true, true, 'Discover magical Prague', 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80'
FROM countries WHERE slug = 'czech-republic' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Brno', 'brno', id, true, false, 'Explore Brno, Moravian capital', 'https://images.unsplash.com/photo-1600623047481-72a2e5d8b21e?w=800&q=80'
FROM countries WHERE slug = 'czech-republic' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Cesky Krumlov', 'cesky-krumlov', id, true, false, 'Fairytale Cesky Krumlov', 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80'
FROM countries WHERE slug = 'czech-republic' ON CONFLICT DO NOTHING;

-- Add cities for Denmark
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Copenhagen', 'copenhagen', id, true, true, 'Explore Copenhagen, Danish capital', 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80'
FROM countries WHERE slug = 'denmark' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Aarhus', 'aarhus', id, true, false, 'Discover cultural Aarhus', 'https://images.unsplash.com/photo-1559582930-bb1438aa0760?w=800&q=80'
FROM countries WHERE slug = 'denmark' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Odense', 'odense', id, true, false, 'Hans Christian Andersen hometown', 'https://images.unsplash.com/photo-1600623047481-72a2e5d8b21e?w=800&q=80'
FROM countries WHERE slug = 'denmark' ON CONFLICT DO NOTHING;

-- Add cities for Finland
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Helsinki', 'helsinki', id, true, true, 'Explore Helsinki, Finnish capital', 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&q=80'
FROM countries WHERE slug = 'finland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Rovaniemi', 'rovaniemi', id, true, false, 'Visit Santa Claus Village', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'
FROM countries WHERE slug = 'finland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Turku', 'turku', id, true, false, 'Historic Turku city', 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80'
FROM countries WHERE slug = 'finland' ON CONFLICT DO NOTHING;

-- Add cities for Ireland
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Dublin', 'dublin', id, true, true, 'Explore Dublin, Irish capital', 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80'
FROM countries WHERE slug = 'ireland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Galway', 'galway', id, true, false, 'Bohemian Galway city', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80'
FROM countries WHERE slug = 'ireland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Cork', 'cork', id, true, false, 'Discover Cork city', 'https://images.unsplash.com/photo-1564959130747-897a8e0a3330?w=800&q=80'
FROM countries WHERE slug = 'ireland' ON CONFLICT DO NOTHING;

-- Add cities for Croatia
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Zagreb', 'zagreb', id, true, true, 'Explore Zagreb, Croatian capital', 'https://images.unsplash.com/photo-1555990538-1e7e5c5f2c58?w=800&q=80'
FROM countries WHERE slug = 'croatia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Dubrovnik', 'dubrovnik', id, true, false, 'Kings Landing - Dubrovnik', 'https://images.unsplash.com/photo-1555990538-abcdef012345?w=800&q=80'
FROM countries WHERE slug = 'croatia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Split', 'split', id, true, false, 'Ancient Split city', 'https://images.unsplash.com/photo-1558620479-2da2c42e94ed?w=800&q=80'
FROM countries WHERE slug = 'croatia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Plitvice', 'plitvice', id, true, false, 'Plitvice Lakes National Park', 'https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=800&q=80'
FROM countries WHERE slug = 'croatia' ON CONFLICT DO NOTHING;

-- Add cities for Hungary (additional)
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Budapest', 'budapest', id, true, true, 'Explore Budapest, Pearl of the Danube', 'https://images.unsplash.com/photo-1541343672885-9be56236c6ae?w=800&q=80'
FROM countries WHERE slug = 'hungary' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Debrecen', 'debrecen', id, true, false, 'Discover Debrecen', 'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=800&q=80'
FROM countries WHERE slug = 'hungary' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Eger', 'eger', id, true, false, 'Historic Eger wine region', 'https://images.unsplash.com/photo-1558620479-2da2c42e94ed?w=800&q=80'
FROM countries WHERE slug = 'hungary' ON CONFLICT DO NOTHING;

-- Add cities for Morocco
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Marrakech', 'marrakech', id, true, false, 'Explore vibrant Marrakech', 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80'
FROM countries WHERE slug = 'morocco' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Casablanca', 'casablanca', id, true, false, 'Discover Casablanca', 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80'
FROM countries WHERE slug = 'morocco' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Fes', 'fes', id, true, false, 'Ancient medina of Fes', 'https://images.unsplash.com/photo-1545167496-c1e092d383a2?w=800&q=80'
FROM countries WHERE slug = 'morocco' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Chefchaouen', 'chefchaouen', id, true, false, 'Blue pearl Chefchaouen', 'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=800&q=80'
FROM countries WHERE slug = 'morocco' ON CONFLICT DO NOTHING;

-- Add cities for Kenya
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Nairobi', 'nairobi', id, true, true, 'Explore Nairobi, Kenyan capital', 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&q=80'
FROM countries WHERE slug = 'kenya' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Mombasa', 'mombasa', id, true, false, 'Coastal Mombasa beaches', 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80'
FROM countries WHERE slug = 'kenya' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Masai Mara', 'masai-mara', id, true, false, 'Safari in Masai Mara', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80'
FROM countries WHERE slug = 'kenya' ON CONFLICT DO NOTHING;

-- Add cities for Tanzania
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Dar es Salaam', 'dar-es-salaam', id, true, false, 'Discover Dar es Salaam', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80'
FROM countries WHERE slug = 'tanzania' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Zanzibar', 'zanzibar', id, true, false, 'Paradise island Zanzibar', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80'
FROM countries WHERE slug = 'tanzania' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Serengeti', 'serengeti', id, true, false, 'Serengeti National Park', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80'
FROM countries WHERE slug = 'tanzania' ON CONFLICT DO NOTHING;

-- Add cities for Costa Rica
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'San Jose', 'san-jose', id, true, true, 'Explore San Jose, Costa Rica', 'https://images.unsplash.com/photo-1558029137-a3e4bf2e9585?w=800&q=80'
FROM countries WHERE slug = 'costa-rica' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Manuel Antonio', 'manuel-antonio', id, true, false, 'Manuel Antonio beaches', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80'
FROM countries WHERE slug = 'costa-rica' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Arenal', 'arenal', id, true, false, 'Arenal Volcano adventure', 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80'
FROM countries WHERE slug = 'costa-rica' ON CONFLICT DO NOTHING;

-- Add cities for Panama
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Panama City', 'panama-city', id, true, true, 'Explore Panama City', 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80'
FROM countries WHERE slug = 'panama' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Bocas del Toro', 'bocas-del-toro', id, true, false, 'Bocas del Toro islands', 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80'
FROM countries WHERE slug = 'panama' ON CONFLICT DO NOTHING;

-- Add cities for Cuba
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Havana', 'havana', id, true, true, 'Explore historic Havana', 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800&q=80'
FROM countries WHERE slug = 'cuba' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Trinidad', 'trinidad', id, true, false, 'Colonial Trinidad town', 'https://images.unsplash.com/photo-1570299437488-d430e1e677c7?w=800&q=80'
FROM countries WHERE slug = 'cuba' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Varadero', 'varadero', id, true, false, 'Varadero beach resort', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
FROM countries WHERE slug = 'cuba' ON CONFLICT DO NOTHING;

-- Add cities for Jamaica
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Kingston', 'kingston', id, true, true, 'Explore Kingston, Jamaica', 'https://images.unsplash.com/photo-1570299437488-d430e1e677c7?w=800&q=80'
FROM countries WHERE slug = 'jamaica' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Montego Bay', 'montego-bay', id, true, false, 'Montego Bay beaches', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
FROM countries WHERE slug = 'jamaica' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Negril', 'negril', id, true, false, 'Seven Mile Beach Negril', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80'
FROM countries WHERE slug = 'jamaica' ON CONFLICT DO NOTHING;

-- Add cities for Maldives
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Male', 'male', id, true, true, 'Explore Male, Maldives capital', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80'
FROM countries WHERE slug = 'maldives' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Maafushi', 'maafushi', id, true, false, 'Budget-friendly Maafushi', 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80'
FROM countries WHERE slug = 'maldives' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Hulhumale', 'hulhumale', id, true, false, 'Modern Hulhumale island', 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800&q=80'
FROM countries WHERE slug = 'maldives' ON CONFLICT DO NOTHING;

-- Add cities for Sri Lanka
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Colombo', 'colombo', id, true, true, 'Explore Colombo, Sri Lanka', 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&q=80'
FROM countries WHERE slug = 'sri-lanka' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Kandy', 'kandy', id, true, false, 'Sacred city of Kandy', 'https://images.unsplash.com/photo-1588598198321-9735fd52531d?w=800&q=80'
FROM countries WHERE slug = 'sri-lanka' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Galle', 'galle', id, true, false, 'Historic Galle Fort', 'https://images.unsplash.com/photo-1586039052079-aa98e8b37a03?w=800&q=80'
FROM countries WHERE slug = 'sri-lanka' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Sigiriya', 'sigiriya', id, true, false, 'Sigiriya Lion Rock', 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800&q=80'
FROM countries WHERE slug = 'sri-lanka' ON CONFLICT DO NOTHING;

-- Add cities for Nepal
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Kathmandu', 'kathmandu', id, true, true, 'Explore Kathmandu, Nepal', 'https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&q=80'
FROM countries WHERE slug = 'nepal' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Pokhara', 'pokhara', id, true, false, 'Gateway to Himalayas', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
FROM countries WHERE slug = 'nepal' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Everest Base Camp', 'everest-base-camp', id, true, false, 'Trek to Everest', 'https://images.unsplash.com/photo-1516302350523-4c11b41a8d8e?w=800&q=80'
FROM countries WHERE slug = 'nepal' ON CONFLICT DO NOTHING;

-- Add cities for Cambodia
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Phnom Penh', 'phnom-penh', id, true, true, 'Explore Phnom Penh', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
FROM countries WHERE slug = 'cambodia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Siem Reap', 'siem-reap', id, true, false, 'Gateway to Angkor Wat', 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&q=80'
FROM countries WHERE slug = 'cambodia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Sihanoukville', 'sihanoukville', id, true, false, 'Beach paradise', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
FROM countries WHERE slug = 'cambodia' ON CONFLICT DO NOTHING;

-- Add cities for Laos
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Vientiane', 'vientiane', id, true, true, 'Explore Vientiane capital', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
FROM countries WHERE slug = 'laos' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Luang Prabang', 'luang-prabang', id, true, false, 'UNESCO Luang Prabang', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80'
FROM countries WHERE slug = 'laos' ON CONFLICT DO NOTHING;

-- Add cities for Myanmar
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Yangon', 'yangon', id, true, false, 'Explore Yangon city', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
FROM countries WHERE slug = 'myanmar' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Bagan', 'bagan', id, true, false, 'Ancient temples of Bagan', 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=800&q=80'
FROM countries WHERE slug = 'myanmar' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Mandalay', 'mandalay', id, true, false, 'Cultural Mandalay', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
FROM countries WHERE slug = 'myanmar' ON CONFLICT DO NOTHING;

-- Add cities for Iceland
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Reykjavik', 'reykjavik', id, true, true, 'Explore Reykjavik capital', 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80'
FROM countries WHERE slug = 'iceland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Blue Lagoon', 'blue-lagoon', id, true, false, 'Famous Blue Lagoon spa', 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80'
FROM countries WHERE slug = 'iceland' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Vik', 'vik', id, true, false, 'Black sand beaches of Vik', 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80'
FROM countries WHERE slug = 'iceland' ON CONFLICT DO NOTHING;

-- Add cities for Russia
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Moscow', 'moscow', id, true, true, 'Explore Moscow, Russian capital', 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80'
FROM countries WHERE slug = 'russia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'St Petersburg', 'st-petersburg', id, true, false, 'Cultural St Petersburg', 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&q=80'
FROM countries WHERE slug = 'russia' ON CONFLICT DO NOTHING;

-- Add cities for Saudi Arabia
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Riyadh', 'riyadh', id, true, true, 'Explore Riyadh capital', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80'
FROM countries WHERE slug = 'saudi-arabia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Jeddah', 'jeddah', id, true, false, 'Gateway to Mecca', 'https://images.unsplash.com/photo-1558091826-a21cffaf5ba6?w=800&q=80'
FROM countries WHERE slug = 'saudi-arabia' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'AlUla', 'alula', id, true, false, 'Ancient AlUla heritage', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&q=80'
FROM countries WHERE slug = 'saudi-arabia' ON CONFLICT DO NOTHING;

-- Add cities for Israel
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Tel Aviv', 'tel-aviv', id, true, false, 'Explore vibrant Tel Aviv', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80'
FROM countries WHERE slug = 'israel' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Jerusalem', 'jerusalem', id, true, true, 'Holy city of Jerusalem', 'https://images.unsplash.com/photo-1552423310-ba74b8de5e5c?w=800&q=80'
FROM countries WHERE slug = 'israel' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Dead Sea', 'dead-sea', id, true, false, 'Float in the Dead Sea', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80'
FROM countries WHERE slug = 'israel' ON CONFLICT DO NOTHING;

-- Add cities for Jordan
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Amman', 'amman', id, true, true, 'Explore Amman capital', 'https://images.unsplash.com/photo-1558029137-a3e4bf2e9585?w=800&q=80'
FROM countries WHERE slug = 'jordan' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Petra', 'petra', id, true, false, 'Ancient city of Petra', 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&q=80'
FROM countries WHERE slug = 'jordan' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Wadi Rum', 'wadi-rum', id, true, false, 'Mars on Earth - Wadi Rum', 'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=800&q=80'
FROM countries WHERE slug = 'jordan' ON CONFLICT DO NOTHING;

-- Add cities for Oman
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Muscat', 'muscat', id, true, true, 'Explore Muscat capital', 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80'
FROM countries WHERE slug = 'oman' ON CONFLICT DO NOTHING;
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Nizwa', 'nizwa', id, true, false, 'Historic Nizwa fort', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80'
FROM countries WHERE slug = 'oman' ON CONFLICT DO NOTHING;

-- Add cities for Qatar
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Doha', 'doha', id, true, true, 'Explore Doha, Qatar capital', 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80'
FROM countries WHERE slug = 'qatar' ON CONFLICT DO NOTHING;

-- Add cities for Bahrain
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Manama', 'manama', id, true, true, 'Explore Manama capital', 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80'
FROM countries WHERE slug = 'bahrain' ON CONFLICT DO NOTHING;

-- Add cities for Kuwait
INSERT INTO cities (name, slug, country_id, is_featured, is_capital, meta_description, hero_image_url)
SELECT 'Kuwait City', 'kuwait-city', id, true, true, 'Explore Kuwait City', 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80'
FROM countries WHERE slug = 'kuwait' ON CONFLICT DO NOTHING;