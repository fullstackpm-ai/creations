import { supabase } from "../db/client.js";
import type { Segment, StateLog, RefusalEvent, CircadianPhase } from "../types.js";
import { getDaysAgoPST } from "../utils/date.js";

export interface QueryPatternsInput {
  query_type:
    | "deep_work_outcomes"
    | "state_correlation"
    | "override_accuracy"
    | "confidence_factors";
  energy_range?: { min: number; max: number };
  focus_range?: { min: number; max: number };
  circadian_phase?: CircadianPhase;
  days_back?: number;
}

export interface DeepWorkOutcome {
  total_attempts: number;
  completed: number;
  completion_rate: number;
  avg_focus_score: number | null;
  poor_outcomes: number; // focus < 5
  good_outcomes: number; // focus >= 7
}

export interface StateCorrelation {
  state_bucket: string;
  segment_count: number;
  avg_focus: number | null;
  completion_rate: number;
  recommendation: "suitable" | "marginal" | "unsuitable";
}

export interface OverrideAccuracy {
  total_overrides: number;
  good_outcomes: number;
  poor_outcomes: number;
  accuracy_rate: number; // % of overrides that led to poor outcomes
}

export interface ConfidenceFactors {
  days_of_data: number;
  similar_state_count: number;
  outcome_correlation_strength: number;
  calculated_confidence: number;
}

export interface QueryPatternsResult {
  query_type: string;
  data:
    | DeepWorkOutcome
    | StateCorrelation[]
    | OverrideAccuracy
    | ConfidenceFactors;
  message: string;
}

/**
 * Query deep work outcomes for similar states
 */
