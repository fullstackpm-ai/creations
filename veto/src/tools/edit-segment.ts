import { supabase } from "../db/client.js";
import type { Segment } from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface EditSegmentInput {
  segment_id: string;
  focus_score?: number;
  completed?: boolean;
  description?: string;
  notes?: string;
  duration_minutes?: number;
}

export interface EditSegmentResult {
  segment: Segment;
  changes: string[];
  message: string;
}

/**
 * Get a segment by ID
 */
async function getSegmentById(segmentId: string): Promise<Segment | null> {
  const { data, error } = await supabase
    .from("segments")
    .select("*")
    .eq("id", segmentId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Segment;
}

/**
 * veto_edit_segment: Modify a past segment
 *
 * Allows editing focus_score, completed status, description, and notes.
 * Can only edit segments from today.
 */
export async function vetoEditSegment(
  input: EditSegmentInput
): Promise<EditSegmentResult> {
  const { segment_id, focus_score, completed, description, notes, duration_minutes } = input;

  // Get the segment
  const segment = await getSegmentById(segment_id);
  if (!segment) {
    throw new Error(`Segment not found: ${segment_id}`);
  }

  // Check if segment is from today (can only edit today's segments)
  const today = getTodayDatePST();
  if (segment.date !== today) {
    throw new Error(
      `Can only edit segments from today (${today}). This segment is from ${segment.date}.`
    );
  }

  // Validate focus score if provided
  if (focus_score !== undefined && (focus_score < 1 || focus_score > 10)) {
    throw new Error("Focus score must be between 1 and 10");
  }

  // Validate duration if provided
  if (duration_minutes !== undefined && (duration_minutes < 1 || duration_minutes > 1440)) {
    throw new Error("Duration must be between 1 and 1440 minutes (24 hours)");
  }

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};
  const changes: string[] = [];

  if (focus_score !== undefined && focus_score !== segment.focus_score) {
    updates.focus_score = focus_score;
    changes.push(`focus_score: ${segment.focus_score} → ${focus_score}`);
  }

  if (completed !== undefined && completed !== segment.completed) {
    updates.completed = completed;
    changes.push(`completed: ${segment.completed} → ${completed}`);
  }

  if (description !== undefined && description !== segment.description) {
    updates.description = description;
    changes.push(`description updated`);
  }

  if (notes !== undefined) {
    // For notes, we append rather than replace if there's existing content
    const existingNotes = segment.notes || "";
    const newNotes = existingNotes ? `${existingNotes}\n[Edit] ${notes}` : notes;
    updates.notes = newNotes;
    changes.push(`notes updated`);
  }

  if (duration_minutes !== undefined && segment.start_time && segment.end_time) {
    // Recalculate end_time based on start_time + duration
    const startTime = new Date(segment.start_time);
    const newEndTime = new Date(startTime.getTime() + duration_minutes * 60 * 1000);
    updates.end_time = newEndTime.toISOString();
    changes.push(`duration adjusted to ${duration_minutes} minutes`);
  }

  // If no changes, return early
  if (changes.length === 0) {
    return {
      segment,
      changes: [],
      message: "No changes made - all values are the same.",
    };
  }

  // Update the segment
  const { data, error } = await supabase
    .from("segments")
    .update(updates)
    .eq("id", segment_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update segment: ${error.message}`);
  }

  const updatedSegment = data as Segment;

  return {
    segment: updatedSegment,
    changes,
    message: `Segment updated: ${changes.join(", ")}.`,
  };
}
