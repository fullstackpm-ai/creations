import { supabase } from "../db/client.js";
import type { StateLog, Segment, CircadianPhase, RefusalEvent } from "../types.js";

export interface PlanInput {
  intended_work_type?: "deep" | "shallow";
}

export interface Guardrail {
  active: boolean;
  refusing: boolean;
  reason: string | null;
  confidence: number;
  evidence: {
    similar_state_outcomes: {
      attempts: number;
      poor_outcome_rate: number;
    } | null;
    override_history: {
      recent_overrides: number;
      poor_outcome_rate: number;
    } | null;
  };
}

export interface PlanResult {
  current_state: {
    energy: number;
    focus: number;
    circadian_phase: CircadianPhase;
  } | null;
  recommendation: "deep" | "shallow";
  guardrail: Guardrail;
  refusal_id: string | null;
  message: string;
}

/**
 * Get the most recent state log from today
 */
async function getLatestStateLog(): Promise<StateLog | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("state_logs")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as StateLog;
}

/**
 * Calculate confidence based on available data
 */
async function calculateConfidence(
  energy: number,
  focus: number
): Promise<{
  level: number;
  days_of_data: number;
  similar_state_count: number;
}> {
  // Count distinct days with state logs
  const { data: allLogs } = await supabase
    .from("state_logs")
    .select("date")
    .order("date", { ascending: false });

  const uniqueDays = new Set(
    (allLogs || []).map((log: { date: string }) => log.date)
  ).size;

  // Count similar states (±2 range)
  const { data: similarLogs } = await supabase
    .from("state_logs")
    .select("id")
    .gte("energy", Math.max(1, energy - 2))
    .lte("energy", Math.min(10, energy + 2))
    .gte("focus", Math.max(1, focus - 2))
    .lte("focus", Math.min(10, focus + 2));

  const similarStateCount = (similarLogs || []).length;

  // Get outcome correlation from segments
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("intended_type", "deep")
    .not("focus_score", "is", null);

  const outcomeCorrelation =
    segments && segments.length >= 5
      ? Math.min(segments.length / 20, 1)
      : 0;

  // Calculate confidence using the formula from product brief
  const level = Math.min(
    uniqueDays / 14,
    similarStateCount / 5,
    outcomeCorrelation || 0.5 // Default if no outcome data
  );

  return {
    level: Math.round(level * 100) / 100,
    days_of_data: uniqueDays,
    similar_state_count: similarStateCount,
  };
}

/**
 * Check deep work outcomes for similar states
 */
async function getSimilarStateOutcomes(
  energy: number,
  focus: number
): Promise<{ attempts: number; poor_outcome_rate: number } | null> {
  // Get segments with similar state logs
  const { data: similarLogs } = await supabase
    .from("state_logs")
    .select("id")
    .gte("energy", Math.max(1, energy - 2))
    .lte("energy", Math.min(10, energy + 2))
    .gte("focus", Math.max(1, focus - 2))
    .lte("focus", Math.min(10, focus + 2));

  if (!similarLogs || similarLogs.length === 0) {
    return null;
  }

  const stateLogIds = similarLogs.map((log: { id: string }) => log.id);

  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("intended_type", "deep")
    .in("state_log_id", stateLogIds)
    .not("focus_score", "is", null);

  if (!segments || segments.length === 0) {
    return null;
  }

  const poorOutcomes = segments.filter(
    (s: Segment) => s.focus_score !== null && s.focus_score < 5
  ).length;

  return {
    attempts: segments.length,
    poor_outcome_rate: poorOutcomes / segments.length,
  };
}

/**
 * Get recent override history
 */
async function getOverrideHistory(): Promise<{
  recent_overrides: number;
  poor_outcome_rate: number;
} | null> {
  const daysBack = 14;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split("T")[0];

  const { data: refusals } = await supabase
    .from("refusal_events")
    .select("*")
    .eq("user_overrode", true)
    .gte("date", startDateStr);

  if (!refusals || refusals.length === 0) {
    return null;
  }

  const poorOutcomes = refusals.filter(
    (r: RefusalEvent) => r.outcome_quality === "poor"
  ).length;

  return {
    recent_overrides: refusals.length,
    poor_outcome_rate: poorOutcomes / refusals.length,
  };
}

