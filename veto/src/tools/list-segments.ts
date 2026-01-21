import { supabase } from "../db/client.js";
import type { Segment, SegmentType } from "../types.js";
import { getTodayDatePST, getDaysAgoPST } from "../utils/date.js";

export interface ListSegmentsInput {
  date?: string; // "today", "yesterday", or YYYY-MM-DD
  intended_type?: SegmentType;
  limit?: number;
}

export interface SegmentListItem {
  id: string;
  intended_type: SegmentType;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  focus_score: number | null;
  completed: boolean;
  trello_card_id: string | null;
}

export interface ListSegmentsResult {
  segments: SegmentListItem[];
  stats: {
    total_segments: number;
    total_minutes: number;
    avg_focus: number | null;
    deep_minutes: number;
    shallow_minutes: number;
  };
  date: string;
  message: string;
}

/**
 * Parse date input to YYYY-MM-DD format
 */
function parseDate(dateInput?: string): string {
  if (!dateInput || dateInput === "today") {
    return getTodayDatePST();
  }
  if (dateInput === "yesterday") {
    return getDaysAgoPST(1);
  }
  // Assume YYYY-MM-DD format
  return dateInput;
}

/**
 * veto_list_segments: Query past segments for review
 *
 * Lists segments for a given date with optional filtering.
 * Useful for finding segment IDs for editing or reviewing work logged.
 */
export async function vetoListSegments(
  input: ListSegmentsInput
): Promise<ListSegmentsResult> {
  const { intended_type, limit = 20 } = input;
  const date = parseDate(input.date);

  // Build query
  let query = supabase
    .from("segments")
    .select("*")
    .eq("date", date)
    .order("start_time", { ascending: true })
    .limit(limit);

  // Add type filter if specified
  if (intended_type) {
    query = query.eq("intended_type", intended_type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch segments: ${error.message}`);
  }

  const segments = (data || []) as Segment[];

  // Build segment list with calculated durations
  const segmentList: SegmentListItem[] = segments.map((s) => {
    const start = new Date(s.start_time).getTime();
    const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    return {
      id: s.id,
      intended_type: s.intended_type,
      description: s.description,
      start_time: s.start_time,
      end_time: s.end_time,
      duration_minutes: durationMinutes,
      focus_score: s.focus_score,
      completed: s.completed,
      trello_card_id: s.trello_card_id,
    };
  });

  // Calculate stats
  let totalMinutes = 0;
  let deepMinutes = 0;
  let shallowMinutes = 0;
  const focusScores: number[] = [];

  for (const seg of segmentList) {
    totalMinutes += seg.duration_minutes;
    if (seg.intended_type === "deep") {
      deepMinutes += seg.duration_minutes;
    } else {
      shallowMinutes += seg.duration_minutes;
    }
    if (seg.focus_score !== null) {
      focusScores.push(seg.focus_score);
    }
  }

  const avgFocus =
    focusScores.length > 0
      ? focusScores.reduce((a, b) => a + b, 0) / focusScores.length
      : null;

  // Build message
  const dateLabel =
    date === getTodayDatePST()
      ? "TODAY"
      : date === getDaysAgoPST(1)
        ? "YESTERDAY"
        : date;

  const lines: string[] = [];

  if (segmentList.length === 0) {
    lines.push(`No segments found for ${dateLabel}.`);
  } else {
    lines.push(`${dateLabel}'S SEGMENTS (${segmentList.length})`);
    lines.push("");

    for (let i = 0; i < segmentList.length; i++) {
      const seg = segmentList[i];
      const startTime = new Date(seg.start_time).toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = seg.end_time
        ? new Date(seg.end_time).toLocaleTimeString("en-US", {
            timeZone: "America/Los_Angeles",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "ongoing";

      const status = seg.completed ? "✓" : "✗";
      const focusStr =
        seg.focus_score !== null ? `Focus: ${seg.focus_score}/10` : "Focus: —";

      lines.push(
        `${i + 1}. [${seg.id.substring(0, 8)}] ${seg.intended_type.toUpperCase()} ${startTime} - ${endTime} (${seg.duration_minutes} min)`
      );
      lines.push(
        `   "${seg.description || "No description"}"`
      );
      lines.push(`   ${focusStr} | Completed: ${status}`);
      if (seg.trello_card_id) {
        lines.push(`   Trello: ${seg.trello_card_id}`);
      }
      lines.push("");
    }

    lines.push("───────────────────────────────────────");
    lines.push(
      `Total: ${totalMinutes} min | Deep: ${deepMinutes} min | Shallow: ${shallowMinutes} min`
    );
    if (avgFocus !== null) {
      lines.push(`Avg Focus: ${avgFocus.toFixed(1)}/10`);
    }
  }

  return {
    segments: segmentList,
    stats: {
      total_segments: segmentList.length,
      total_minutes: totalMinutes,
      avg_focus: avgFocus,
      deep_minutes: deepMinutes,
      shallow_minutes: shallowMinutes,
    },
    date,
    message: lines.join("\n"),
  };
}
