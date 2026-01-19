/**
 * Date utilities for Veto - all dates are in PST (America/Los_Angeles)
 */

const PST_TIMEZONE = "America/Los_Angeles";

/**
 * Get today's date in YYYY-MM-DD format in PST timezone
 */
export function getTodayDatePST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: PST_TIMEZONE });
}

/**
 * Convert a Date object to YYYY-MM-DD string in PST timezone
 */
export function toDateStringPST(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: PST_TIMEZONE });
}

/**
 * Get a date N days ago in YYYY-MM-DD format in PST timezone
 */
export function getDaysAgoPST(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return toDateStringPST(date);
}
