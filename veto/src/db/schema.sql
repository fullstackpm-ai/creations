-- Veto Database Schema
-- The minimum data model for the trust loop

-- 1. State Logs: Primary signal ingestion
CREATE TABLE IF NOT EXISTS state_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  energy INT CHECK (energy >= 1 AND energy <= 10),
  focus INT CHECK (focus >= 1 AND focus <= 10),
  mood TEXT,
  sleep_hours NUMERIC(3,1),
  circadian_phase TEXT CHECK (circadian_phase IN ('morning_peak', 'midday', 'afternoon_dip', 'evening', 'night')),
  notes TEXT
);

-- 2. Segments: Execution tracking
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  intended_type TEXT CHECK (intended_type IN ('deep', 'shallow')) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  focus_score INT CHECK (focus_score >= 1 AND focus_score <= 10),
  override_flag BOOLEAN DEFAULT FALSE,
  state_log_id UUID REFERENCES state_logs(id),
  trello_card_id TEXT,
  notes TEXT
);

-- 3. Daily Summaries: Learning DB feed
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL UNIQUE,
  completion_ratio NUMERIC(3,2),
  mean_focus NUMERIC(3,1),
  energy_trend TEXT CHECK (energy_trend IN ('rise', 'stable', 'dip')),
  deep_work_minutes INT DEFAULT 0,
  shallow_work_minutes INT DEFAULT 0,
  notable_events TEXT
);

-- 4. Refusal Events: Critical for trust measurement
CREATE TABLE IF NOT EXISTS refusal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  segment_id UUID REFERENCES segments(id),
  refusal_type TEXT DEFAULT 'deep_work_block',
  confidence_at_refusal NUMERIC(3,2) NOT NULL,
  reason TEXT NOT NULL,
  user_overrode BOOLEAN DEFAULT FALSE,
  outcome_quality TEXT CHECK (outcome_quality IN ('good', 'neutral', 'poor'))
);

-- 5. Captures: Ideas and action items captured during work
CREATE TABLE IF NOT EXISTS captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  segment_id UUID REFERENCES segments(id),
  capture_type TEXT CHECK (capture_type IN ('idea', 'action')) NOT NULL,
  content TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('now', 'today', 'later')) DEFAULT 'later',
  routed_to TEXT,  -- trello_card_id, github_issue_url, or null
  status TEXT CHECK (status IN ('pending', 'routed', 'dismissed')) DEFAULT 'pending'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_state_logs_date ON state_logs(date);
CREATE INDEX IF NOT EXISTS idx_segments_date ON segments(date);
CREATE INDEX IF NOT EXISTS idx_segments_type ON segments(intended_type);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(date);
CREATE INDEX IF NOT EXISTS idx_refusal_events_date ON refusal_events(date);
CREATE INDEX IF NOT EXISTS idx_captures_date ON captures(date);
CREATE INDEX IF NOT EXISTS idx_captures_status ON captures(status);
