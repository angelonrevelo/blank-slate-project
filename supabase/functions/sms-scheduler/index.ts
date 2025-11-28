import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsScheduleRow {
  id: string;
  user_id: string;
  customer_id: string;
  schedule_type: 'one_time' | 'recurring';
  message_body: string | null;
  template_id: string | null;
  next_run_at: string;
  last_run_at: string | null;
  recurrence_frequency: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_interval: number | null;
  recurrence_days_of_week: number[] | null;
  recurrence_end_at: string | null;
  status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  current_retry: number;
  max_retries: number;
  is_active: boolean;
}

interface CustomerRow {
  id: string;
  phone_number: string;
  name: string;
  timezone: string;
}

interface SmsTemplateRow {
  id: string;
  body: string;
}

interface DueSchedule {
  schedule: SmsScheduleRow;
  customer: CustomerRow;
  template: SmsTemplateRow | null;
}

interface SemaphoreResponse {
  message_id?: number;
  status?: string;
  message?: string;
}

function computeNextRunAt(
  schedule: SmsScheduleRow,
  lastRun: Date
): Date | null {
  if (schedule.schedule_type === 'one_time') {
    return null;
  }

  if (!schedule.recurrence_frequency || !schedule.recurrence_interval) {
    return null;
  }

  const next = new Date(lastRun);
  const freq = schedule.recurrence_frequency;
  const interval = schedule.recurrence_interval;

  switch (freq) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + interval * 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    default:
      return null;
  }

  if (schedule.recurrence_end_at) {
    const endAt = new Date(schedule.recurrence_end_at);
    if (next > endAt) {
      return null;
    }
  }

  return next;
}

