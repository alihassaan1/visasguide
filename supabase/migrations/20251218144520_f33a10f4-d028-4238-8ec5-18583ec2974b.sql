-- Update cities with high-quality hero images from curated Unsplash collection

UPDATE public.cities SET hero_image_url = CASE slug
  -- Japan
  WHEN 'tokyo' THEN 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=1080&fit=crop'
  WHEN 'osaka' THEN 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1920&h=1080&fit=crop'
  WHEN 'kyoto' THEN 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop'
  WHEN 'yokohama' THEN 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1920&h=1080&fit=crop'
  WHEN 'hiroshima' THEN 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=1920&h=1080&fit=crop'
  
  -- United Kingdom
  WHEN 'london' THEN 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&h=1080&fit=crop'
  WHEN 'edinburgh' THEN 'https://images.unsplash.com/photo-1506377585622-bedcbb5f4f6f?w=1920&h=1080&fit=crop'
  WHEN 'manchester' THEN 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=1920&h=1080&fit=crop'
  WHEN 'birmingham' THEN 'https://images.unsplash.com/photo-1520980255636-2c2a21c7eb0d?w=1920&h=1080&fit=crop'
  
  -- United States
  WHEN 'new-york' THEN 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&h=1080&fit=crop'
  WHEN 'los-angeles' THEN 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920&h=1080&fit=crop'
  WHEN 'miami' THEN 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1920&h=1080&fit=crop'
  WHEN 'las-vegas' THEN 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1920&h=1080&fit=crop'
  WHEN 'san-francisco' THEN 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop'
  WHEN 'chicago' THEN 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1920&h=1080&fit=crop'
  
  -- France
  WHEN 'paris' THEN 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&h=1080&fit=crop'
  WHEN 'nice' THEN 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=1920&h=1080&fit=crop'
  WHEN 'lyon' THEN 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1920&h=1080&fit=crop'
  WHEN 'marseille' THEN 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1920&h=1080&fit=crop'
  
  -- Germany
  WHEN 'berlin' THEN 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1920&h=1080&fit=crop'
  WHEN 'munich' THEN 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1920&h=1080&fit=crop'
  WHEN 'frankfurt' THEN 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&h=1080&fit=crop'
  WHEN 'hamburg' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop'
  
  -- Spain
  WHEN 'barcelona' THEN 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&h=1080&fit=crop'
  WHEN 'madrid' THEN 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&h=1080&fit=crop'
  WHEN 'seville' THEN 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1920&h=1080&fit=crop'
  WHEN 'valencia' THEN 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1920&h=1080&fit=crop'
  
  -- Italy
  WHEN 'rome' THEN 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&h=1080&fit=crop'
  WHEN 'venice' THEN 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1920&h=1080&fit=crop'
  WHEN 'milan' THEN 'https://images.unsplash.com/photo-1520440229-6469a149ac59?w=1920&h=1080&fit=crop'
  WHEN 'florence' THEN 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=1920&h=1080&fit=crop'
  
  -- Australia
  WHEN 'sydney' THEN 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&h=1080&fit=crop'
  WHEN 'melbourne' THEN 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1920&h=1080&fit=crop'
  WHEN 'brisbane' THEN 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=1920&h=1080&fit=crop'
  WHEN 'perth' THEN 'https://images.unsplash.com/photo-1573935448851-bf1e6f451a13?w=1920&h=1080&fit=crop'
  
  -- Canada
  WHEN 'toronto' THEN 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1920&h=1080&fit=crop'
  WHEN 'vancouver' THEN 'https://images.unsplash.com/photo-1559511260-66a68eb3a834?w=1920&h=1080&fit=crop'
  WHEN 'montreal' THEN 'https://images.unsplash.com/photo-1559587336-4eb38d15c699?w=1920&h=1080&fit=crop'
  
  -- Singapore
  WHEN 'singapore-city' THEN 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&h=1080&fit=crop'
  
  -- Malaysia
  WHEN 'kuala-lumpur' THEN 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&h=1080&fit=crop'
  WHEN 'penang' THEN 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=1920&h=1080&fit=crop'
  WHEN 'langkawi' THEN 'https://images.unsplash.com/photo-1609946860441-a51ffcf22208?w=1920&h=1080&fit=crop'
  
  -- South Korea
  WHEN 'seoul' THEN 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1920&h=1080&fit=crop'
  WHEN 'busan' THEN 'https://images.unsplash.com/photo-1578037571214-25e07ed4a8e2?w=1920&h=1080&fit=crop'
  WHEN 'jeju' THEN 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1920&h=1080&fit=crop'
  
  -- Netherlands
  WHEN 'amsterdam' THEN 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&h=1080&fit=crop'
  WHEN 'rotterdam' THEN 'https://images.unsplash.com/photo-1512470876337-0ea260c0db0e?w=1920&h=1080&fit=crop'
  
  -- Switzerland
  WHEN 'zurich' THEN 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1920&h=1080&fit=crop'
  WHEN 'geneva' THEN 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&h=1080&fit=crop'
  WHEN 'lucerne' THEN 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1920&h=1080&fit=crop'
  
  -- Portugal
  WHEN 'lisbon' THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop'
  WHEN 'porto' THEN 'https://images.unsplash.com/photo-1555881400-69009f5c20eb?w=1920&h=1080&fit=crop'
  
  -- Greece
  WHEN 'athens' THEN 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&h=1080&fit=crop'
  WHEN 'santorini' THEN 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&h=1080&fit=crop'
  
  -- Turkey
  WHEN 'istanbul' THEN 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&h=1080&fit=crop'
  WHEN 'antalya' THEN 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&h=1080&fit=crop'
  WHEN 'cappadocia' THEN 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1920&h=1080&fit=crop'
  
  -- Brazil
  WHEN 'rio-de-janeiro' THEN 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=1080&fit=crop'
  WHEN 'sao-paulo' THEN 'https://images.unsplash.com/photo-1554168848-228a5e76f888?w=1920&h=1080&fit=crop'
  
  -- Mexico
  WHEN 'mexico-city' THEN 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=1920&h=1080&fit=crop'
  WHEN 'cancun' THEN 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1920&h=1080&fit=crop'
  
  -- Egypt
  WHEN 'cairo' THEN 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1920&h=1080&fit=crop'
  WHEN 'luxor' THEN 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1920&h=1080&fit=crop'
  
  -- South Africa
  WHEN 'cape-town' THEN 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&h=1080&fit=crop'
  WHEN 'johannesburg' THEN 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1920&h=1080&fit=crop'
  
  -- New Zealand
  WHEN 'auckland' THEN 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&h=1080&fit=crop'
  WHEN 'queenstown' THEN 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1920&h=1080&fit=crop'
  
  -- Ireland
  WHEN 'dublin' THEN 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1920&h=1080&fit=crop'
  
  -- Poland
  WHEN 'warsaw' THEN 'https://images.unsplash.com/photo-1607427293702-036933bbf746?w=1920&h=1080&fit=crop'
  WHEN 'krakow' THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop'
  
  -- Austria
  WHEN 'vienna' THEN 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1920&h=1080&fit=crop'
  WHEN 'salzburg' THEN 'https://images.unsplash.com/photo-1595867897093-8b8f1c88582e?w=1920&h=1080&fit=crop'
  
  -- Czech Republic
  WHEN 'prague' THEN 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1920&h=1080&fit=crop'
  
  -- Belgium
  WHEN 'brussels' THEN 'https://images.unsplash.com/photo-1559113202-c916b8e44373?w=1920&h=1080&fit=crop'
  WHEN 'bruges' THEN 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1920&h=1080&fit=crop'
  
  -- Norway
  WHEN 'oslo' THEN 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1920&h=1080&fit=crop'
  WHEN 'bergen' THEN 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&h=1080&fit=crop'
  
  -- Denmark
  WHEN 'copenhagen' THEN 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1920&h=1080&fit=crop'
  
  -- Finland
  WHEN 'helsinki' THEN 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1920&h=1080&fit=crop'
  
  -- China
  WHEN 'beijing' THEN 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080&fit=crop'
  WHEN 'shanghai' THEN 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=1920&h=1080&fit=crop'
  WHEN 'hong-kong-city' THEN 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1920&h=1080&fit=crop'
  
  -- Taiwan
  WHEN 'taipei' THEN 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1920&h=1080&fit=crop'
  
  -- Vietnam
  WHEN 'ho-chi-minh-city' THEN 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=1080&fit=crop'
  WHEN 'hanoi' THEN 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1920&h=1080&fit=crop'
  WHEN 'da-nang' THEN 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1920&h=1080&fit=crop'
  
  -- Philippines
  WHEN 'manila' THEN 'https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=1920&h=1080&fit=crop'
  WHEN 'cebu' THEN 'https://images.unsplash.com/photo-1505316065161-4cb8a735a13f?w=1920&h=1080&fit=crop'
  
  -- Argentina
  WHEN 'buenos-aires' THEN 'https://images.unsplash.com/photo-1518141532615-4305c9f914c9?w=1920&h=1080&fit=crop'
  
  -- Chile
  WHEN 'santiago' THEN 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop'
  
  -- Peru
  WHEN 'lima' THEN 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=1920&h=1080&fit=crop'
  WHEN 'cusco' THEN 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1920&h=1080&fit=crop'
  
  -- Colombia
  WHEN 'bogota' THEN 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=1920&h=1080&fit=crop'
  WHEN 'cartagena' THEN 'https://images.unsplash.com/photo-1583531172005-763a22401990?w=1920&h=1080&fit=crop'
  
  ELSE hero_image_url
