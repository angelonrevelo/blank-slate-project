/**
 * SMS Scheduler Script
 *
 * This script runs as a scheduled job (cron) to:
 * - Query `sms_schedules` for due messages
 * - Send them via Semaphore SMS API
 * - Write delivery logs into `sms_logs`
 * - Update `sms_schedules` status, retries, and `next_run_at`
 *
 * Environment variables:
 * - SUPABASE_URL (required)
 * - SUPABASE_SERVICE_ROLE_KEY (required)
 * - SEMAPHORE_API_KEY (required)
 * - SEMAPHORE_SENDER_NAME (optional, default: "SEMAPHORE")
 * - SCHEDULER_BATCH_SIZE (optional, default: 20)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Environment Variables
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY;
const SEMAPHORE_SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE";
const SCHEDULER_BATCH_SIZE = parseInt(
  process.env.SCHEDULER_BATCH_SIZE || "20",
  10
);

// ============================================================================
// Types
// ============================================================================

interface SmsScheduleRow {
  id: string;
  user_id: string;
  customer_id: string;
  template_id: string | null;
  message_body: string | null;
  status: string;
  schedule_type: "one_time" | "recurring";
  next_run_at: string;
  recurrence_frequency: "daily" | "weekly" | "monthly" | null;
  recurrence_interval: number | null;
  recurrence_days_of_week: number[] | null;
  recurrence_end_at: string | null;
  max_retries: number;
  current_retry: number;
  last_run_at: string | null;
  last_error: string | null;
  is_active: boolean;
}

interface CustomerRow {
  id: string;
  phone_number: string;
}

interface SmsTemplateRow {
  id: string;
  body: string;
}

interface DueSchedule extends SmsScheduleRow {
  customers: CustomerRow | null;
  sms_templates: SmsTemplateRow | null;
}

interface SemaphoreResponse {
  message_id?: string;
  error?: string;
  [key: string]: unknown;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute the next run date based on recurrence settings
 */
function computeNextRunAt(
  schedule: SmsScheduleRow,
  now: Date
): Date | null {
  // One-time schedules have no next run
  if (schedule.schedule_type === "one_time") {
    return null;
  }

  // Must have recurrence_frequency for recurring schedules
  if (!schedule.recurrence_frequency) {
    return null;
  }

  const interval = schedule.recurrence_interval ?? 1;
  let nextRun = new Date(now);

  switch (schedule.recurrence_frequency) {
    case "daily":
      nextRun.setDate(nextRun.getDate() + interval);
      break;

    case "weekly":
      if (
        schedule.recurrence_days_of_week &&
        schedule.recurrence_days_of_week.length > 0
      ) {
        // Find the next matching day of week
        const daysOfWeek = schedule.recurrence_days_of_week.sort(
          (a, b) => a - b
        );
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

        // Look for next day in current week
        let foundNextDay = false;
        for (const day of daysOfWeek) {
          if (day > currentDay) {
            nextRun.setDate(nextRun.getDate() + (day - currentDay));
            foundNextDay = true;
            break;
          }
        }

        // If not found, go to first day of next week cycle
        if (!foundNextDay) {
          const daysUntilNextCycle = 7 * interval - currentDay + daysOfWeek[0];
          nextRun.setDate(nextRun.getDate() + daysUntilNextCycle);
        }
      } else {
        // No specific days, just add weeks
        nextRun.setDate(nextRun.getDate() + 7 * interval);
      }
      break;

    case "monthly":
      nextRun.setMonth(nextRun.getMonth() + interval);
      break;

    default:
      return null;
  }

  // Check if next run exceeds recurrence_end_at
  if (schedule.recurrence_end_at) {
    const endDate = new Date(schedule.recurrence_end_at);
    if (nextRun > endDate) {
      return null;
    }
  }

  return nextRun;
}

/**
 * Send SMS via Semaphore API
 */
