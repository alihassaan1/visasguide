-- Insert sample countries with passport ranking data
INSERT INTO countries (
  code, name, flag_emoji, continent, region, capital, 
  language, currency, population, passport_rank, 
  passport_score, visa_free_destinations
) VALUES
-- Top 10 Most Powerful Passports
('SG', 'Singapore', '🇸🇬', 'Asia', 'Southeast Asia', 'Singapore', 'English', 'SGD', 5900000, 1, 195, 195),
('DE', 'Germany', '🇩🇪', 'Europe', 'Western Europe', 'Berlin', 'German', 'EUR', 83200000, 2, 194, 194),
('IT', 'Italy', '🇮🇹', 'Europe', 'Southern Europe', 'Rome', 'Italian', 'EUR', 59100000, 3, 193, 193),
('ES', 'Spain', '🇪🇸', 'Europe', 'Southern Europe', 'Madrid', 'Spanish', 'EUR', 47400000, 4, 192, 192),
('LU', 'Luxembourg', '🇱🇺', 'Europe', 'Western Europe', 'Luxembourg City', 'Luxembourgish', 'EUR', 640000, 5, 191, 191),
('AT', 'Austria', '🇦🇹', 'Europe', 'Western Europe', 'Vienna', 'German', 'EUR', 8900000, 6, 190, 190),
('FI', 'Finland', '🇫🇮', 'Europe', 'Northern Europe', 'Helsinki', 'Finnish', 'EUR', 5500000, 7, 189, 189),
('FR', 'France', '🇫🇷', 'Europe', 'Western Europe', 'Paris', 'French', 'EUR', 68000000, 8, 188, 188),
('IE', 'Ireland', '🇮🇪', 'Europe', 'Western Europe', 'Dublin', 'English', 'EUR', 5000000, 9, 187, 187),
('NL', 'Netherlands', '🇳🇱', 'Europe', 'Western Europe', 'Amsterdam', 'Dutch', 'EUR', 17500000, 10, 186, 186),
-- Additional European countries
('SE', 'Sweden', '🇸🇪', 'Europe', 'Northern Europe', 'Stockholm', 'Swedish', 'SEK', 10400000, 11, 185, 185),
('DK', 'Denmark', '🇩🇰', 'Europe', 'Northern Europe', 'Copenhagen', 'Danish', 'DKK', 5800000, 12, 184, 184),
('BE', 'Belgium', '🇧🇪', 'Europe', 'Western Europe', 'Brussels', 'Dutch', 'EUR', 11600000, 13, 183, 183),
('PT', 'Portugal', '🇵🇹', 'Europe', 'Southern Europe', 'Lisbon', 'Portuguese', 'EUR', 10300000, 14, 182, 182),
('NO', 'Norway', '🇳🇴', 'Europe', 'Northern Europe', 'Oslo', 'Norwegian', 'NOK', 5400000, 15, 181, 181),
('CH', 'Switzerland', '🇨🇭', 'Europe', 'Western Europe', 'Bern', 'German', 'CHF', 8700000, 16, 180, 180),
('GB', 'United Kingdom', '🇬🇧', 'Europe', 'Northern Europe', 'London', 'English', 'GBP', 67000000, 17, 179, 179),
('NZ', 'New Zealand', '🇳🇿', 'Oceania', 'Australia and New Zealand', 'Wellington', 'English', 'NZD', 5100000, 18, 178, 178),
('CZ', 'Czech Republic', '🇨🇿', 'Europe', 'Eastern Europe', 'Prague', 'Czech', 'CZK', 10700000, 19, 177, 177),
('GR', 'Greece', '🇬🇷', 'Europe', 'Southern Europe', 'Athens', 'Greek', 'EUR', 10700000, 20, 176, 176),
-- Major powers and other regions
('US', 'United States', '🇺🇸', 'North America', 'Northern America', 'Washington D.C.', 'English', 'USD', 331000000, 21, 175, 175),
('AU', 'Australia', '🇦🇺', 'Oceania', 'Australia and New Zealand', 'Canberra', 'English', 'AUD', 25700000, 22, 174, 174),
('MT', 'Malta', '🇲🇹', 'Europe', 'Southern Europe', 'Valletta', 'Maltese', 'EUR', 520000, 23, 173, 173),
('PL', 'Poland', '🇵🇱', 'Europe', 'Eastern Europe', 'Warsaw', 'Polish', 'PLN', 38000000, 24, 172, 172),
('HU', 'Hungary', '🇭🇺', 'Europe', 'Eastern Europe', 'Budapest', 'Hungarian', 'HUF', 9700000, 25, 171, 171),
('CA', 'Canada', '🇨🇦', 'North America', 'Northern America', 'Ottawa', 'English', 'CAD', 38000000, 26, 170, 170),
('JP', 'Japan', '🇯🇵', 'Asia', 'Eastern Asia', 'Tokyo', 'Japanese', 'JPY', 125000000, 27, 169, 169),
('SK', 'Slovakia', '🇸🇰', 'Europe', 'Eastern Europe', 'Bratislava', 'Slovak', 'EUR', 5500000, 28, 168, 168),
('LT', 'Lithuania', '🇱🇹', 'Europe', 'Northern Europe', 'Vilnius', 'Lithuanian', 'EUR', 2800000, 29, 167, 167),
('SI', 'Slovenia', '🇸🇮', 'Europe', 'Southern Europe', 'Ljubljana', 'Slovenian', 'EUR', 2100000, 30, 166, 166),
-- Asia-Pacific
('KR', 'South Korea', '🇰🇷', 'Asia', 'Eastern Asia', 'Seoul', 'Korean', 'KRW', 51800000, 31, 165, 165),
('EE', 'Estonia', '🇪🇪', 'Europe', 'Northern Europe', 'Tallinn', 'Estonian', 'EUR', 1300000, 32, 164, 164),
('LV', 'Latvia', '🇱🇻', 'Europe', 'Northern Europe', 'Riga', 'Latvian', 'EUR', 1900000, 33, 163, 163),
('IS', 'Iceland', '🇮🇸', 'Europe', 'Northern Europe', 'Reykjavik', 'Icelandic', 'ISK', 370000, 34, 162, 162),
('MY', 'Malaysia', '🇲🇾', 'Asia', 'Southeast Asia', 'Kuala Lumpur', 'Malay', 'MYR', 33000000, 35, 161, 161),
-- Latin America
('CL', 'Chile', '🇨🇱', 'South America', 'South America', 'Santiago', 'Spanish', 'CLP', 19500000, 36, 160, 160),
('BR', 'Brazil', '🇧🇷', 'South America', 'South America', 'Brasília', 'Portuguese', 'BRL', 215000000, 37, 159, 159),
('AR', 'Argentina', '🇦🇷', 'South America', 'South America', 'Buenos Aires', 'Spanish', 'ARS', 45400000, 38, 158, 158),
('UY', 'Uruguay', '🇺🇾', 'South America', 'South America', 'Montevideo', 'Spanish', 'UYU', 3500000, 39, 157, 157),
('MX', 'Mexico', '🇲🇽', 'North America', 'Central America', 'Mexico City', 'Spanish', 'MXN', 128000000, 40, 156, 156),
-- Middle East
('AE', 'United Arab Emirates', '🇦🇪', 'Asia', 'Western Asia', 'Abu Dhabi', 'Arabic', 'AED', 9900000, 41, 155, 155),
('IL', 'Israel', '🇮🇱', 'Asia', 'Western Asia', 'Jerusalem', 'Hebrew', 'ILS', 9500000, 42, 154, 154),
('QA', 'Qatar', '🇶🇦', 'Asia', 'Western Asia', 'Doha', 'Arabic', 'QAR', 2900000, 43, 153, 153),
('KW', 'Kuwait', '🇰🇼', 'Asia', 'Western Asia', 'Kuwait City', 'Arabic', 'KWD', 4300000, 44, 152, 152),
('SA', 'Saudi Arabia', '🇸🇦', 'Asia', 'Western Asia', 'Riyadh', 'Arabic', 'SAR', 35000000, 45, 151, 151),
-- Africa
('ZA', 'South Africa', '🇿🇦', 'Africa', 'Southern Africa', 'Cape Town', 'English', 'ZAR', 60000000, 46, 150, 150),
('MU', 'Mauritius', '🇲🇺', 'Africa', 'Eastern Africa', 'Port Louis', 'English', 'MUR', 1300000, 47, 149, 149),
('BW', 'Botswana', '🇧🇼', 'Africa', 'Southern Africa', 'Gaborone', 'English', 'BWP', 2400000, 48, 148, 148),
-- Asia
('CN', 'China', '🇨🇳', 'Asia', 'Eastern Asia', 'Beijing', 'Chinese', 'CNY', 1440000000, 49, 147, 147),
('IN', 'India', '🇮🇳', 'Asia', 'Southern Asia', 'New Delhi', 'Hindi', 'INR', 1380000000, 50, 146, 146);