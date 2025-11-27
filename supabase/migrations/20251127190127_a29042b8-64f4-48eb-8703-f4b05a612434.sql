-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'surgery_scheduled',
  'clearance_pending',
  'followup_due',
  'patient_assigned',
  'system'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  branch TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Add user_preferences column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_preferences JSONB DEFAULT '{
  "notifications": {
    "task_assigned": true,
    "surgery_scheduled": true,
    "clearance_pending": true,
    "followup_due": true,
    "patient_assigned": true,
    "system": true
  },
  "display": {
    "viewMode": "comfortable",
    "itemsPerPage": 20
  },
  "general": {
    "autoRefresh": false,
    "soundAlerts": true
  }
}'::jsonb;

-- Trigger function for task assignment notifications
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, branch)
    SELECT 
      NEW.assigned_to,
      'task_assigned',
      'New Task Assigned',
      'You have been assigned to patient intake',
      '/my-tasks',
      NEW.branch
    WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.assigned_to);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER intake_task_assigned
  AFTER INSERT OR UPDATE OF assigned_to ON public.intakes
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();

-- Trigger function for surgery scheduled notifications
CREATE OR REPLACE FUNCTION notify_surgery_scheduled()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify surgeon
    IF NEW.surgeon_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, branch)
      SELECT 
        NEW.surgeon_id,
        'surgery_scheduled',
        'Surgery Scheduled',
        'Surgery scheduled for ' || TO_CHAR(NEW.scheduled_date, 'Mon DD, YYYY'),
        '/surgery',
        NEW.branch
      WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.surgeon_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER surgery_scheduled
  AFTER INSERT ON public.surgeries
  FOR EACH ROW
  EXECUTE FUNCTION notify_surgery_scheduled();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;