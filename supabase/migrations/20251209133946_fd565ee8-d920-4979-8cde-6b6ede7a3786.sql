-- Drop the broken trigger if it exists
DROP TRIGGER IF EXISTS update_visa_requirements_updated_at ON public.visa_requirements;

-- Create trigger using the correct column name 'last_updated'
CREATE OR REPLACE FUNCTION public.update_visa_requirements_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create the trigger with the correct function
CREATE TRIGGER update_visa_requirements_last_updated
BEFORE UPDATE ON public.visa_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_visa_requirements_last_updated();