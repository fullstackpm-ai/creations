import { supabase } from "../db/client.js";
import type {
  AssessInput,
  ExecutionProfile,
  CircadianPhase,
  StateLog,
} from "../types.js";

/**
 * Determine circadian phase based on current hour
 */
function getCircadianPhase(): CircadianPhase {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return "morning_peak";
  if (hour >= 10 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon_dip";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate confidence based on available data
 */
async function calculateConfidence(): Promise<{
  level: number;
  status: "building" | "low" | "medium" | "high";
  days_of_data: number;
}> {
  // Count distinct days with state logs
  const { data, error } = await supabase
    .from("state_logs")
    .select("date")
    .order("date", { ascending: false });

  if (error || !data) {
    return { level: 0, status: "building", days_of_data: 0 };
  }

  const uniqueDays = new Set(data.map((row) => row.date)).size;

  // Simple confidence calculation from product brief:
  // confidence = min(days_of_data / 14, ...)
  // For now, just use days_of_data factor
  const level = Math.min(uniqueDays / 14, 1);

  let status: "building" | "low" | "medium" | "high";
  if (level < 0.3) status = "building";
  else if (level < 0.5) status = "low";
  else if (level < 0.7) status = "medium";
  else status = "high";

  return {
    level: Math.round(level * 100) / 100,
    status,
    days_of_data: uniqueDays,
  };
}

/**
 * Determine work recommendation based on current state
 */
function getRecommendation(
  energy: number,
  focus: number,
  circadianPhase: CircadianPhase,
  confidence: number
): {
  deep_work_suitable: boolean;
  suggested_work_type: "deep" | "shallow";
  reasoning: string;
} {
  // Simple heuristic for MVP
  // Deep work requires: energy >= 6 AND focus >= 6
  // Also factor in circadian phase
  const phaseBonus =
    circadianPhase === "morning_peak"
      ? 1
      : circadianPhase === "afternoon_dip"
        ? -1
        : 0;

  const adjustedEnergy = energy + phaseBonus;
  const deepWorkSuitable = adjustedEnergy >= 6 && focus >= 6;

  let reasoning: string;

  if (confidence < 0.7) {
    // Not enough data yet - observe only
    reasoning = `Observing patterns. Confidence: ${Math.round(confidence * 100)}% (guardrails activate at 70%).`;
    return {
      deep_work_suitable: true, // Don't refuse yet
      suggested_work_type: deepWorkSuitable ? "deep" : "shallow",
      reasoning,
    };
  }

  if (deepWorkSuitable) {
    reasoning = `Energy ${energy}/10 and focus ${focus}/10 support deep work. ${
      phaseBonus > 0
        ? "Morning peak amplifies capacity."
        : phaseBonus < 0
          ? "Afternoon dip noted but compensated by good baseline."
          : ""
    }`.trim();
  } else {
    const issues: string[] = [];
    if (energy < 6) issues.push(`energy ${energy}/10`);
    if (focus < 6) issues.push(`focus ${focus}/10`);
    if (phaseBonus < 0) issues.push("afternoon dip phase");

    reasoning = `Shallow work recommended. Factors: ${issues.join(", ")}.`;
  }

  return {
    deep_work_suitable: deepWorkSuitable,
    suggested_work_type: deepWorkSuitable ? "deep" : "shallow",
    reasoning,
  };
}

/**
 * veto_assess: Log current state and return Execution Profile
 *
 * Primary signal ingestion for the trust loop.
 */
export async function vetoAssess(input: AssessInput): Promise<ExecutionProfile> {
  const { energy, focus, mood, sleep_hours, notes } = input;

  // Validate inputs
  if (energy < 1 || energy > 10) {
    throw new Error("Energy must be between 1 and 10");
  }
  if (focus < 1 || focus > 10) {
    throw new Error("Focus must be between 1 and 10");
  }
  if (sleep_hours !== undefined && (sleep_hours < 0 || sleep_hours > 24)) {
    throw new Error("Sleep hours must be between 0 and 24");
  }

  const circadianPhase = getCircadianPhase();
  const today = getTodayDate();

  // Insert state log
  const { data, error } = await supabase
    .from("state_logs")
    .insert({
      date: today,
      energy,
      focus,
      mood: mood || null,
      sleep_hours: sleep_hours || null,
      circadian_phase: circadianPhase,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log state: ${error.message}`);
  }

  const stateLog = data as StateLog;

  // Calculate confidence
  const confidence = await calculateConfidence();

  // Generate recommendation
  const recommendation = getRecommendation(
    energy,
    focus,
    circadianPhase,
    confidence.level
  );

  // Build Execution Profile
  const profile: ExecutionProfile = {
    state_log_id: stateLog.id,
    timestamp: stateLog.created_at,
    current_state: {
      energy,
      focus,
      mood: mood || null,
      sleep_hours: sleep_hours || null,
      circadian_phase: circadianPhase,
    },
    recommendation,
    confidence,
  };

  return profile;
}
