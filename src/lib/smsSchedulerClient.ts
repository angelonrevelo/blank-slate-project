import { supabase } from "@/integrations/supabase/client";

// Types
export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  timezone: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SmsTemplate {
  id: string;
  user_id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface SmsSchedule {
  id: string;
  user_id: string;
  customer_id: string;
  template_id: string | null;
  message_body: string | null;
  status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  schedule_type: 'one_time' | 'recurring';
  next_run_at: string;
  recurrence_frequency: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_interval: number;
  recurrence_days_of_week: number[] | null;
  recurrence_end_at: string | null;
  max_retries: number;
  current_retry: number;
  last_run_at: string | null;
  last_error: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsLog {
  id: string;
  user_id: string;
  schedule_id: string | null;
  customer_id: string;
  status: 'success' | 'failed';
  message_body: string;
  sent_at: string;
  provider_name: string;
  provider_message_id: string | null;
  error_message: string | null;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  created_at: string;
}

// Helper Functions

/**
 * Create a new customer for SMS notifications
 */
export async function createCustomer(params: {
  name: string;
  phoneNumber: string;
  timezone?: string;
}): Promise<Customer> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a customer');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name: params.name,
      phone_number: params.phoneNumber,
      timezone: params.timezone || 'UTC',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

/**
 * Get all customers for the current user
 */
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

/**
 * Create a one-time SMS schedule
 */
export async function createSmsSchedule(params: {
  customerId: string;
  message: string;
  firstRunAt: string; // UTC ISO string
}): Promise<SmsSchedule> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create an SMS schedule');
  }

  const { data, error } = await supabase
    .from('sms_schedules')
    .insert({
      user_id: user.id,
      customer_id: params.customerId,
      message_body: params.message,
      schedule_type: 'one_time',
      next_run_at: params.firstRunAt,
      status: 'scheduled',
      max_retries: 3,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SmsSchedule;
}

/**
 * Get SMS logs for the current user, optionally filtered by customer
 */
export async function getSmsLogs(params?: {
  customerId?: string;
}): Promise<SmsLog[]> {
  let query = supabase
    .from('sms_logs')
    .select('*')
    .order('sent_at', { ascending: false });

  if (params?.customerId) {
    query = query.eq('customer_id', params.customerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as SmsLog[];
}

/**
 * Get all SMS schedules for the current user
 */
export async function getSchedules(): Promise<SmsSchedule[]> {
  const { data, error } = await supabase
    .from('sms_schedules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SmsSchedule[];
}

/**
 * Update an SMS schedule
 */
export async function updateSchedule(
  scheduleId: string,
  updates: Partial<SmsSchedule>
): Promise<SmsSchedule> {
  const { data, error } = await supabase
    .from('sms_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data as SmsSchedule;
}

/**
 * Delete an SMS schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const { error } = await supabase
    .from('sms_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  updates: {
    name?: string;
    phone_number?: string;
    timezone?: string;
  }
): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) throw error;
}
