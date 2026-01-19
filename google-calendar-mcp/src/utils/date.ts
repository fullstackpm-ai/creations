/**
 * Date utilities for Google Calendar MCP - handles PST timezone
 *
 * All user-facing dates should be in PST (America/Los_Angeles).
 * Google Calendar API accepts timezone parameter for queries.
 */

export const PST_TIMEZONE = "America/Los_Angeles";

/**
 * Parse a date string (YYYY-MM-DD) as PST and return start of that day.
 * This correctly handles the timezone so "2026-01-19" means Jan 19 in PST,
 * not UTC (which would be off by a day in PST).
 *
 * @param dateStr - Date in YYYY-MM-DD format, interpreted as PST
 * @returns Date object representing midnight PST on that day
 */
export function parseDateAsPST(dateStr: string): Date {
  // Parse the date components
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a date string with time in PST format
  // We use a formatter to get the UTC offset for PST on that date
  const tempDate = new Date(year, month - 1, day, 12, 0, 0); // noon to avoid DST edge cases

  // Get the PST offset for this date (handles DST automatically)
  const pstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format in PST to get the actual PST date components
  const parts = pstFormatter.formatToParts(tempDate);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "0";

  // Now create a date at midnight PST for the requested date
  // by calculating the UTC time that corresponds to midnight PST
  const pstMidnight = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`
  );

  // Get offset between local and PST
  const localOffset = pstMidnight.getTimezoneOffset(); // minutes from UTC
  const pstOffset = getPSTOffset(new Date(year, month - 1, day));

  // Adjust to get the correct UTC time for PST midnight
  const utcTime =
    pstMidnight.getTime() - localOffset * 60000 + pstOffset * 60000;
  return new Date(utcTime);
}

/**
 * Get PST offset in minutes (negative value, e.g., -480 for PST, -420 for PDT)
 */
function getPSTOffset(date: Date): number {
  // Create two date strings: one in UTC, one in PST
  const utcDate = new Date(
    date.toLocaleString("en-US", { timeZone: "UTC" })
  );
  const pstDate = new Date(
    date.toLocaleString("en-US", { timeZone: PST_TIMEZONE })
  );
  return (utcDate.getTime() - pstDate.getTime()) / 60000;
}

/**
 * Get the start of day (specific hour) in PST for a given date.
 *
 * @param dateStr - Date in YYYY-MM-DD format, interpreted as PST
 * @param hour - Hour of day (0-23) in PST
 * @returns Date object representing that hour in PST
 */
export function getTimeInPST(dateStr: string, hour: number): Date {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Calculate PST offset for this date
  const pstOffset = getPSTOffset(new Date(year, month - 1, day));

  // Create UTC time that corresponds to the requested PST time
  // PST = UTC - 8 (or UTC - 7 during PDT)
  // So UTC = PST + offset
  const utcTime = Date.UTC(year, month - 1, day, hour, 0, 0, 0) + pstOffset * 60000;
  return new Date(utcTime);
}

/**
 * Get today's date in YYYY-MM-DD format in PST timezone
 */
export function getTodayPST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: PST_TIMEZONE });
}

/**
 * Convert a Date to YYYY-MM-DD format in PST timezone
 */
export function toDateStringPST(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: PST_TIMEZONE });
}
