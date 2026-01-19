import { supabase } from "../db/client.js";
import type { DailySummary, Segment, StateLog, EnergyTrend } from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface WrapDayInput {
  notable_events?: string;
}

export interface OverrideReview {
  segment_id: string;
  description: string | null;
  focus_score: number | null;
  needs_assessment: boolean;
}

export interface SegmentDetail {
  id: string;
  type: "deep" | "shallow";
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  focus_score: number | null;
  completed: boolean;
  override: boolean;
}

export interface WrapDayResult {
  summary: DailySummary;
  segments_today: number;
  segments: SegmentDetail[];
  override_reviews: OverrideReview[];
  message: string;
}

/**
 * Calculate energy trend from state logs
 */
function calculateEnergyTrend(stateLogs: StateLog[]): EnergyTrend {
  if (stateLogs.length < 2) return "stable";

  const energies = stateLogs.map((log) => log.energy);
  const first = energies[0];
  const last = energies[energies.length - 1];
  const diff = last - first;

  if (diff >= 2) return "rise";
  if (diff <= -2) return "dip";
  return "stable";
}

/**
 * veto_wrap_day: Generate daily summary and close out the day
 *
 * Aggregates segments, calculates metrics, and creates a daily summary record.
 * Also surfaces any override events that need post-hoc assessment.
 */
export async function vetoWrapDay(input: WrapDayInput): Promise<WrapDayResult> {
  const { notable_events } = input;
  const today = getTodayDatePST();

  // Check for active segment
  const { data: activeSegment } = await supabase
    .from("segments")
    .select("*")
    .is("end_time", null)
    .limit(1)
    .single();

  if (activeSegment) {
    throw new Error(
      "Active segment still running. End it with veto_end_segment before wrapping the day."
    );
  }

  // Get today's segments
  const { data: segments, error: segmentsError } = await supabase
    .from("segments")
    .select("*")
    .eq("date", today);

  if (segmentsError) {
    throw new Error(`Failed to fetch segments: ${segmentsError.message}`);
  }

  const todaySegments = (segments || []) as Segment[];

  // Get today's state logs for energy trend
  const { data: stateLogs } = await supabase
    .from("state_logs")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: true });

  const todayStateLogs = (stateLogs || []) as StateLog[];

  // Calculate metrics
  const completedSegments = todaySegments.filter((s) => s.completed);
  const completionRatio =
    todaySegments.length > 0
      ? completedSegments.length / todaySegments.length
      : null;

  const focusScores = todaySegments
    .filter((s) => s.focus_score !== null)
    .map((s) => s.focus_score as number);
  const meanFocus =
    focusScores.length > 0
      ? focusScores.reduce((a, b) => a + b, 0) / focusScores.length
      : null;

  const energyTrend = calculateEnergyTrend(todayStateLogs);

  // Calculate work minutes by type
  let deepWorkMinutes = 0;
  let shallowWorkMinutes = 0;

  for (const segment of todaySegments) {
    if (segment.end_time && segment.start_time) {
      const start = new Date(segment.start_time).getTime();
      const end = new Date(segment.end_time).getTime();
      const minutes = Math.round((end - start) / (1000 * 60));

      if (segment.intended_type === "deep") {
        deepWorkMinutes += minutes;
      } else {
        shallowWorkMinutes += minutes;
      }
    }
  }

  // Find override segments that need assessment
  const overrideSegments = todaySegments.filter((s) => s.override_flag);
  const overrideReviews: OverrideReview[] = overrideSegments.map((s) => ({
    segment_id: s.id,
    description: s.description,
    focus_score: s.focus_score,
    needs_assessment: true,
  }));

  // Build segment details for output (sorted by start time)
  const sortedSegments = [...todaySegments].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const segmentDetails: SegmentDetail[] = sortedSegments.map((s) => {
    const start = new Date(s.start_time).getTime();
    const end = s.end_time ? new Date(s.end_time).getTime() : start;
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    return {
      id: s.id,
      type: s.intended_type,
      description: s.description,
      start_time: s.start_time,
      end_time: s.end_time || s.start_time,
      duration_minutes: durationMinutes,
      focus_score: s.focus_score,
      completed: s.completed || false,
      override: s.override_flag || false,
    };
  });

  // Check if summary already exists for today
  const { data: existingSummary } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("date", today)
    .single();

  let summary: DailySummary;

  if (existingSummary) {
    // Update existing summary
    const { data, error } = await supabase
      .from("daily_summaries")
      .update({
        completion_ratio: completionRatio,
        mean_focus: meanFocus,
        energy_trend: energyTrend,
        deep_work_minutes: deepWorkMinutes,
        shallow_work_minutes: shallowWorkMinutes,
        notable_events: notable_events || existingSummary.notable_events,
      })
      .eq("id", existingSummary.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update daily summary: ${error.message}`);
    }
    summary = data as DailySummary;
  } else {
    // Create new summary
    const { data, error } = await supabase
      .from("daily_summaries")
      .insert({
        date: today,
        completion_ratio: completionRatio,
        mean_focus: meanFocus,
        energy_trend: energyTrend,
        deep_work_minutes: deepWorkMinutes,
        shallow_work_minutes: shallowWorkMinutes,
        notable_events: notable_events || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create daily summary: ${error.message}`);
    }
    summary = data as DailySummary;
  }

  // Build message with segment breakdown
  const lines: string[] = [
    `Day wrapped: ${todaySegments.length} segment(s)`,
    "",
    "--- Summary ---",
    `Deep work: ${deepWorkMinutes} min | Shallow: ${shallowWorkMinutes} min`,
    `Completion: ${completionRatio !== null ? Math.round(completionRatio * 100) + "%" : "N/A"}`,
    `Mean focus: ${meanFocus !== null ? meanFocus.toFixed(1) : "N/A"}`,
    `Energy trend: ${energyTrend}`,
  ];

  // Add segment breakdown
  if (segmentDetails.length > 0) {
    lines.push("");
    lines.push("--- Segments ---");
    for (const seg of segmentDetails) {
      const startTime = new Date(seg.start_time).toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const status = seg.completed ? "✓" : "✗";
      const focusStr = seg.focus_score !== null ? `focus:${seg.focus_score}` : "";
      const overrideStr = seg.override ? " [override]" : "";
      const desc = seg.description ? ` - ${seg.description}` : "";
      lines.push(
        `  ${startTime} | ${seg.type} | ${seg.duration_minutes}min | ${status} ${focusStr}${overrideStr}${desc}`
      );
    }
  }

  if (overrideReviews.length > 0) {
    lines.push("");
    lines.push(
      `${overrideReviews.length} override(s) need post-hoc assessment.`
    );
  }

  return {
    summary,
    segments_today: todaySegments.length,
    segments: segmentDetails,
    override_reviews: overrideReviews,
    message: lines.join("\n"),
  };
}