/**
 * Record a refusal event
 */
async function recordRefusal(
  confidence: number,
  reason: string
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("refusal_events")
    .insert({
      date: today,
      segment_id: null,
      refusal_type: "deep_work_block",
      confidence_at_refusal: confidence,
      reason,
      user_overrode: false,
      outcome_quality: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record refusal: ${error.message}`);
  }

  return data.id;
}

/**
 * veto_plan: Generate a daily plan with guardrail logic
 *
 * Checks current state against patterns and may refuse deep work
 * if conditions predict poor outcomes.
 */
export async function vetoPlan(input: PlanInput): Promise<PlanResult> {
  const { intended_work_type } = input;

  // Get latest state
  const stateLog = await getLatestStateLog();

  if (!stateLog) {
    return {
      current_state: null,
      recommendation: "shallow",
      guardrail: {
        active: false,
        refusing: false,
        reason: null,
        confidence: 0,
        evidence: {
          similar_state_outcomes: null,
          override_history: null,
        },
      },
      refusal_id: null,
      message:
        "No state logged today. Run veto_assess first to log your current state.",
    };
  }

  const energy = stateLog.energy;
  const focus = stateLog.focus;
  const phase = stateLog.circadian_phase || "midday";

  // Calculate confidence
  const confidence = await calculateConfidence(energy, focus);

  // Get evidence
  const similarStateOutcomes = await getSimilarStateOutcomes(energy, focus);
  const overrideHistory = await getOverrideHistory();

  // Determine if guardrails are active (70% threshold)
  const guardrailActive = confidence.level >= 0.7;

  // Check if we should refuse deep work
  let refusing = false;
  let refusalReason: string | null = null;

  if (
    guardrailActive &&
    (intended_work_type === "deep" || intended_work_type === undefined)
  ) {
    // Check similar state outcomes
    if (
      similarStateOutcomes &&
      similarStateOutcomes.attempts >= 3 &&
      similarStateOutcomes.poor_outcome_rate >= 0.5
    ) {
      refusing = true;
      refusalReason = `Similar states (energy ${energy}, focus ${focus}) led to poor outcomes ${Math.round(similarStateOutcomes.poor_outcome_rate * 100)}% of the time (${similarStateOutcomes.attempts} attempts).`;
    }

    // Check circadian phase
    if (!refusing && phase === "afternoon_dip" && energy < 6) {
      refusing = true;
      refusalReason = `Afternoon dip phase with low energy (${energy}/10). Historical patterns suggest poor deep work outcomes.`;
    }

    // Check if energy and focus are both low
    if (!refusing && energy <= 4 && focus <= 4) {
      refusing = true;
      refusalReason = `Both energy (${energy}/10) and focus (${focus}/10) are low. Deep work unlikely to be productive.`;
    }
  }

  // Record refusal if applicable
  let refusalId: string | null = null;
  if (refusing && refusalReason) {
    refusalId = await recordRefusal(confidence.level, refusalReason);
  }

  // Determine recommendation
  const recommendation: "deep" | "shallow" = refusing ? "shallow" : "deep";

  // Build message
  let message: string;

  if (!guardrailActive) {
    message = `Guardrails inactive (confidence: ${Math.round(confidence.level * 100)}%, need 70%). Observing patterns.`;
    if (energy >= 6 && focus >= 6) {
      message += " Current state supports deep work.";
    } else {
      message += " Current state suggests shallow work may be more effective.";
    }
  } else if (refusing) {
    message = `⚠️ Deep work not recommended.\n\nReason: ${refusalReason}\nConfidence: ${Math.round(confidence.level * 100)}%\n\nOptions:\n[O] Override and proceed anyway\n[D] Defer to later\n[S] Switch to shallow work`;
  } else {
    message = `Deep work suitable. Energy ${energy}/10, focus ${focus}/10, phase: ${phase}.`;
  }

  return {
    current_state: {
      energy,
      focus,
      circadian_phase: phase as CircadianPhase,
    },
    recommendation,
    guardrail: {
      active: guardrailActive,
      refusing,
      reason: refusalReason,
      confidence: confidence.level,
      evidence: {
        similar_state_outcomes: similarStateOutcomes,
        override_history: overrideHistory,
      },
    },
    refusal_id: refusalId,
    message,
  };
}
