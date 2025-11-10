-- Allow moderators and admins to create and manage content pages
CREATE POLICY "Moderators can create content pages"
ON public.content_pages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Moderators can update their own content pages"
ON public.content_pages
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (has_role(auth.uid(), 'moderator'::app_role) AND author_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (has_role(auth.uid(), 'moderator'::app_role) AND author_id = auth.uid())
);

CREATE POLICY "Moderators can delete their own content pages"
ON public.content_pages
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (has_role(auth.uid(), 'moderator'::app_role) AND author_id = auth.uid())
);