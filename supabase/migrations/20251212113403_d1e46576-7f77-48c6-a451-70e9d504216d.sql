-- Add additional passport index columns
ALTER TABLE public.countries 
ADD COLUMN IF NOT EXISTS eta_destinations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS passport_free_destinations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS voa_destinations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS evisa_destinations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS visa_required_destinations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS entry_ban_destinations integer DEFAULT 0;