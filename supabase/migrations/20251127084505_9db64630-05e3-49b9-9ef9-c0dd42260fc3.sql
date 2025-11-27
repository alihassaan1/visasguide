-- Enable realtime for activity_log table
ALTER TABLE activity_log REPLICA IDENTITY FULL;

-- Add activity_log to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;