-- Add input_tokens and output_tokens columns to api_logs table
ALTER TABLE public.api_logs 
ADD COLUMN IF NOT EXISTS input_tokens integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS output_tokens integer DEFAULT NULL;