-- Add slug column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS slug text;

-- Create slugs from country names (lowercase, replace spaces with hyphens)
UPDATE countries 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));

-- Remove trailing/leading hyphens
UPDATE countries 
SET slug = trim(both '-' from slug);

-- Make slug unique and not null
ALTER TABLE countries ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS countries_slug_idx ON countries(slug);