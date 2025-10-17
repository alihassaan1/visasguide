-- Add html_embed column to settings_affiliates table
ALTER TABLE public.settings_affiliates
ADD COLUMN IF NOT EXISTS html_embed TEXT;

-- Update existing position values to match new format
UPDATE public.settings_affiliates 
SET position = 'sidebar-right' 
WHERE position = 'sidebar';

-- Add comment
COMMENT ON COLUMN public.settings_affiliates.html_embed IS 'HTML embed code for affiliate banners (e.g., GetYourGuide widgets)';