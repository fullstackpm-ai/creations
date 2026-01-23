-- Setup script for veto_sql_query tool
-- Run this in Supabase SQL Editor to enable direct SQL queries from Claude Code

-- Create a function to execute arbitrary SQL and return results as JSON
-- SECURITY NOTE: This function uses SECURITY DEFINER which runs with creator's privileges
-- Only expose via service role key (not anon key)

CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Execute the query and convert results to JSON
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql_query || ') t'
  INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error as JSON for non-SELECT queries or errors
    BEGIN
      -- Try executing as a statement (INSERT/UPDATE/DELETE)
      EXECUTE sql_query;
      RETURN jsonb_build_object('affected_rows', 'executed', 'message', 'Statement executed successfully');
    EXCEPTION
      WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
    END;
END;
$$;

-- Grant execute permission to authenticated users (service role)
-- The anon key should NOT have access to this function
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;

-- Verify the function works
-- SELECT exec_sql('SELECT count(*) as total FROM state_logs');
