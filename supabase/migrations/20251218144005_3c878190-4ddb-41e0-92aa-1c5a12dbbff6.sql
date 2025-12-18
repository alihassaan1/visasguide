-- Insert cities for major countries
-- Using ON CONFLICT to avoid duplicates if cities already exist

INSERT INTO public.cities (name, slug, country_id, is_featured, is_capital, meta_description) VALUES
-- United Kingdom (9029e73c-fbcc-4a0b-9fb8-1ef14d6d7342)
('London', 'london', '9029e73c-fbcc-4a0b-9fb8-1ef14d6d7342', true, true, 'Explore London visa requirements, attractions, and travel tips for your UK visit.'),
('Edinburgh', 'edinburgh', '9029e73c-fbcc-4a0b-9fb8-1ef14d6d7342', true, false, 'Discover Edinburgh''s historic charm and visa information for Scotland travelers.'),
('Manchester', 'manchester', '9029e73c-fbcc-4a0b-9fb8-1ef14d6d7342', true, false, 'Plan your trip to Manchester with complete visa and travel information.'),
('Birmingham', 'birmingham', '9029e73c-fbcc-4a0b-9fb8-1ef14d6d7342', true, false, 'Everything you need to know about visiting Birmingham, UK.'),

-- United States (27f7ad0b-ba0a-48b9-bd38-0575f9f6c274)
('New York', 'new-york', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'Complete guide to visiting New York City with visa requirements and travel tips.'),
('Los Angeles', 'los-angeles', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'Plan your trip to Los Angeles with visa information and travel guides.'),
('Miami', 'miami', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'Miami travel guide with visa requirements and beach destination tips.'),
('Las Vegas', 'las-vegas', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'Visit Las Vegas with complete visa and entertainment guide.'),
('San Francisco', 'san-francisco', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'San Francisco visa requirements and travel information.'),
('Chicago', 'chicago', '27f7ad0b-ba0a-48b9-bd38-0575f9f6c274', true, false, 'Chicago travel guide with visa information for international visitors.'),

-- France (81a3fb6d-9eec-488e-8b4a-9376b18ae5d9)
('Paris', 'paris', '81a3fb6d-9eec-488e-8b4a-9376b18ae5d9', true, true, 'Paris visa requirements and travel guide for the City of Lights.'),
('Nice', 'nice', '81a3fb6d-9eec-488e-8b4a-9376b18ae5d9', true, false, 'Nice French Riviera travel guide with visa information.'),
('Lyon', 'lyon', '81a3fb6d-9eec-488e-8b4a-9376b18ae5d9', true, false, 'Lyon gastronomy capital travel and visa guide.'),
('Marseille', 'marseille', '81a3fb6d-9eec-488e-8b4a-9376b18ae5d9', true, false, 'Marseille port city travel guide with visa requirements.'),

-- Germany (41d56512-0449-4860-a3ac-2bb004c01a40)
('Berlin', 'berlin', '41d56512-0449-4860-a3ac-2bb004c01a40', true, true, 'Berlin visa requirements and travel guide for Germany''s capital.'),
('Munich', 'munich', '41d56512-0449-4860-a3ac-2bb004c01a40', true, false, 'Munich Bavarian capital travel and visa information.'),
('Frankfurt', 'frankfurt', '41d56512-0449-4860-a3ac-2bb004c01a40', true, false, 'Frankfurt financial hub travel guide with visa requirements.'),
('Hamburg', 'hamburg', '41d56512-0449-4860-a3ac-2bb004c01a40', true, false, 'Hamburg port city travel and visa guide.'),

-- Spain (2de60ff9-643c-4bbb-bba5-d260ac352a55)
('Barcelona', 'barcelona', '2de60ff9-643c-4bbb-bba5-d260ac352a55', true, false, 'Barcelona travel guide with visa requirements for Spain.'),
('Madrid', 'madrid', '2de60ff9-643c-4bbb-bba5-d260ac352a55', true, true, 'Madrid capital city visa requirements and travel guide.'),
('Seville', 'seville', '2de60ff9-643c-4bbb-bba5-d260ac352a55', true, false, 'Seville Andalusian travel guide with visa information.'),
('Valencia', 'valencia', '2de60ff9-643c-4bbb-bba5-d260ac352a55', true, false, 'Valencia coastal city travel and visa guide.'),