async function sendSms(
  phoneNumber: string,
  message: string,
  apiKey: string,
  senderName: string
): Promise<SemaphoreResponse> {
  const url = 'https://api.semaphore.co/api/v4/messages';
  
  // Use form-urlencoded format as per Semaphore API docs
  const params = new URLSearchParams({
    apikey: apiKey,
    number: phoneNumber,
    message: message,
    sendername: senderName,
  });

  console.log(`[sendSms] Sending to ${phoneNumber}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const responseText = await response.text();
  console.log(`[sendSms] Response status: ${response.status}, body: ${responseText}`);

  if (!response.ok) {
    throw new Error(`Semaphore API error: ${response.status} ${responseText}`);
  }

  const responseData = JSON.parse(responseText);
  
  // Semaphore returns an array, extract first element
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0];
  }
  
  return responseData;
}

async function logFailure(
  supabase: any,
  schedule: SmsScheduleRow,
  customer: CustomerRow,
  message: string,
  errorMessage: string,
  requestPayload: any,
  responsePayload: any
) {
  await supabase.from('sms_logs').insert({
    user_id: schedule.user_id,
    customer_id: customer.id,
    schedule_id: schedule.id,
    status: 'failed',
    message_body: message,
    provider_name: 'semaphore',
    error_message: errorMessage,
    request_payload: requestPayload,
    response_payload: responsePayload,
  });
}

async function logSuccess(
  supabase: any,
  schedule: SmsScheduleRow,
  customer: CustomerRow,
  message: string,
  requestPayload: any,
  responsePayload: any
) {
  await supabase.from('sms_logs').insert({
    user_id: schedule.user_id,
    customer_id: customer.id,
    schedule_id: schedule.id,
    status: 'success',
    message_body: message,
    provider_name: 'semaphore',
    provider_message_id: responsePayload.message_id?.toString() || null,
    request_payload: requestPayload,
    response_payload: responsePayload,
  });
}

async function updateScheduleOnFailure(
  supabase: any,
  schedule: SmsScheduleRow,
  errorMessage: string
) {
  const newRetry = schedule.current_retry + 1;
  const maxRetries = schedule.max_retries;

  if (newRetry >= maxRetries) {
    console.log(`[updateScheduleOnFailure] Max retries reached for schedule ${schedule.id}`);
    await supabase
      .from('sms_schedules')
      .update({
        status: 'failed',
        last_error: errorMessage,
        current_retry: newRetry,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', schedule.id);
  } else {
    console.log(`[updateScheduleOnFailure] Retry ${newRetry}/${maxRetries} for schedule ${schedule.id}`);
    const nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + 5);

    await supabase
      .from('sms_schedules')
      .update({
        status: 'scheduled',
        last_error: errorMessage,
        current_retry: newRetry,
        next_run_at: nextRun.toISOString(),
        last_run_at: new Date().toISOString(),
      })
      .eq('id', schedule.id);
  }
}

async function updateScheduleOnSuccess(
  supabase: any,
  schedule: SmsScheduleRow
) {
  const now = new Date();
  const nextRun = computeNextRunAt(schedule, now);

  if (!nextRun) {
    console.log(`[updateScheduleOnSuccess] No next run, marking as sent for schedule ${schedule.id}`);
    await supabase
      .from('sms_schedules')
      .update({
        status: 'sent',
        current_retry: 0,
        last_error: null,
        last_run_at: now.toISOString(),
      })
      .eq('id', schedule.id);
  } else {
    console.log(`[updateScheduleOnSuccess] Next run at ${nextRun.toISOString()} for schedule ${schedule.id}`);
    await supabase
      .from('sms_schedules')
      .update({
        status: 'scheduled',
        current_retry: 0,
        last_error: null,
        next_run_at: nextRun.toISOString(),
        last_run_at: now.toISOString(),
      })
      .eq('id', schedule.id);
  }
}

async function processSchedule(
  supabase: any,
  dueSchedule: DueSchedule,
  apiKey: string,
  senderName: string
): Promise<boolean> {
  const { schedule, customer, template } = dueSchedule;

  console.log(`[processSchedule] Processing schedule ${schedule.id} for customer ${customer.name}`);

  const message = schedule.message_body || template?.body || '';
  if (!message) {
    console.error(`[processSchedule] No message for schedule ${schedule.id}`);
    await logFailure(
      supabase,
      schedule,
      customer,
      '',
      'No message or template body',
      null,
      null
    );
    await updateScheduleOnFailure(supabase, schedule, 'No message or template body');
    return false;
  }

  const requestPayload = {
    apikey: '***',
    number: customer.phone_number,
    message,
    sendername: senderName,
  };

  try {
    const result = await sendSms(customer.phone_number, message, apiKey, senderName);
    console.log(`[processSchedule] SMS sent successfully:`, result);

    await logSuccess(supabase, schedule, customer, message, requestPayload, result);
    await updateScheduleOnSuccess(supabase, schedule);
    return true;
  } catch (error: any) {
    console.error(`[processSchedule] Failed to send SMS:`, error);
    const errorMessage = error.message || 'Unknown error';

    await logFailure(
      supabase,
      schedule,
      customer,
      message,
      errorMessage,
      requestPayload,
      { error: errorMessage }
    );
    await updateScheduleOnFailure(supabase, schedule, errorMessage);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const semaphoreApiKey = Deno.env.get('SEMAPHORE_API_KEY');
    const senderName = Deno.env.get('SEMAPHORE_SENDER_NAME') || 'SEMAPHORE';
    const batchSize = parseInt(Deno.env.get('SCHEDULER_BATCH_SIZE') || '20', 10);

    if (!semaphoreApiKey) {
      throw new Error('SEMAPHORE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();
    console.log(`[main] Fetching due schedules (batch size: ${batchSize}, cutoff: ${now})`);

    const { data: schedules, error: schedulesError } = await supabase
      .from('sms_schedules')
      .select('*')
      .eq('status', 'scheduled')
      .eq('is_active', true)
      .lte('next_run_at', now)
      .limit(batchSize);

    if (schedulesError) {
      throw schedulesError;
    }

    if (!schedules || schedules.length === 0) {
      console.log('[main] No due schedules found');
      return new Response(
        JSON.stringify({ message: 'No due schedules', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[main] Found ${schedules.length} due schedule(s)`);

    const dueSchedules: DueSchedule[] = [];
    for (const schedule of schedules) {
      const lockUpdate = await supabase
        .from('sms_schedules')
        .update({ status: 'sending' })
        .eq('id', schedule.id)
        .eq('status', 'scheduled');

      if (lockUpdate.error) {
        console.log(`[main] Could not lock schedule ${schedule.id}, skipping`);
        continue;
      }

      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', schedule.customer_id)
        .single();

      if (!customer) {
        console.error(`[main] Customer not found for schedule ${schedule.id}`);
        await supabase
          .from('sms_schedules')
          .update({ status: 'failed', last_error: 'Customer not found' })
          .eq('id', schedule.id);
        continue;
      }

      let template = null;
      if (schedule.template_id) {
        const { data: tpl } = await supabase
          .from('sms_templates')
          .select('*')
          .eq('id', schedule.template_id)
          .single();
        template = tpl;
      }

      dueSchedules.push({ schedule, customer, template });
    }

    console.log(`[main] Processing ${dueSchedules.length} schedule(s)`);

    let successCount = 0;
    let failureCount = 0;

    for (const dueSchedule of dueSchedules) {
      const success = await processSchedule(
        supabase,
        dueSchedule,
        semaphoreApiKey,
        senderName
      );
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(`[main] Completed: ${successCount} success, ${failureCount} failure`);

    return new Response(
      JSON.stringify({
        message: 'SMS scheduler completed',
        processed: dueSchedules.length,
        success: successCount,
        failed: failureCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[main] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
