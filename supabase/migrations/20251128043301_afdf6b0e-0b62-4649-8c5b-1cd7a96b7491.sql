-- Create enum types for SMS scheduler
CREATE TYPE sms_schedule_status AS ENUM (
  'pending', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'
);

CREATE TYPE sms_log_status AS ENUM ('success', 'failed');

CREATE TYPE sms_schedule_type AS ENUM ('one_time', 'recurring');

CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly');

-- Create helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sms_templates table
CREATE TABLE public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sms_schedules table
CREATE TABLE public.sms_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.sms_templates(id) ON DELETE SET NULL,
  message_body text,
  status sms_schedule_status NOT NULL DEFAULT 'scheduled',
  schedule_type sms_schedule_type NOT NULL DEFAULT 'one_time',
  next_run_at timestamptz NOT NULL,
  recurrence_frequency recurrence_frequency,
  recurrence_interval integer DEFAULT 1,
  recurrence_days_of_week smallint[],
  recurrence_end_at timestamptz,
  max_retries integer NOT NULL DEFAULT 3,
  current_retry integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  last_error text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sms_logs table
CREATE TABLE public.sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES public.sms_schedules(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status sms_log_status NOT NULL,
  message_body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  provider_name text NOT NULL DEFAULT 'semaphore',
  provider_message_id text,
  error_message text,
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes on user_id for all tables
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_sms_templates_user_id ON public.sms_templates(user_id);
CREATE INDEX idx_sms_schedules_user_id ON public.sms_schedules(user_id);
CREATE INDEX idx_sms_logs_user_id ON public.sms_logs(user_id);

-- Create additional indexes for sms_schedules (for efficient scheduler queries)
CREATE INDEX idx_sms_schedules_next_run_at ON public.sms_schedules(next_run_at);
CREATE INDEX idx_sms_schedules_status ON public.sms_schedules(status);

-- Create additional indexes for sms_logs
CREATE INDEX idx_sms_logs_schedule_id ON public.sms_logs(schedule_id);
CREATE INDEX idx_sms_logs_customer_id ON public.sms_logs(customer_id);

-- Create triggers for updated_at columns
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_sms_templates_updated_at
  BEFORE UPDATE ON public.sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_sms_schedules_updated_at
  BEFORE UPDATE ON public.sms_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Enable Row Level Security on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sms_templates
CREATE POLICY "Users can view their own templates"
  ON public.sms_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.sms_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.sms_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.sms_templates FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sms_schedules
CREATE POLICY "Users can view their own schedules"
  ON public.sms_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON public.sms_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.sms_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.sms_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sms_logs (read-only for clients)
CREATE POLICY "Users can view their own logs"
  ON public.sms_logs FOR SELECT
  USING (auth.uid() = user_id);