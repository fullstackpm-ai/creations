import { supabase } from "../db/client.js";
import type { Segment } from "../types.js";

export interface EndSegmentInput {
  focus_score: number;
  completed?: boolean;
  notes?: string;
  duration_minutes?: number;
}

export interface EndSegmentResult {
  segment: Segment;
  duration_minutes: number;
  message: string;
}

/**
 * Get the active (unclosed) segment
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
 * Calculate duration in minutes between two timestamps
 */
function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60));
}

/**
 * veto_end_segment: End the current work segment
 *
 * Closes the active segment with end time, focus score, and completion status.
 */
export async function vetoEndSegment(
  input: EndSegmentInput
): Promise<EndSegmentResult> {
  const { focus_score, completed = true, notes, duration_minutes: overrideDuration } = input;

  // Validate focus score
  if (focus_score < 1 || focus_score > 10) {
    throw new Error("Focus score must be between 1 and 10");
  }

  // Validate override duration if provided
  if (overrideDuration !== undefined && (overrideDuration < 1 || overrideDuration > 1440)) {
    throw new Error("Duration must be between 1 and 1440 minutes (24 hours)");
  }

  // Get active segment
  const activeSegment = await getActiveSegment();
  if (!activeSegment) {
    throw new Error(
      "No active segment to end. Start one with veto_start_segment first."
    );
  }

  const now = new Date().toISOString();

  // Use override duration if provided, otherwise calculate from timestamps
  const durationMinutes = overrideDuration ?? calculateDurationMinutes(
    activeSegment.start_time,
    now
  );

  // Update segment with end time and focus score
  const { data, error } = await supabase
    .from("segments")
    .update({
      end_time: now,
      focus_score,
      completed,
    })
    .eq("id", activeSegment.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to end segment: ${error.message}`);
  }

  const segment = data as Segment;

  const completionText = completed ? "completed" : "incomplete";
  const focusText =
    focus_score >= 7 ? "good focus" : focus_score >= 5 ? "moderate focus" : "low focus";

  return {
    segment,
    duration_minutes: durationMinutes,
    message: `${segment.intended_type.toUpperCase()} segment ended (${durationMinutes} min, ${completionText}, ${focusText}).`,
  };
}
