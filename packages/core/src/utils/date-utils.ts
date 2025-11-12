import { format as formatDate } from "date-fns";

/**
 * Timezone preference type
 */
export type TimezoneMode = "local" | "utc" | string; // string is IANA timezone

/**
 * Format date to YYYY-MM-DD using native JavaScript with timezone support
 */
function formatDateWithTimezone(date: Date, timezone: TimezoneMode): string {
  if (timezone === "local") {
    // Use date-fns format for local timezone (backward compatible)
    return formatDate(date, "yyyy-MM-dd");
  } else if (timezone === "utc") {
    // Use UTC timezone - format as YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } else {
    // Use specified IANA timezone via Intl API
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // en-CA locale returns YYYY-MM-DD format directly
      return formatter.format(date);
    } catch (error) {
      // Fallback to local if timezone is invalid
      console.warn(`Invalid timezone "${timezone}", falling back to local timezone`);
      return formatDate(date, "yyyy-MM-dd");
    }
  }
}

/**
 * Get date key in YYYY-MM-DD format
 * Supports local timezone, UTC, or custom IANA timezone
 * 
 * @param date - Date to convert (defaults to now)
 * @param timezone - Timezone mode: "local", "utc", or IANA timezone string (e.g., "America/New_York")
 * @returns Date key in YYYY-MM-DD format
 * 
 * @example
 * ```typescript
 * getDateKey() // Uses local timezone
 * getDateKey(new Date(), "utc") // Uses UTC
 * getDateKey(new Date(), "America/New_York") // Uses specific timezone
 * ```
 */
export function getDateKey(date: Date = new Date(), timezone: TimezoneMode = "local"): string {
  return formatDateWithTimezone(date, timezone);
}

/**
 * Convert date key to seed format for Picsum URLs
 * YYYY-MM-DD -> YYYYMMDD
 */
export function dateKeyToSeed(key: string): string {
  return key.replace(/-/g, "");
}

/**
 * djb2 hash function for deterministic quote selection
 * This is the exact algorithm specified in the requirements
 */
export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Pick a quote deterministically based on date
 * Same date = same quote for everyone
 */
export function pickQuote<T extends { id: string }>(
  quotes: T[],
  dateKey: string,
): T {
  // Handle null/undefined or empty inputs gracefully
  if (!Array.isArray(quotes) || quotes.length === 0) {
    // @ts-expect-error allow fallback shape for generic T in error scenarios
    return { text: "No quotes available.", author: "System" };
  }

  const index = djb2Hash(dateKey) % quotes.length;
  return quotes[index];
}

/**
 * Get today's date key for quote selection
 * 
 * @param timezone - Timezone mode: "local", "utc", or IANA timezone string
 * @returns Date key for today
 */
export function getTodayKey(timezone: TimezoneMode = "local"): string {
  return getDateKey(new Date(), timezone);
}

/**
 * Get quote for a specific date
 * 
 * @param quotes - Array of quotes to select from
 * @param date - Date to get quote for
 * @param timezone - Timezone mode: "local", "utc", or IANA timezone string
 */
export function getQuoteForDate<T extends { id: string }>(
  quotes: T[],
  date: Date,
  timezone: TimezoneMode = "local",
): T {
  const dateKey = getDateKey(date, timezone);
  return pickQuote(quotes, dateKey);
}

/**
 * Get quote for today
 * 
 * @param quotes - Array of quotes to select from
 * @param timezone - Timezone mode: "local", "utc", or IANA timezone string
 */
export function getTodayQuote<T extends { id: string }>(
  quotes: T[],
  timezone: TimezoneMode = "local",
): T {
  return getQuoteForDate(quotes, new Date(), timezone);
}
