-- Add enhanced content fields to cities table for Phase 3
ALTER TABLE public.cities 
ADD COLUMN IF NOT EXISTS best_time_to_visit text,
ADD COLUMN IF NOT EXISTS safety_tips text,
ADD COLUMN IF NOT EXISTS getting_around text,
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;