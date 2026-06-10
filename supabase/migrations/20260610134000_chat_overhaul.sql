-- Drop the old messages table if it exists (along with any policies)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create public.users table to store anonymous user profile information
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  device_id TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  selected_team TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create public.messages table to store Chat Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  username TEXT NOT NULL,
  team TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 2 AND 300),
  reported_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'UNDER_REVIEW', 'HIDDEN', 'DELETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_created_at_idx ON public.messages (created_at DESC);

-- Create public.reports table to track user reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL, -- Username or device ID of reporter
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, reported_by)
);

-- Create public.moderation_logs table for audit trail
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL, -- 'message' or 'user'
  target_id TEXT NOT NULL, -- ID of the target resource
  action TEXT NOT NULL, -- 'report', 'auto_under_review', 'auto_hidden', 'delete', 'mute', 'ban', etc.
  performed_by TEXT NOT NULL, -- user identifier or 'system'
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS Configurations
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Policies for public.messages
CREATE POLICY "Enable read access for all messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for admins/mods or system actions" ON public.messages
  FOR UPDATE USING (true);

-- Policies for public.reports
CREATE POLICY "Enable read access for reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for reports" ON public.reports
  FOR INSERT WITH CHECK (true);

-- Policies for public.moderation_logs
CREATE POLICY "Enable read access for moderation logs" ON public.moderation_logs
  FOR SELECT USING (true);

-- Grants
GRANT SELECT, INSERT ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO anon, authenticated;
GRANT SELECT, INSERT ON public.reports TO anon, authenticated;
GRANT SELECT ON public.moderation_logs TO anon, authenticated;

-- Stored procedure to report a message safely
CREATE OR REPLACE FUNCTION public.report_message(_message_id UUID, _reported_by TEXT, _reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_reported_count INT;
  v_status TEXT;
BEGIN
  -- Insert the report, unique constraint handles preventing duplicates
  INSERT INTO public.reports (message_id, reported_by, reason)
  VALUES (_message_id, _reported_by, _reason);

  -- Increment reported_count in messages
  UPDATE public.messages
  SET reported_count = reported_count + 1
  WHERE id = _message_id
  RETURNING reported_count, status INTO v_reported_count, v_status;

  -- Check if thresholds are hit and transition status
  IF v_reported_count >= 5 AND v_status != 'HIDDEN' THEN
    UPDATE public.messages SET status = 'HIDDEN' WHERE id = _message_id;
    INSERT INTO public.moderation_logs (target_type, target_id, action, performed_by, details)
    VALUES ('message', _message_id::text, 'auto_hidden', 'system', 'Message reached 5 reports. Last reason: ' || _reason);
  ELSIF v_reported_count >= 3 AND v_status = 'NORMAL' THEN
    UPDATE public.messages SET status = 'UNDER_REVIEW' WHERE id = _message_id;
    INSERT INTO public.moderation_logs (target_type, target_id, action, performed_by, details)
    VALUES ('message', _message_id::text, 'auto_under_review', 'system', 'Message reached 3 reports. Last reason: ' || _reason);
  END IF;

  -- Log the moderation action (the report itself)
  INSERT INTO public.moderation_logs (target_type, target_id, action, performed_by, details)
  VALUES ('message', _message_id::text, 'report', _reported_by, _reason);
END;
$$;

GRANT EXECUTE ON FUNCTION public.report_message(UUID, TEXT, TEXT) TO anon, authenticated;