-- Italy (a5b6f3a7-5d51-43a6-bbc2-2eb00930e6ff)
('Rome', 'rome', 'a5b6f3a7-5d51-43a6-bbc2-2eb00930e6ff', true, true, 'Rome eternal city visa requirements and travel guide.'),
('Venice', 'venice', 'a5b6f3a7-5d51-43a6-bbc2-2eb00930e6ff', true, false, 'Venice canal city travel guide with visa information.'),
('Milan', 'milan', 'a5b6f3a7-5d51-43a6-bbc2-2eb00930e6ff', true, false, 'Milan fashion capital visa requirements and travel guide.'),
('Florence', 'florence', 'a5b6f3a7-5d51-43a6-bbc2-2eb00930e6ff', true, false, 'Florence Renaissance city travel and visa guide.'),

-- Australia (cfc7ba4b-8ff9-481c-bfb8-67ab42faf3ab)
('Sydney', 'sydney', 'cfc7ba4b-8ff9-481c-bfb8-67ab42faf3ab', true, false, 'Sydney visa requirements and travel guide for Australia.'),
('Melbourne', 'melbourne', 'cfc7ba4b-8ff9-481c-bfb8-67ab42faf3ab', true, false, 'Melbourne cultural capital travel and visa information.'),
('Brisbane', 'brisbane', 'cfc7ba4b-8ff9-481c-bfb8-67ab42faf3ab', true, false, 'Brisbane Queensland travel guide with visa requirements.'),
('Perth', 'perth', 'cfc7ba4b-8ff9-481c-bfb8-67ab42faf3ab', true, false, 'Perth Western Australia travel and visa guide.'),

-- Canada (0eb89535-e83a-48b0-b7d5-94340c6a2ebe)
('Toronto', 'toronto', '0eb89535-e83a-48b0-b7d5-94340c6a2ebe', true, false, 'Toronto visa requirements and travel guide for Canada.'),
('Vancouver', 'vancouver', '0eb89535-e83a-48b0-b7d5-94340c6a2ebe', true, false, 'Vancouver Pacific coast travel and visa information.'),
('Montreal', 'montreal', '0eb89535-e83a-48b0-b7d5-94340c6a2ebe', true, false, 'Montreal French-Canadian city travel and visa guide.'),

-- Japan (aa6d9060-b364-49ab-bebd-0b9bc9751456)
('Tokyo', 'tokyo', 'aa6d9060-b364-49ab-bebd-0b9bc9751456', true, true, 'Tokyo visa requirements and travel guide for Japan''s capital.'),
('Osaka', 'osaka', 'aa6d9060-b364-49ab-bebd-0b9bc9751456', true, false, 'Osaka food capital travel and visa information.'),
('Kyoto', 'kyoto', 'aa6d9060-b364-49ab-bebd-0b9bc9751456', true, false, 'Kyoto traditional Japan travel guide with visa requirements.'),
('Yokohama', 'yokohama', 'aa6d9060-b364-49ab-bebd-0b9bc9751456', true, false, 'Yokohama port city travel and visa guide.'),
('Hiroshima', 'hiroshima', 'aa6d9060-b364-49ab-bebd-0b9bc9751456', true, false, 'Hiroshima peace city travel guide with visa information.'),

-- Singapore (91712e3e-dd75-4666-af64-0cb82e166951)
('Singapore City', 'singapore-city', '91712e3e-dd75-4666-af64-0cb82e166951', true, true, 'Singapore City visa requirements and travel guide.'),

