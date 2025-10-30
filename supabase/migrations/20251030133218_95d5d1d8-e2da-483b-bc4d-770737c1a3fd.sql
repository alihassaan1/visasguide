-- Add RLS policies for visa_requirements management by admins

-- Allow admins to insert visa requirements
CREATE POLICY "Admins can insert visa requirements"
ON public.visa_requirements
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update visa requirements
CREATE POLICY "Admins can update visa requirements"
ON public.visa_requirements
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete visa requirements
CREATE POLICY "Admins can delete visa requirements"
ON public.visa_requirements
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));