async function sendSms(
  phoneNumber: string,
  messageBody: string,
  apiKey: string,
  senderName: string
): Promise<{ success: boolean; response: SemaphoreResponse; messageId?: string }> {
  const url = "https://api.semaphore.co/api/v4/messages";

  const formData = new URLSearchParams();
  formData.append("apikey", apiKey);
  formData.append("number", phoneNumber);
  formData.append("message", messageBody);
  formData.append("sendername", senderName);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const responseData = (await response.json()) as SemaphoreResponse | SemaphoreResponse[];

  // Semaphore returns an array on success
  const responseObj = Array.isArray(responseData) ? responseData[0] : responseData;

  if (!response.ok) {
    const errorMessage =
      responseObj?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return {
    success: true,
    response: responseObj ?? {},
    messageId: responseObj?.message_id?.toString(),
  };
}

/**
 * Log a failed SMS attempt to sms_logs
 */
async function logFailure(
  supabase: SupabaseClient,
  schedule: DueSchedule,
  messageBody: string,
  errorMessage: string,
  requestPayload: Record<string, unknown>,
  responsePayload?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("sms_logs").insert({
    user_id: schedule.user_id,
    schedule_id: schedule.id,
    customer_id: schedule.customer_id,
    status: "failed",
    message_body: messageBody,
    provider_name: "semaphore",
    error_message: errorMessage,
    request_payload: requestPayload,
    response_payload: responsePayload ?? null,
  });

  if (error) {
    console.error(`Failed to insert failure log for schedule ${schedule.id}:`, error);
  }
}

/**
 * Log a successful SMS send to sms_logs
 */
async function logSuccess(
  supabase: SupabaseClient,
  schedule: DueSchedule,
  messageBody: string,
  requestPayload: Record<string, unknown>,
  responsePayload: Record<string, unknown>,
  messageId?: string
): Promise<void> {
  const { error } = await supabase.from("sms_logs").insert({
    user_id: schedule.user_id,
    schedule_id: schedule.id,
    customer_id: schedule.customer_id,
    status: "success",
    message_body: messageBody,
    provider_name: "semaphore",
    provider_message_id: messageId ?? null,
    request_payload: requestPayload,
    response_payload: responsePayload,
  });

  if (error) {
    console.error(`Failed to insert success log for schedule ${schedule.id}:`, error);
  }
}

/**
 * Update schedule status after failure
 */
async function updateScheduleOnFailure(
  supabase: SupabaseClient,
  schedule: SmsScheduleRow,
  errorMessage: string
): Promise<void> {
  const newRetry = schedule.current_retry + 1;
  const canRetry = newRetry <= schedule.max_retries;

  const updateData = canRetry
    ? {
        status: "scheduled" as const,
        current_retry: newRetry,
        last_error: errorMessage,
      }
    : {
        status: "failed" as const,
        current_retry: newRetry,
        last_error: errorMessage,
      };

  const { error } = await supabase
    .from("sms_schedules")
    .update(updateData)
    .eq("id", schedule.id);

  if (error) {
    console.error(`Failed to update schedule ${schedule.id} on failure:`, error);
  }
}

/**
 * Update schedule status after success
 */
async function updateScheduleOnSuccess(
  supabase: SupabaseClient,
  schedule: SmsScheduleRow,
  now: Date
): Promise<void> {
  const nextRun = computeNextRunAt(schedule, now);

  const updateData = nextRun
    ? {
        status: "scheduled" as const,
        next_run_at: nextRun.toISOString(),
        current_retry: 0,
        last_error: null,
      }
    : {
        status: "sent" as const,
        next_run_at: null,
        current_retry: 0,
        last_error: null,
      };

  const { error } = await supabase
    .from("sms_schedules")
    .update(updateData)
    .eq("id", schedule.id);

  if (error) {
    console.error(`Failed to update schedule ${schedule.id} on success:`, error);
  }
}

/**
 * Process a single schedule: lock, send, log, update
 */
async function processSchedule(
  supabase: SupabaseClient,
  schedule: DueSchedule,
  apiKey: string,
  senderName: string
): Promise<void> {
  const now = new Date();

  // 1. Attempt to lock the schedule by updating status from 'scheduled' to 'sending'
  const { data: lockedData, error: lockError } = await supabase
    .from("sms_schedules")
    .update({
      status: "sending",
      last_run_at: now.toISOString(),
    })
    .eq("id", schedule.id)
    .eq("status", "scheduled")
    .select("id")
    .single();

  if (lockError || !lockedData) {
    console.log(`Skipping schedule ${schedule.id}: could not acquire lock (possibly already processed)`);
    return;
  }

  // 2. Resolve message body
  let messageBody: string | null = null;
  if (schedule.template_id && schedule.sms_templates?.body) {
    messageBody = schedule.sms_templates.body;
  } else if (schedule.message_body) {
    messageBody = schedule.message_body;
  }

  if (!messageBody) {
    const errorMsg = "No message body available (no template body or message_body)";
    console.error(`Schedule ${schedule.id}: ${errorMsg}`);
    await logFailure(supabase, schedule, "", errorMsg, {});
    await supabase
      .from("sms_schedules")
      .update({ status: "failed", last_error: errorMsg })
      .eq("id", schedule.id);
    return;
  }

  // 3. Ensure customer phone number exists
  const phoneNumber = schedule.customers?.phone_number;
  if (!phoneNumber) {
    const errorMsg = "Customer phone number not found";
    console.error(`Schedule ${schedule.id}: ${errorMsg}`);
    await logFailure(supabase, schedule, messageBody, errorMsg, {});
    await supabase
      .from("sms_schedules")
      .update({ status: "failed", last_error: errorMsg })
      .eq("id", schedule.id);
    return;
  }

  // 4. Send SMS via Semaphore
  const requestPayload = {
    to: phoneNumber,
    body: messageBody,
    sender: senderName,
  };

  try {
    const result = await sendSms(phoneNumber, messageBody, apiKey, senderName);
    console.log(`Schedule ${schedule.id}: SMS sent successfully`);

    // 5. Log success and update schedule
    await logSuccess(
      supabase,
      schedule,
      messageBody,
      requestPayload,
      result.response as Record<string, unknown>,
      result.messageId
    );
    await updateScheduleOnSuccess(supabase, schedule, now);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Schedule ${schedule.id}: SMS send failed - ${errorMessage}`);

    // 6. Log failure and update schedule
    await logFailure(supabase, schedule, messageBody, errorMessage, requestPayload);
    await updateScheduleOnFailure(supabase, schedule, errorMessage);
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  console.log("SMS Scheduler starting...");

  // Validate required environment variables
  if (!SUPABASE_URL) {
    console.error("Missing required environment variable: SUPABASE_URL");
    process.exit(1);
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!SEMAPHORE_API_KEY) {
    console.error("Missing required environment variable: SEMAPHORE_API_KEY");
    process.exit(1);
  }

  console.log(`Config: batch_size=${SCHEDULER_BATCH_SIZE}, sender_name=${SEMAPHORE_SENDER_NAME}`);

  // Create Supabase client with service role key (no persisted session)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Fetch due schedules
  const now = new Date().toISOString();
  console.log(`Fetching due schedules (next_run_at <= ${now})...`);

  const { data: schedules, error: fetchError } = await supabase
    .from("sms_schedules")
    .select(
      `
      *,
      customers (id, phone_number),
      sms_templates (id, body)
    `
    )
    .eq("status", "scheduled")
    .eq("is_active", true)
    .lte("next_run_at", now)
    .order("next_run_at", { ascending: true })
    .limit(SCHEDULER_BATCH_SIZE);

  if (fetchError) {
    console.error("Failed to fetch due schedules:", fetchError);
    process.exit(1);
  }

  const dueSchedules = schedules as DueSchedule[] | null;

  if (!dueSchedules || dueSchedules.length === 0) {
    console.log("No due schedules found. Exiting.");
    process.exit(0);
  }

  console.log(`Found ${dueSchedules.length} due schedule(s). Processing...`);

  // Process each schedule
  for (const schedule of dueSchedules) {
    try {
      await processSchedule(supabase, schedule, SEMAPHORE_API_KEY, SEMAPHORE_SENDER_NAME);
    } catch (err) {
      console.error(`Unexpected error processing schedule ${schedule.id}:`, err);
    }
  }

  console.log("SMS Scheduler completed.");
  process.exit(0);
}

// Run the scheduler
main().catch((err) => {
  console.error("Fatal error in SMS Scheduler:", err);
  process.exit(1);
});
