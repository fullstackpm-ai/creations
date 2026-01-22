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

export type CaptureType = "idea" | "action";

export type CaptureUrgency = "now" | "today" | "later";

export type CaptureStatus = "pending" | "routed" | "dismissed";

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
  trello_card_id: string | null;
  notes: string | null;
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

export interface Capture {
  id: string;
  created_at: string;
  date: string;
  segment_id: string | null;
  capture_type: CaptureType;
  content: string;
  urgency: CaptureUrgency;
  routed_to: string | null;
  status: CaptureStatus;
}

// Input types for tools
export interface AssessInput {
  energy: number;
  focus: number;
  mood?: string;
  sleep_hours?: number;
  notes?: string;
  time_override?: string; // ISO timestamp or HH:MM to override current time for circadian phase
}

export interface CaptureInput {
  content: string;
  type?: CaptureType; // Auto-detected if segment active
  urgency?: CaptureUrgency;
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
