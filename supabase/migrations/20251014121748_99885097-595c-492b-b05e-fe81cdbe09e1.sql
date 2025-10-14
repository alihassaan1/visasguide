-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country_of_interest TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribed_at ON public.newsletter_subscribers(subscribed_at DESC);