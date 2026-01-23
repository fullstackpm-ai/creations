import { supabase } from "../db/client.js";
import type { StateLog, CircadianPhase } from "../types.js";
import { getTodayDatePST } from "../utils/date.js";

export interface TodayStateResult {
  has_assessment: boolean;
  state_log: StateLog | null;
  hours_ago: number | null;
  message: string;
}

/**
 * Get the most recent state assessment from today.
 * Used by /veto:daily to check if user already logged state.
 */
export async function vetoGetTodayState(): Promise<TodayStateResult> {
  const today = getTodayDatePST();

  // Query for today's most recent state log
  const { data, error } = await supabase
    .from("state_logs")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to query state logs: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      has_assessment: false,
      state_log: null,
      hours_ago: null,
      message: "No state assessment logged today.",
    };
  }

  const stateLog = data[0] as StateLog;

  // Calculate how long ago the assessment was
  const createdAt = new Date(stateLog.created_at);
  const now = new Date();
  const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const roundedHoursAgo = Math.round(hoursAgo * 10) / 10; // Round to 1 decimal

  // Format the time for display
  const timeStr = createdAt.toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    has_assessment: true,
    state_log: stateLog,
    hours_ago: roundedHoursAgo,
    message: `State logged at ${timeStr} (${roundedHoursAgo}h ago): Energy ${stateLog.energy}/10, Focus ${stateLog.focus}/10${stateLog.sleep_hours ? `, Sleep ${stateLog.sleep_hours}h` : ""}.`,
  };
}
