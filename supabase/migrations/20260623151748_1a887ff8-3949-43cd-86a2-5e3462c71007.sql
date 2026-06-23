
CREATE TABLE IF NOT EXISTS public.policy_detector_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger TEXT,
  scanned INTEGER NOT NULL DEFAULT 0,
  detected INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  details JSONB
);
GRANT SELECT ON public.policy_detector_runs TO authenticated;
GRANT ALL ON public.policy_detector_runs TO service_role;
ALTER TABLE public.policy_detector_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view detector runs"
  ON public.policy_detector_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_policy_detector_runs_run_at ON public.policy_detector_runs(run_at DESC);