END
WHERE slug IN (
  'tokyo', 'osaka', 'kyoto', 'yokohama', 'hiroshima',
  'london', 'edinburgh', 'manchester', 'birmingham',
  'new-york', 'los-angeles', 'miami', 'las-vegas', 'san-francisco', 'chicago',
  'paris', 'nice', 'lyon', 'marseille',
  'berlin', 'munich', 'frankfurt', 'hamburg',
  'barcelona', 'madrid', 'seville', 'valencia',
  'rome', 'venice', 'milan', 'florence',
  'sydney', 'melbourne', 'brisbane', 'perth',
  'toronto', 'vancouver', 'montreal',
  'singapore-city',
  'kuala-lumpur', 'penang', 'langkawi',
  'seoul', 'busan', 'jeju',
  'amsterdam', 'rotterdam',
  'zurich', 'geneva', 'lucerne',
  'lisbon', 'porto',
  'athens', 'santorini',
  'istanbul', 'antalya', 'cappadocia',
  'rio-de-janeiro', 'sao-paulo',
  'mexico-city', 'cancun',
  'cairo', 'luxor',
  'cape-town', 'johannesburg',
  'auckland', 'queenstown',
  'dublin',
  'warsaw', 'krakow',
  'vienna', 'salzburg',
  'prague',
  'brussels', 'bruges',
  'oslo', 'bergen',
  'copenhagen',
  'helsinki',
  'beijing', 'shanghai', 'hong-kong-city',
  'taipei',
  'ho-chi-minh-city', 'hanoi', 'da-nang',
  'manila', 'cebu',
  'buenos-aires',
  'santiago',
  'lima', 'cusco',
  'bogota', 'cartagena'
);