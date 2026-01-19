import { supabase } from "../db/client.js";
import type { Segment, SegmentType } from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface LogSegmentInput {
  intended_type: SegmentType;
  start_time: string;
  duration_minutes: number;
  focus_score: number;
  completed?: boolean;
  description?: string;
  notes?: string;
  trello_card_id?: string;
}

export interface LogSegmentResult {
  segment: Segment;
  message: string;
}

/**
 * Parse a flexible time input into an ISO timestamp
 * Supports: ISO string, "HH:MM", "X hours ago", "X minutes ago"
 */
function parseStartTime(input: string): string {
  const now = new Date();

  // Check for relative time patterns
  const hoursAgoMatch = input.match(/^(\d+)\s*hours?\s*ago$/i);
  if (hoursAgoMatch) {
    const hours = parseInt(hoursAgoMatch[1], 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  }

  const minutesAgoMatch = input.match(/^(\d+)\s*minutes?\s*ago$/i);
  if (minutesAgoMatch) {
    const minutes = parseInt(minutesAgoMatch[1], 10);
    return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
  }

  // Check for HH:MM format (assumes today)
  const timeMatch = input.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3]?.toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);
    return result.toISOString();
  }

  // Try parsing as ISO string or other standard format
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  throw new Error(
    `Could not parse start_time: "${input}". Use ISO format, "HH:MM", "X hours ago", or "X minutes ago".`
  );
}

/**
 * Get the date portion (YYYY-MM-DD) from a timestamp in PST
 */
function getDateFromTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/**
 * veto_log_segment: Log a completed segment retroactively
 *
 * Use this when you forgot to start/end a segment and want to log it after the fact.
 */
export async function vetoLogSegment(
  input: LogSegmentInput
): Promise<LogSegmentResult> {
  const {
    intended_type,
    start_time,
    duration_minutes,
    focus_score,
    completed = true,
    description,
    notes,
    trello_card_id,
  } = input;

  // Validate focus score
  if (focus_score < 1 || focus_score > 10) {
    throw new Error("Focus score must be between 1 and 10");
  }

  // Validate duration
  if (duration_minutes < 1 || duration_minutes > 1440) {
    throw new Error("Duration must be between 1 and 1440 minutes (24 hours)");
  }

  // Parse the flexible start time input
  const parsedStartTime = parseStartTime(start_time);

  // Calculate end time from start + duration
  const startDate = new Date(parsedStartTime);
  const endDate = new Date(startDate.getTime() + duration_minutes * 60 * 1000);
  const endTime = endDate.toISOString();

  // Get the date for this segment (based on start time, in PST)
  const segmentDate = getDateFromTimestamp(parsedStartTime);

  // Insert the completed segment
  const { data, error } = await supabase
    .from("segments")
    .insert({
      date: segmentDate,
      intended_type,
      description: description || null,
      start_time: parsedStartTime,
      end_time: endTime,
      completed,
      focus_score,
      override_flag: false,
      state_log_id: null,
      trello_card_id: trello_card_id || null,
      notes: notes ? `[Logged retroactively] ${notes}` : "[Logged retroactively]",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log segment: ${error.message}`);
  }

  const segment = data as Segment;

  const focusText =
    focus_score >= 7 ? "good focus" : focus_score >= 5 ? "moderate focus" : "low focus";

  return {
    segment,
    message: `${intended_type.toUpperCase()} segment logged (${duration_minutes} min, ${focusText}).`,
  };
}