-- Malaysia (4191f15a-4562-402b-a4e5-7b504a7c41a0)
('Kuala Lumpur', 'kuala-lumpur', '4191f15a-4562-402b-a4e5-7b504a7c41a0', true, true, 'Kuala Lumpur visa requirements and travel guide for Malaysia.'),
('Penang', 'penang', '4191f15a-4562-402b-a4e5-7b504a7c41a0', true, false, 'Penang island travel guide with visa information.'),
('Langkawi', 'langkawi', '4191f15a-4562-402b-a4e5-7b504a7c41a0', true, false, 'Langkawi beach destination travel and visa guide.'),

-- South Korea (f41f548d-221d-4a75-ae77-7da09a56a9f0)
('Seoul', 'seoul', 'f41f548d-221d-4a75-ae77-7da09a56a9f0', true, true, 'Seoul visa requirements and travel guide for South Korea.'),
('Busan', 'busan', 'f41f548d-221d-4a75-ae77-7da09a56a9f0', true, false, 'Busan coastal city travel and visa information.'),
('Jeju', 'jeju', 'f41f548d-221d-4a75-ae77-7da09a56a9f0', true, false, 'Jeju Island travel guide with visa requirements.'),

-- Netherlands (b319469b-4eab-4342-a3fd-c19709035468)
('Amsterdam', 'amsterdam', 'b319469b-4eab-4342-a3fd-c19709035468', true, true, 'Amsterdam visa requirements and travel guide for Netherlands.'),
('Rotterdam', 'rotterdam', 'b319469b-4eab-4342-a3fd-c19709035468', true, false, 'Rotterdam modern architecture travel and visa guide.'),

-- Switzerland (8045ec70-8900-492a-a9bc-2deca56a6967)
('Zurich', 'zurich', '8045ec70-8900-492a-a9bc-2deca56a6967', true, false, 'Zurich visa requirements and travel guide for Switzerland.'),
('Geneva', 'geneva', '8045ec70-8900-492a-a9bc-2deca56a6967', true, false, 'Geneva international city travel and visa information.'),
('Lucerne', 'lucerne', '8045ec70-8900-492a-a9bc-2deca56a6967', true, false, 'Lucerne scenic Alps travel and visa guide.'),

-- Portugal (d0f25021-e00b-4a51-8b8e-a5ed67ecf2bb)
('Lisbon', 'lisbon', 'd0f25021-e00b-4a51-8b8e-a5ed67ecf2bb', true, true, 'Lisbon visa requirements and travel guide for Portugal.'),
('Porto', 'porto', 'd0f25021-e00b-4a51-8b8e-a5ed67ecf2bb', true, false, 'Porto wine city travel and visa information.'),

-- Greece (c5e37c2f-a7a5-4c13-8d53-d3a098acd8bc)
('Athens', 'athens', 'c5e37c2f-a7a5-4c13-8d53-d3a098acd8bc', true, true, 'Athens visa requirements and ancient history travel guide.'),
('Santorini', 'santorini', 'c5e37c2f-a7a5-4c13-8d53-d3a098acd8bc', true, false, 'Santorini island paradise travel and visa guide.'),

-- Turkey (9fc59d75-fa63-463c-a945-ec672e801c8d)
('Istanbul', 'istanbul', '9fc59d75-fa63-463c-a945-ec672e801c8d', true, false, 'Istanbul visa requirements and travel guide for Turkey.'),
('Antalya', 'antalya', '9fc59d75-fa63-463c-a945-ec672e801c8d', true, false, 'Antalya Turkish Riviera travel and visa information.'),
('Cappadocia', 'cappadocia', '9fc59d75-fa63-463c-a945-ec672e801c8d', true, false, 'Cappadocia hot air balloon travel and visa guide.'),

-- Brazil (006836b9-4845-44e5-b07c-1fbabb45d505)
('Rio de Janeiro', 'rio-de-janeiro', '006836b9-4845-44e5-b07c-1fbabb45d505', true, false, 'Rio de Janeiro visa requirements and travel guide.'),
('São Paulo', 'sao-paulo', '006836b9-4845-44e5-b07c-1fbabb45d505', true, false, 'São Paulo business hub travel and visa information.'),

