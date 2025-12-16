-- Add travel volume statistics columns to countries table
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS annual_tourists bigint;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS tourism_rank integer;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS tourism_revenue_usd bigint;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS top_source_countries text[];
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS peak_travel_months text;
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS tourism_growth_percent numeric;