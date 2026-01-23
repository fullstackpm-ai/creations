import { supabase } from "../db/client.js";

// Allowed tables for query validation
const ALLOWED_TABLES = [
  "state_logs",
  "segments",
  "daily_summaries",
  "refusal_events",
  "captures",
];

export interface SqlQueryInput {
  query: string;
}

export interface SqlQueryResult {
  success: boolean;
  data: unknown[] | null;
  row_count: number;
  error: string | null;
  query: string;
}

/**
 * Validate that the query only references allowed tables.
 * This is a basic safety check, not a full SQL parser.
 */
function validateQuery(query: string): { valid: boolean; error?: string } {
  const lowerQuery = query.toLowerCase();

  // Check for dangerous operations on system tables
  const dangerousPatterns = [
    /drop\s+table/i,
    /drop\s+database/i,
    /truncate\s+table/i,
    /alter\s+table/i,
    /create\s+table/i,
    /pg_/i, // PostgreSQL system tables
    /information_schema/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return {
        valid: false,
        error: `Query contains disallowed operation: ${pattern.source}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Execute a SQL query against the Veto database.
 * Supports SELECT, INSERT, UPDATE, DELETE on veto tables.
 */
export async function vetoSqlQuery(input: SqlQueryInput): Promise<SqlQueryResult> {
  const { query } = input;

  // Validate query
  const validation = validateQuery(query);
  if (!validation.valid) {
    return {
      success: false,
      data: null,
      row_count: 0,
      error: validation.error || "Query validation failed",
      query,
    };
  }

  try {
    // Use the exec_sql PostgreSQL function (must be created via setup-sql-query.sql)
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: query });

    if (error) {
      // If the exec_sql function doesn't exist, provide helpful error
      if (error.message.includes("function") && error.message.includes("does not exist")) {
        return {
          success: false,
          data: null,
          row_count: 0,
          error: "SQL function not available. Run veto/src/db/setup-sql-query.sql in Supabase to enable.",
          query,
        };
      }

      return {
        success: false,
        data: null,
        row_count: 0,
        error: error.message,
        query,
      };
    }

    // Handle the response from exec_sql
    // SELECT queries return an array, INSERT/UPDATE/DELETE return an object
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
        row_count: data.length,
        error: null,
        query,
      };
    }

    // Non-SELECT statement or error
    if (data && typeof data === "object") {
      if ("error" in data) {
        return {
          success: false,
          data: null,
          row_count: 0,
          error: String(data.error),
          query,
        };
      }
      // Successful INSERT/UPDATE/DELETE
      return {
        success: true,
        data: [data],
        row_count: 1,
        error: null,
        query,
      };
    }

    return {
      success: true,
      data: data ? [data] : [],
      row_count: data ? 1 : 0,
      error: null,
      query,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      row_count: 0,
      error: err instanceof Error ? err.message : "Unknown error",
      query,
    };
  }
}
