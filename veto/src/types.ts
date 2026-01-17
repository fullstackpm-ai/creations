// Veto Type Definitions

export type CircadianPhase =
  | "morning_peak"
  | "midday"
  | "afternoon_dip"
  | "evening"
  | "night";

export type EnergyTrend = "rise" | "stable" | "dip";

export type SegmentType = "deep" | "shallow";

export type OutcomeQuality = "good" | "neutral" | "poor";

// Database row types
export interface StateLog {
  id: string;
  created_at: string;
  date: string;
  energy: number;
  focus: number;
  mood: string | null;
  sleep_hours: number | null;
  circadian_phase: CircadianPhase | null;
  notes: string | null;
}

export interface Segment {
  id: string;
  created_at: string;
  date: string;
  intended_type: SegmentType;
  description: string | null;
  start_time: string;
  end_time: string | null;
  completed: boolean;
  focus_score: number | null;
  override_flag: boolean;
  state_log_id: string | null;
}

export interface DailySummary {
  id: string;
  created_at: string;
  date: string;
  completion_ratio: number | null;
  mean_focus: number | null;
  energy_trend: EnergyTrend | null;
  deep_work_minutes: number;
  shallow_work_minutes: number;
  notable_events: string | null;
}

export interface RefusalEvent {
  id: string;
  created_at: string;
  date: string;
  segment_id: string | null;
  refusal_type: string;
  confidence_at_refusal: number;
  reason: string;
  user_overrode: boolean;
  outcome_quality: OutcomeQuality | null;
}

// Input types for tools
export interface AssessInput {
  energy: number;
  focus: number;
  mood?: string;
  sleep_hours?: number;
  notes?: string;
}

// Execution Profile - what the system recommends based on state
export interface ExecutionProfile {
  state_log_id: string;
  timestamp: string;
  current_state: {
    energy: number;
    focus: number;
    mood: string | null;
    sleep_hours: number | null;
    circadian_phase: CircadianPhase;
  };
  recommendation: {
    deep_work_suitable: boolean;
    suggested_work_type: SegmentType;
    reasoning: string;
  };
  confidence: {
    level: number;
    status: "building" | "low" | "medium" | "high";
    days_of_data: number;
  };
}
