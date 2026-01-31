-- Enable Row Level Security on all Veto tables
-- Run this in Supabase SQL Editor
--
-- Note: Veto uses service_role key which bypasses RLS.
-- Enabling RLS silences the Supabase security warning and ensures
-- the anon key cannot access data via PostgREST.

-- 1. Enable RLS on all tables
ALTER TABLE public.state_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refusal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for authenticated access
-- These allow authenticated users (via Supabase Auth) full access.
-- service_role key bypasses RLS entirely, so these policies are
-- primarily for future multi-user support or direct auth access.

-- state_logs policies
CREATE POLICY "Allow authenticated full access to state_logs"
  ON public.state_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- segments policies
CREATE POLICY "Allow authenticated full access to segments"
  ON public.segments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- daily_summaries policies
CREATE POLICY "Allow authenticated full access to daily_summaries"
  ON public.daily_summaries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- refusal_events policies
CREATE POLICY "Allow authenticated full access to refusal_events"
  ON public.refusal_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- captures policies
CREATE POLICY "Allow authenticated full access to captures"
  ON public.captures
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('state_logs', 'segments', 'daily_summaries', 'refusal_events', 'captures');
