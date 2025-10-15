import { format } from "date-fns";

/**
 * Get date key in YYYY-MM-DD format using local timezone
 * This ensures the same quote for everyone on the same calendar date
 */
export function getDateKey(date = new Date()): string {
  return format(date, "yyyy-MM-dd");
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
 */
export function getTodayKey(): string {
  return getDateKey();
}

/**
 * Get quote for a specific date
 */
export function getQuoteForDate<T extends { id: string }>(
  quotes: T[],
  date: Date,
): T {
  const dateKey = getDateKey(date);
  return pickQuote(quotes, dateKey);
}

/**
 * Get quote for today
 */
export function getTodayQuote<T extends { id: string }>(quotes: T[]): T {
  return getQuoteForDate(quotes, new Date());
}
