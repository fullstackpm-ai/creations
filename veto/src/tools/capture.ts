import { supabase } from "../db/client.js";
import type {
  Capture,
  CaptureInput,
  CaptureType,
  CaptureUrgency,
  Segment,
} from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface CaptureResult {
  capture: Capture;
  segment_active: boolean;
  message: string;
}

/**
 * Get the currently active (unclosed) segment if any
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
 * veto_capture: Capture an idea or action item during work
 *
 * Minimal friction capture that stores ideas/actions for later routing.
 * If a segment is active, the capture is linked to it.
 */
export async function vetoCapture(input: CaptureInput): Promise<CaptureResult> {
  const { content, type, urgency } = input;

  if (!content || content.trim().length === 0) {
    throw new Error("Content is required");
  }

  const today = getTodayDatePST();
  const activeSegment = await getActiveSegment();

  // Default type based on context
  // If no segment active, default to "idea"
  // If segment active and no type specified, we'll still need to ask (handled by caller)
  const captureType: CaptureType = type || "idea";
  const captureUrgency: CaptureUrgency = urgency || "later";

  // Insert capture
  const { data, error } = await supabase
    .from("captures")
    .insert({
      date: today,
      segment_id: activeSegment?.id || null,
      capture_type: captureType,
      content: content.trim(),
      urgency: captureUrgency,
      routed_to: null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to capture: ${error.message}`);
  }

  const capture = data as Capture;

  const typeLabel = captureType === "idea" ? "Idea" : "Action item";
  const segmentContext = activeSegment
    ? ` (linked to current segment)`
    : "";

  return {
    capture,
    segment_active: !!activeSegment,
    message: `${typeLabel} captured${segmentContext}. Will surface in /veto:wrap.`,
  };
}

/**
 * Get all pending captures (regardless of date)
 * Captures roll over until processed - older captures appear first
 */
export async function getPendingCaptures(): Promise<{
  ideas: Capture[];
  actions: Capture[];
}> {
  const { data, error } = await supabase
    .from("captures")
    .select("*")
    .eq("status", "pending")
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to get captures: ${error.message}`);
  }

  const captures = (data || []) as Capture[];

  return {
    ideas: captures.filter((c) => c.capture_type === "idea"),
    actions: captures.filter((c) => c.capture_type === "action"),
  };
}

/**
 * Update capture status (for routing/dismissing)
 */
export async function updateCaptureStatus(
  captureId: string,
  status: "routed" | "dismissed",
  routedTo?: string
): Promise<Capture> {
  const { data, error } = await supabase
    .from("captures")
    .update({
      status,
      routed_to: routedTo || null,
    })
    .eq("id", captureId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update capture: ${error.message}`);
  }

  return data as Capture;
}

export interface RouteCaptureInput {
  capture_id: string;
  action: "complete" | "trello" | "github" | "dismiss" | "skip";
  routed_to?: string;
}

export interface RouteCaptureResult {
  capture: Capture;
  action: string;
  message: string;
}

/**
 * veto_route_capture: Route a capture to its destination
 *
 * Called during /veto:wrap to process each capture. Actions:
 * - complete: Mark as done (handled immediately)
 * - trello: Routed to a Trello card (provide card URL in routed_to)
 * - github: Routed to a GitHub issue (provide issue URL in routed_to)
 * - dismiss: Discard the capture
 * - skip: Leave for later (no status change)
 */
export async function vetoRouteCapture(
  input: RouteCaptureInput
): Promise<RouteCaptureResult> {
  const { capture_id, action, routed_to } = input;

  // First, fetch the capture to ensure it exists
  const { data: existingCapture, error: fetchError } = await supabase
    .from("captures")
    .select("*")
    .eq("id", capture_id)
    .single();

  if (fetchError || !existingCapture) {
    throw new Error(`Capture not found: ${capture_id}`);
  }

  let capture: Capture;
  let message: string;

  switch (action) {
    case "complete":
      capture = await updateCaptureStatus(capture_id, "routed", "completed");
      message = "Marked as complete.";
      break;

    case "trello":
      if (!routed_to) {
        throw new Error("routed_to is required when routing to Trello");
      }
      capture = await updateCaptureStatus(capture_id, "routed", routed_to);
      message = `Routed to Trello: ${routed_to}`;
      break;

    case "github":
      if (!routed_to) {
        throw new Error("routed_to is required when routing to GitHub");
      }
      capture = await updateCaptureStatus(capture_id, "routed", routed_to);
      message = `Routed to GitHub: ${routed_to}`;
      break;

    case "dismiss":
      capture = await updateCaptureStatus(capture_id, "dismissed");
      message = "Dismissed.";
      break;

    case "skip":
      // No status change - return existing capture
      capture = existingCapture as Capture;
      message = "Skipped - will appear in next wrap.";
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return {
    capture,
    action,
    message,
  };
}