-- Mexico (406ef6c3-2e98-4455-a8cf-ab0ca77e20b0)
('Mexico City', 'mexico-city', '406ef6c3-2e98-4455-a8cf-ab0ca77e20b0', true, true, 'Mexico City visa requirements and travel guide.'),
('Cancun', 'cancun', '406ef6c3-2e98-4455-a8cf-ab0ca77e20b0', true, false, 'Cancun beach resort travel and visa information.'),

-- Egypt (017eccb5-2828-4813-9623-93db85ec4f59)
('Cairo', 'cairo', '017eccb5-2828-4813-9623-93db85ec4f59', true, true, 'Cairo pyramids visa requirements and travel guide.'),
('Luxor', 'luxor', '017eccb5-2828-4813-9623-93db85ec4f59', true, false, 'Luxor ancient temples travel and visa information.'),

-- South Africa (353608d8-1850-4f08-8462-2fce4a0b64b2)
('Cape Town', 'cape-town', '353608d8-1850-4f08-8462-2fce4a0b64b2', true, false, 'Cape Town visa requirements and travel guide for South Africa.'),
('Johannesburg', 'johannesburg', '353608d8-1850-4f08-8462-2fce4a0b64b2', true, false, 'Johannesburg city travel and visa information.'),

-- New Zealand (d7f56e47-c121-49a2-b868-5691b6e210b8)
('Auckland', 'auckland', 'd7f56e47-c121-49a2-b868-5691b6e210b8', true, false, 'Auckland visa requirements and travel guide for New Zealand.'),
('Queenstown', 'queenstown', 'd7f56e47-c121-49a2-b868-5691b6e210b8', true, false, 'Queenstown adventure capital travel and visa guide.'),

-- Ireland (9e1595e7-7d76-4240-9f45-36edab4b6cc7)
('Dublin', 'dublin', '9e1595e7-7d76-4240-9f45-36edab4b6cc7', true, true, 'Dublin visa requirements and travel guide for Ireland.'),

-- Poland (7b781e3e-d9a2-4f2e-ba67-72cd00aaf7ee)
('Warsaw', 'warsaw', '7b781e3e-d9a2-4f2e-ba67-72cd00aaf7ee', true, true, 'Warsaw visa requirements and travel guide for Poland.'),
('Krakow', 'krakow', '7b781e3e-d9a2-4f2e-ba67-72cd00aaf7ee', true, false, 'Krakow historic city travel and visa information.'),

-- Austria (36d0cee6-ff88-4569-a3e5-5a950501ace9)
('Vienna', 'vienna', '36d0cee6-ff88-4569-a3e5-5a950501ace9', true, true, 'Vienna visa requirements and travel guide for Austria.'),
('Salzburg', 'salzburg', '36d0cee6-ff88-4569-a3e5-5a950501ace9', true, false, 'Salzburg Mozart city travel and visa information.'),

-- Czech Republic (83500747-1ee6-43f5-b5d1-2eb3cb4e5db3)
('Prague', 'prague', '83500747-1ee6-43f5-b5d1-2eb3cb4e5db3', true, true, 'Prague visa requirements and travel guide for Czech Republic.'),

-- Belgium (11786c35-3de5-491f-80d5-1f04254f986e)
('Brussels', 'brussels', '11786c35-3de5-491f-80d5-1f04254f986e', true, true, 'Brussels EU capital visa requirements and travel guide.'),
('Bruges', 'bruges', '11786c35-3de5-491f-80d5-1f04254f986e', true, false, 'Bruges medieval city travel and visa information.'),

-- Norway (278d1ae5-865f-4033-963c-09002791117b)
('Oslo', 'oslo', '278d1ae5-865f-4033-963c-09002791117b', true, true, 'Oslo visa requirements and travel guide for Norway.'),
('Bergen', 'bergen', '278d1ae5-865f-4033-963c-09002791117b', true, false, 'Bergen fjords gateway travel and visa information.'),