async function queryDeepWorkOutcomes(
  input: QueryPatternsInput
): Promise<DeepWorkOutcome> {
  const daysBack = input.days_back || 14;
  const startDateStr = getDaysAgoPST(daysBack);

  let query = supabase
    .from("segments")
    .select("*")
    .eq("intended_type", "deep")
    .gte("date", startDateStr)
    .not("end_time", "is", null);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to query segments: ${error.message}`);
  }

  const segments = (data || []) as Segment[];

  // Filter by state if we have state_log_id references
  let filteredSegments = segments;

  if (input.energy_range || input.focus_range) {
    // Get state logs for filtering
    const stateLogIds = segments
      .filter((s) => s.state_log_id)
      .map((s) => s.state_log_id);

    if (stateLogIds.length > 0) {
      const { data: stateLogs } = await supabase
        .from("state_logs")
        .select("*")
        .in("id", stateLogIds);

      const stateLogMap = new Map(
        (stateLogs || []).map((log: StateLog) => [log.id, log])
      );

      filteredSegments = segments.filter((s) => {
        if (!s.state_log_id) return false;
        const stateLog = stateLogMap.get(s.state_log_id);
        if (!stateLog) return false;

        if (input.energy_range) {
          if (
            stateLog.energy < input.energy_range.min ||
            stateLog.energy > input.energy_range.max
          ) {
            return false;
          }
        }
        if (input.focus_range) {
          if (
            stateLog.focus < input.focus_range.min ||
            stateLog.focus > input.focus_range.max
          ) {
            return false;
          }
        }
        return true;
      });
    }
  }

  const completed = filteredSegments.filter((s) => s.completed).length;
  const focusScores = filteredSegments
    .filter((s) => s.focus_score !== null)
    .map((s) => s.focus_score as number);

  const avgFocus =
    focusScores.length > 0
      ? focusScores.reduce((a, b) => a + b, 0) / focusScores.length
      : null;

  const poorOutcomes = focusScores.filter((f) => f < 5).length;
  const goodOutcomes = focusScores.filter((f) => f >= 7).length;

  return {
    total_attempts: filteredSegments.length,
    completed,
    completion_rate:
      filteredSegments.length > 0 ? completed / filteredSegments.length : 0,
    avg_focus_score: avgFocus,
    poor_outcomes: poorOutcomes,
    good_outcomes: goodOutcomes,
  };
}

/**
 * Query state correlations - how different states correlate with outcomes
 */
async function queryStateCorrelations(
  input: QueryPatternsInput
): Promise<StateCorrelation[]> {
  const daysBack = input.days_back || 14;
  const startDateStr = getDaysAgoPST(daysBack);

  // Get segments with state logs
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("intended_type", "deep")
    .gte("date", startDateStr)
    .not("end_time", "is", null)
    .not("state_log_id", "is", null);

  if (!segments || segments.length === 0) {
    return [];
  }

  const stateLogIds = segments.map((s: Segment) => s.state_log_id);
  const { data: stateLogs } = await supabase
    .from("state_logs")
    .select("*")
    .in("id", stateLogIds);

  const stateLogMap = new Map(
    (stateLogs || []).map((log: StateLog) => [log.id, log])
  );

  // Group by state buckets (low/medium/high energy × low/medium/high focus)
  const buckets: Map<
    string,
    { segments: Segment[]; focusScores: number[]; completed: number }
  > = new Map();

  for (const segment of segments as Segment[]) {
    const stateLog = stateLogMap.get(segment.state_log_id!);
    if (!stateLog) continue;

    const energyBucket =
      stateLog.energy <= 4 ? "low" : stateLog.energy <= 7 ? "med" : "high";
    const focusBucket =
      stateLog.focus <= 4 ? "low" : stateLog.focus <= 7 ? "med" : "high";
    const bucket = `E:${energyBucket}/F:${focusBucket}`;

    if (!buckets.has(bucket)) {
      buckets.set(bucket, { segments: [], focusScores: [], completed: 0 });
    }

    const b = buckets.get(bucket)!;
    b.segments.push(segment);
    if (segment.focus_score !== null) {
      b.focusScores.push(segment.focus_score);
    }
    if (segment.completed) {
      b.completed++;
    }
  }

  const correlations: StateCorrelation[] = [];

  for (const [bucket, data] of buckets) {
    const avgFocus =
      data.focusScores.length > 0
        ? data.focusScores.reduce((a, b) => a + b, 0) / data.focusScores.length
        : null;
    const completionRate = data.segments.length > 0 ? data.completed / data.segments.length : 0;

    let recommendation: "suitable" | "marginal" | "unsuitable";
    if (avgFocus !== null && avgFocus >= 7 && completionRate >= 0.7) {
      recommendation = "suitable";
    } else if (avgFocus !== null && avgFocus >= 5 && completionRate >= 0.5) {
      recommendation = "marginal";
    } else {
      recommendation = "unsuitable";
    }

    correlations.push({
      state_bucket: bucket,
      segment_count: data.segments.length,
      avg_focus: avgFocus,
      completion_rate: completionRate,
      recommendation,
    });
  }

  return correlations.sort((a, b) => b.segment_count - a.segment_count);
}

/**
 * Query override accuracy - how often overrides led to poor outcomes
 */
async function queryOverrideAccuracy(
  input: QueryPatternsInput
): Promise<OverrideAccuracy> {
  const daysBack = input.days_back || 14;
  const startDateStr = getDaysAgoPST(daysBack);

  const { data: refusals } = await supabase
    .from("refusal_events")
    .select("*")
    .eq("user_overrode", true)
    .gte("date", startDateStr);

  const overrides = (refusals || []) as RefusalEvent[];

  const goodOutcomes = overrides.filter(
    (r) => r.outcome_quality === "good"
  ).length;
  const poorOutcomes = overrides.filter(
    (r) => r.outcome_quality === "poor"
  ).length;

  return {
    total_overrides: overrides.length,
    good_outcomes: goodOutcomes,
    poor_outcomes: poorOutcomes,
    accuracy_rate:
      overrides.length > 0 ? poorOutcomes / overrides.length : 0,
  };
}

/**
 * Calculate confidence factors for current state
 */
async function queryConfidenceFactors(
  input: QueryPatternsInput
): Promise<ConfidenceFactors> {
  // Count distinct days with state logs
  const { data: allLogs } = await supabase
    .from("state_logs")
    .select("date")
    .order("date", { ascending: false });

  const uniqueDays = new Set((allLogs || []).map((log: { date: string }) => log.date)).size;

  // Count similar states
  let similarStateCount = 0;
  if (input.energy_range && input.focus_range) {
    const { data: similarLogs } = await supabase
      .from("state_logs")
      .select("id")
      .gte("energy", input.energy_range.min)
      .lte("energy", input.energy_range.max)
      .gte("focus", input.focus_range.min)
      .lte("focus", input.focus_range.max);

    similarStateCount = (similarLogs || []).length;
  }

  // Calculate outcome correlation strength from segments with outcomes
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("intended_type", "deep")
    .not("focus_score", "is", null)
    .not("state_log_id", "is", null);

  let outcomeCorrelation = 0;
  if (segments && segments.length >= 5) {
    // Simple heuristic: more segments with outcomes = stronger correlation
    outcomeCorrelation = Math.min(segments.length / 20, 1);
  }

  // Calculate confidence using the formula from product brief
  const confidence = Math.min(
    uniqueDays / 14,
    similarStateCount / 5,
    outcomeCorrelation
  );

  return {
    days_of_data: uniqueDays,
    similar_state_count: similarStateCount,
    outcome_correlation_strength: outcomeCorrelation,
    calculated_confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * veto_query_patterns: Query the Learning DB for insights and patterns
 *
 * Used by the guardrail logic to make evidence-based recommendations.
 */
export async function vetoQueryPatterns(
  input: QueryPatternsInput
): Promise<QueryPatternsResult> {
  const { query_type } = input;

  switch (query_type) {
    case "deep_work_outcomes": {
      const data = await queryDeepWorkOutcomes(input);
      return {
        query_type,
        data,
        message: `Deep work outcomes: ${data.total_attempts} attempts, ${Math.round(data.completion_rate * 100)}% completion, avg focus ${data.avg_focus_score?.toFixed(1) ?? "N/A"}`,
      };
    }

    case "state_correlation": {
      const data = await queryStateCorrelations(input);
      return {
        query_type,
        data,
        message: `Found ${data.length} state correlation buckets`,
      };
    }

    case "override_accuracy": {
      const data = await queryOverrideAccuracy(input);
      return {
        query_type,
        data,
        message: `Override accuracy: ${data.total_overrides} overrides, ${Math.round(data.accuracy_rate * 100)}% led to poor outcomes`,
      };
    }

    case "confidence_factors": {
      const data = await queryConfidenceFactors(input);
      return {
        query_type,
        data,
        message: `Confidence: ${Math.round(data.calculated_confidence * 100)}% (${data.days_of_data} days of data)`,
      };
    }

    default:
      throw new Error(`Unknown query type: ${query_type}`);
  }
}
