-- Create table for tracking SEO crawl alerts and historical data
CREATE TABLE seo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seo_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can manage SEO alerts
CREATE POLICY "Admins can manage SEO alerts"
  ON seo_alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_seo_alerts_created_at ON seo_alerts(created_at DESC);
CREATE INDEX idx_seo_alerts_is_resolved ON seo_alerts(is_resolved);