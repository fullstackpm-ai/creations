import { supabase } from "../db/client.js";
import type { Segment, SegmentType } from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface StartSegmentInput {
  intended_type: SegmentType;
  description?: string;
  state_log_id?: string;
}

export interface StartSegmentResult {
  segment: Segment;
  message: string;
}

/**
 * Check if there's an active (unclosed) segment
 */
async function getActiveSegment(): Promise<Segment | null> {
  const { data, error } = await supabase
    .from("segments")
    .select("*")
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Segment;
}

/**
 * veto_start_segment: Begin tracking a work segment
 *
 * Creates a new segment record with start time. Must be closed with veto_end_segment.
 */
export async function vetoStartSegment(
  input: StartSegmentInput
): Promise<StartSegmentResult> {
  const { intended_type, description, state_log_id } = input;

  // Check for active segment
  const activeSegment = await getActiveSegment();
  if (activeSegment) {
    throw new Error(
      `Active segment already exists (started at ${activeSegment.start_time}). ` +
        `End it with veto_end_segment before starting a new one.`
    );
  }

  const today = getTodayDatePST();
  const now = new Date().toISOString();

  // Insert new segment
  const { data, error } = await supabase
    .from("segments")
    .insert({
      date: today,
      intended_type,
      description: description || null,
      start_time: now,
      end_time: null,
      completed: false,
      focus_score: null,
      override_flag: false,
      state_log_id: state_log_id || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start segment: ${error.message}`);
  }

  const segment = data as Segment;

  return {
    segment,
    message: `${intended_type.toUpperCase()} work segment started.`,
  };
}
