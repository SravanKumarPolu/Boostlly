/**
 * Utility functions for checking quote source
 */

import type { Quote } from "../types";

/**
 * List of API provider sources (external APIs)
 */
export const API_SOURCES = [
  "Quotable",
  "ZenQuotes",
  "FavQs",
  "Type.fit",
  "Stoic Quotes",
  "Programming Quotes",
  "They Said So",
] as const;

/**
 * List of local provider sources (bundled/fallback quotes)
 */
export const LOCAL_SOURCES = [
  "DummyJSON",
  "Bundled",
  "local",
] as const;

/**
 * Check if a quote is from an API provider
 * @param quote - The quote to check
 * @returns true if quote is from API, false if local
 */
export function isQuoteFromAPI(quote: Quote | null | undefined): boolean {
  if (!quote || !quote.source) return false;
  return API_SOURCES.includes(quote.source as any);
}

/**
 * Check if a quote is from local/bundled source
 * @param quote - The quote to check
 * @returns true if quote is from local source, false if API
 */
export function isQuoteFromLocal(quote: Quote | null | undefined): boolean {
  if (!quote) return true; // No quote = assume local fallback
  if (!quote.source) return true; // No source = likely local
  
  // Check if it's explicitly a local source
  if (LOCAL_SOURCES.includes(quote.source as any)) {
    return true;
  }
  
  // If not in API sources, assume local
  return !API_SOURCES.includes(quote.source as any);
}

/**
 * Get a user-friendly label for the quote source
 * @param quote - The quote to get source label for
 * @returns Human-readable source label
 */
export function getQuoteSourceLabel(quote: Quote | null | undefined): string {
  if (!quote || !quote.source) {
    return "Local Quote";
  }
  
  if (isQuoteFromAPI(quote)) {
    return `From ${quote.source}`;
  }
  
  return "Local Quote";
}

/**
 * Get source type (API or Local)
 * @param quote - The quote to check
 * @returns "API" or "Local"
 */
export function getQuoteSourceType(quote: Quote | null | undefined): "API" | "Local" {
  return isQuoteFromAPI(quote) ? "API" : "Local";
}

/**
 * Get source icon/emoji
 * @param quote - The quote to get icon for
 * @returns Emoji or icon name
 */
export function getQuoteSourceIcon(quote: Quote | null | undefined): string {
  return isQuoteFromAPI(quote) ? "🌐" : "📦";
}