-- Denmark (707778d9-abc7-42d8-a659-71f0b2ac255f)
('Copenhagen', 'copenhagen', '707778d9-abc7-42d8-a659-71f0b2ac255f', true, true, 'Copenhagen visa requirements and travel guide for Denmark.'),

-- Finland (c9b94cc3-58da-4a6e-af03-b3e8d8a14528)
('Helsinki', 'helsinki', 'c9b94cc3-58da-4a6e-af03-b3e8d8a14528', true, true, 'Helsinki visa requirements and travel guide for Finland.'),

-- China (cd155b29-a4c8-4541-b078-f06200ff4e48)
('Beijing', 'beijing', 'cd155b29-a4c8-4541-b078-f06200ff4e48', true, true, 'Beijing visa requirements and travel guide for China.'),
('Shanghai', 'shanghai', 'cd155b29-a4c8-4541-b078-f06200ff4e48', true, false, 'Shanghai modern city travel and visa information.'),
('Hong Kong', 'hong-kong-city', 'cd155b29-a4c8-4541-b078-f06200ff4e48', true, false, 'Hong Kong travel and visa guide.'),

-- Taiwan (5ee968d0-f3cc-4621-8f3c-7ae39b43b519)
('Taipei', 'taipei', '5ee968d0-f3cc-4621-8f3c-7ae39b43b519', true, true, 'Taipei visa requirements and travel guide for Taiwan.'),

-- Vietnam (bb3c9e77-0db3-4462-9e7e-1292b0d249b5)
('Ho Chi Minh City', 'ho-chi-minh-city', 'bb3c9e77-0db3-4462-9e7e-1292b0d249b5', true, false, 'Ho Chi Minh City visa requirements and travel guide.'),
('Hanoi', 'hanoi', 'bb3c9e77-0db3-4462-9e7e-1292b0d249b5', true, true, 'Hanoi capital city travel and visa information.'),
('Da Nang', 'da-nang', 'bb3c9e77-0db3-4462-9e7e-1292b0d249b5', true, false, 'Da Nang beach city travel and visa guide.'),

-- Philippines (adef5c25-6359-4a3f-84d7-cc70c1d33246)
('Manila', 'manila', 'adef5c25-6359-4a3f-84d7-cc70c1d33246', true, true, 'Manila visa requirements and travel guide for Philippines.'),
('Cebu', 'cebu', 'adef5c25-6359-4a3f-84d7-cc70c1d33246', true, false, 'Cebu island travel and visa information.'),

-- Argentina (e80616f0-6b5a-43ce-ae35-180d71336a0b)
('Buenos Aires', 'buenos-aires', 'e80616f0-6b5a-43ce-ae35-180d71336a0b', true, true, 'Buenos Aires visa requirements and travel guide for Argentina.'),

-- Chile (552af084-5626-43b3-b566-785eae89e680)
('Santiago', 'santiago', '552af084-5626-43b3-b566-785eae89e680', true, true, 'Santiago visa requirements and travel guide for Chile.'),

-- Peru (56b80601-f92a-442c-972d-057e2a6a08cc)
('Lima', 'lima', '56b80601-f92a-442c-972d-057e2a6a08cc', true, true, 'Lima visa requirements and travel guide for Peru.'),
('Cusco', 'cusco', '56b80601-f92a-442c-972d-057e2a6a08cc', true, false, 'Cusco Machu Picchu gateway travel and visa guide.'),

-- Colombia (f1e8ca9e-b01c-4dbc-ab6b-7ae644ead297)
('Bogota', 'bogota', 'f1e8ca9e-b01c-4dbc-ab6b-7ae644ead297', true, true, 'Bogota visa requirements and travel guide for Colombia.'),
('Cartagena', 'cartagena', 'f1e8ca9e-b01c-4dbc-ab6b-7ae644ead297', true, false, 'Cartagena colonial city travel and visa information.')

ON CONFLICT (slug) DO UPDATE SET
  is_featured = EXCLUDED.is_featured,
  meta_description = EXCLUDED.meta_description;