-- Create API logs table for tracking all API calls
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  api_provider TEXT NOT NULL, -- 'deepseek', 'rapidapi', 'openai', etc.
  endpoint TEXT, -- API endpoint called
  task_type TEXT, -- 'blog_generation', 'ctr_optimization', 'visa_enrichment', etc.
  entity_name TEXT, -- Country name, article title, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'success', 'error', 'timeout', 'pending'
  response_time_ms INTEGER, -- Response time in milliseconds
  tokens_used INTEGER,
  error_message TEXT,
  request_payload JSONB,
  response_summary JSONB,
  retry_count INTEGER DEFAULT 0
);

-- Add index for faster queries
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX idx_api_logs_status ON public.api_logs(status);
CREATE INDEX idx_api_logs_api_provider ON public.api_logs(api_provider);
CREATE INDEX idx_api_logs_task_type ON public.api_logs(task_type);

-- Enable RLS but allow service role full access
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
CREATE POLICY "Admins can view API logs"
ON public.api_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);