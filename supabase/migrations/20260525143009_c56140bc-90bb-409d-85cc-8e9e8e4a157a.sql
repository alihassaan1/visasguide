-- Add positions array column
ALTER TABLE public.settings_affiliates
ADD COLUMN IF NOT EXISTS positions text[] NOT NULL DEFAULT '{}'::text[];

-- Migrate sidebar-left -> sidebar-right (no left sidebar on the site)
UPDATE public.settings_affiliates
SET position = 'sidebar-right'
WHERE position = 'sidebar-left';

-- Backfill positions from the legacy single position column
UPDATE public.settings_affiliates
SET positions = ARRAY[position]
WHERE (positions IS NULL OR cardinality(positions) = 0) AND position IS NOT NULL;

-- GIN index for fast array containment lookups
CREATE INDEX IF NOT EXISTS settings_affiliates_positions_gin
ON public.settings_affiliates USING GIN (positions);