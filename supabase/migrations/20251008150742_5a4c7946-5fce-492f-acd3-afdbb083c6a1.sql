-- Insert sample visa requirements data for United States passport holders
-- This will populate the visa-free countries page with realistic data

-- Get the United States country ID
DO $$
DECLARE
  us_id uuid;
  uk_id uuid;
  ca_id uuid;
  au_id uuid;
  jp_id uuid;
  de_id uuid;
  fr_id uuid;
  it_id uuid;
  es_id uuid;
  sg_id uuid;
BEGIN
  -- Get country IDs
  SELECT id INTO us_id FROM countries WHERE code = 'US';
  SELECT id INTO uk_id FROM countries WHERE code = 'GB';
  SELECT id INTO ca_id FROM countries WHERE code = 'CA';
  SELECT id INTO au_id FROM countries WHERE code = 'AU';
  SELECT id INTO jp_id FROM countries WHERE code = 'JP';
  SELECT id INTO de_id FROM countries WHERE code = 'DE';
  SELECT id INTO fr_id FROM countries WHERE code = 'FR';
  SELECT id INTO it_id FROM countries WHERE code = 'IT';
  SELECT id INTO es_id FROM countries WHERE code = 'ES';
  SELECT id INTO sg_id FROM countries WHERE code = 'SG';

  -- Only insert if US exists and there's no data yet
  IF us_id IS NOT NULL THEN
    -- Visa Free destinations for US passport holders
    INSERT INTO visa_requirements (from_country_id, to_country_id, requirement_type, max_stay_days) VALUES
    (us_id, uk_id, 'visa_free', 180),
    (us_id, ca_id, 'visa_free', 180),
    (us_id, jp_id, 'visa_free', 90),
    (us_id, de_id, 'visa_free', 90),
    (us_id, fr_id, 'visa_free', 90),
    (us_id, it_id, 'visa_free', 90),
    (us_id, es_id, 'visa_free', 90),
    (us_id, sg_id, 'visa_free', 90)
    ON CONFLICT DO NOTHING;

    -- Visa on Arrival for US passport holders
    INSERT INTO visa_requirements (from_country_id, to_country_id, requirement_type, max_stay_days) 
    SELECT us_id, id, 'visa_on_arrival', 30
    FROM countries 
    WHERE code IN ('EG', 'JO', 'KE', 'MV', 'TH', 'TR')
    ON CONFLICT DO NOTHING;

    -- E-Visa required for US passport holders
    INSERT INTO visa_requirements (from_country_id, to_country_id, requirement_type, max_stay_days)
    SELECT us_id, id, 'eTA_required', 90
    FROM countries
    WHERE code IN ('AU', 'IN', 'KR', 'LK', 'NZ')
    ON CONFLICT DO NOTHING;

    -- Visa Required for US passport holders
    INSERT INTO visa_requirements (from_country_id, to_country_id, requirement_type, processing_time_days)
    SELECT us_id, id, 'visa_required', 14
    FROM countries
    WHERE code IN ('CN', 'RU', 'CU', 'IR', 'AF', 'SY')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add some data for other major countries too
  IF uk_id IS NOT NULL AND us_id IS NOT NULL THEN
    -- UK passport holders can visit US visa-free
    INSERT INTO visa_requirements (from_country_id, to_country_id, requirement_type, max_stay_days) VALUES
    (uk_id, us_id, 'eTA_required', 90),
    (uk_id, ca_id, 'visa_free', 180),
    (uk_id, au_id, 'eTA_required', 90)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;