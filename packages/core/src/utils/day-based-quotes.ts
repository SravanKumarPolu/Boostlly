import { Source } from "../types";

/**
 * Day-based Quote Provider Mapping
 *
 * Maps each day of the week to a specific quote provider.
 * This creates a predictable yet varied experience where users
 * get quotes from different sources throughout the week.
 */

export interface DayProviderMapping {
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  provider: Source;
  description: string;
}

/**
 * Weekly provider schedule
 * Each day of the week is assigned a specific quote source
 */
export const WEEKLY_PROVIDER_SCHEDULE: readonly DayProviderMapping[] = [
  {
    day: 0, // Sunday
    dayName: "Sunday",
    provider: "DummyJSON",
    description: "Fallback quotes for offline reliability",
  },
  {
    day: 1, // Monday
    dayName: "Monday",
    provider: "ZenQuotes",
    description: "Start the week with zen wisdom",
  },
  {
    day: 2, // Tuesday
    dayName: "Tuesday",
    provider: "Quotable",
    description: "Quotable's inspiring collection",
  },
  {
    day: 3, // Wednesday
    dayName: "Wednesday",
    provider: "FavQs",
    description: "Midweek motivation from FavQs",
  },
  {
    day: 4, // Thursday
    dayName: "Thursday",
    provider: "Stoic Quotes",
    description: "Thursday wisdom from stoic philosophy",
  },
  {
    day: 5, // Friday
    dayName: "Friday",
    provider: "QuoteGarden",
    description: "End the week with Quote Garden's curated collection",
  },
  {
    day: 6, // Saturday
    dayName: "Saturday",
    provider: "Programming Quotes",
    description: "Weekend coding wisdom for developers",
  },
] as const;

/**
 * Fallback provider chain for when the primary provider fails
 * Ordered by reliability and API quality
 */
export const FALLBACK_CHAIN: readonly Source[] = [
  "DummyJSON", // Primary fallback - reliable backup for all Mon-Sat APIs
  "ZenQuotes", // Most reliable
  "Quotable", // Large database, no API key
  "FavQs", // Good quality
  "QuoteGarden", // Curated collection
  "Stoic Quotes", // Stoic philosophy
  "Programming Quotes", // Programming wisdom
  "They Said So", // Additional option
  "DummyJSON", // Fallback quotes
] as const;

/**
 * Get the primary provider for today
 *
 * @param date - Optional date to check (defaults to today)
 * @returns The provider assigned to this day of the week
 */
export function getTodaysProvider(date: Date = new Date()): DayProviderMapping {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return WEEKLY_PROVIDER_SCHEDULE[dayOfWeek];
}

/**
 * Get the provider for a specific day of the week
 *
 * @param dayOfWeek - Day number (0 = Sunday, 6 = Saturday)
 * @returns The provider assigned to this day
 */
export function getProviderForDay(dayOfWeek: number): DayProviderMapping {
  const normalizedDay = dayOfWeek % 7; // Ensure it's 0-6
  return WEEKLY_PROVIDER_SCHEDULE[normalizedDay];
}

/**
 * Get the fallback chain excluding the primary provider
 *
 * @param primaryProvider - The provider that failed
 * @returns Array of fallback providers to try in order
 */
export function getFallbackChain(primaryProvider: Source): readonly Source[] {
  return FALLBACK_CHAIN.filter((source) => source !== primaryProvider);
}

/**
 * Get a user-friendly display name for a provider
 *
 * @param source - The provider source
 * @returns Formatted display name
 */
export function getProviderDisplayName(source: Source): string {
  const displayNames: Record<Source, string> = {
    ZenQuotes: "ZenQuotes",
    Quotable: "Quotable",
    FavQs: "FavQs",
    "They Said So": "They Said So",
    QuoteGarden: "Quote Garden",
    "Stoic Quotes": "Stoic Quotes",
    "Programming Quotes": "Programming Quotes",
    DummyJSON: "DummyJSON",
  };
  return displayNames[source] || source;
}

/**
 * Get a description of today's provider
 *
 * @returns User-friendly string describing today's quote source
 */
export function getTodaysProviderInfo(): string {
  const today = getTodaysProvider();
  return `${today.dayName}'s quotes from ${getProviderDisplayName(today.provider)}`;
}

/**
 * Get the full weekly schedule as a readable string
 *
 * @returns Formatted schedule for the entire week
 */
export function getWeeklySchedule(): string {
  return WEEKLY_PROVIDER_SCHEDULE.map(
    (mapping) =>
      `${mapping.dayName}: ${getProviderDisplayName(mapping.provider)} - ${mapping.description}`,
  ).join("\n");
}

/**
 * Check if a provider is a local/offline provider
 *
 * @param source - The provider to check
 * @returns true if the provider doesn't require network access
 */
export function isOfflineProvider(source: Source): boolean {
  return source === "DummyJSON";
}

/**
 * Check if a provider is an API provider
 *
 * @param source - The provider to check
 * @returns true if the provider requires network access
 */
export function isAPIProvider(source: Source): boolean {
  return !isOfflineProvider(source);
}
