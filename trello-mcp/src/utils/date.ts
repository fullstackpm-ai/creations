/**
 * Date utilities for Trello MCP - handles UTC <-> PST conversion
 *
 * Trello API stores all dates in UTC. We convert to/from PST for the user.
 */

const PST_TIMEZONE = "America/Los_Angeles";

/**
 * Convert a UTC date string from Trello to PST display format
 * Input: "2026-01-19T01:00:00.000Z" (UTC)
 * Output: "2026-01-18 5:00 PM PST"
 */
export function utcToPstDisplay(utcDateStr: string | null): string | null {
  if (!utcDateStr) return null;

  const date = new Date(utcDateStr);
  return date.toLocaleString("en-US", {
    timeZone: PST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

/**
 * Convert a PST date string to UTC ISO format for Trello API
 * Input: "2026-01-18" or "2026-01-18T17:00" (assumed PST)
 * Output: "2026-01-19T01:00:00.000Z" (UTC)
 *
 * If input is already in UTC format (ends with Z), pass through unchanged.
 */
export function pstToUtc(pstDateStr: string): string {
  // If already UTC format, return as-is
  if (pstDateStr.endsWith("Z")) {
    return pstDateStr;
  }

  // Parse the input as PST
  // For date-only input like "2026-01-18", treat as end of day (11:59 PM PST)
  let dateInput = pstDateStr;
  if (!pstDateStr.includes("T")) {
    dateInput = `${pstDateStr}T23:59:00`;
  }

  // Create a formatter that interprets the time as PST
  const pstDate = new Date(
    new Date(dateInput).toLocaleString("en-US", { timeZone: PST_TIMEZONE })
  );

  // Calculate UTC by using the PST interpretation
  // This is tricky because JS Date is always in local timezone
  // We need to construct the UTC time that corresponds to the PST input

  // Parse components in PST
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Get the original date parts as they were input (treating as PST)
  const inputDate = new Date(dateInput);
  const parts = formatter.formatToParts(inputDate);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "0";

  const year = parseInt(getPart("year"));
  const month = parseInt(getPart("month")) - 1;
  const day = parseInt(getPart("day"));
  const hour = parseInt(getPart("hour"));
  const minute = parseInt(getPart("minute"));

  // Create UTC date - PST is UTC-8, so add 8 hours
  const utcDate = new Date(Date.UTC(year, month, day, hour + 8, minute, 0, 0));

  return utcDate.toISOString();
}

/**
 * Convert a Card object's due date from UTC to PST display
 */
export function convertCardDueToPst<T extends { due: string | null }>(
  card: T
): T & { duePst: string | null } {
  return {
    ...card,
    duePst: utcToPstDisplay(card.due),
  };
}

/**
 * Convert an array of cards' due dates from UTC to PST display
 */
export function convertCardsDueToPst<T extends { due: string | null }>(
  cards: T[]
): (T & { duePst: string | null })[] {
  return cards.map(convertCardDueToPst);
}
