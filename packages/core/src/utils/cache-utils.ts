/**
 * Cache Utilities
 * 
 * Centralized cache-related utilities to eliminate hardcoded values
 * and provide consistent cache management across the application.
 */

import { TIME_CONSTANTS } from '../constants';

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  duration: number;
  key: string;
  ttl?: number;
}

/**
 * Get cache duration in milliseconds
 */
export function getCacheDuration(hours: number = 24): number {
  return hours * 60 * 60 * 1000;
}

/**
 * Get standard cache durations
 */
export const CACHE_DURATIONS = {
  HOUR_1: getCacheDuration(1),
  HOURS_6: getCacheDuration(6),
  HOURS_12: getCacheDuration(12),
  HOURS_24: getCacheDuration(24),
  DAYS_3: getCacheDuration(72),
  WEEK_1: getCacheDuration(168),
} as const;

/**
 * Create cache configuration
 */
export function createCacheConfig(
  key: string,
  duration: number = TIME_CONSTANTS.CACHE_24_HOURS
): CacheConfig {
  return {
    key,
    duration,
    ttl: Date.now() + duration,
  };
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(timestamp: number, duration: number = TIME_CONSTANTS.CACHE_24_HOURS): boolean {
  return Date.now() - timestamp > duration;
}

/**
 * Get cache age in hours
 */
export function getCacheAge(timestamp: number): number {
  return (Date.now() - timestamp) / (60 * 60 * 1000);
}

/**
 * Cache key generators
 */
export const CACHE_KEYS = {
  QUOTE: (source: string, category?: string) => 
    `quote:${source}${category ? `:${category}` : ''}`,
  USER_DATA: (userId: string) => `user:${userId}`,
  SETTINGS: (userId: string) => `settings:${userId}`,
  ANALYTICS: (userId: string, date: string) => `analytics:${userId}:${date}`,
  SEARCH: (query: string) => `search:${query}`,
  /**
   * Unified daily quote cache key
   * Replaces both dailyQuote and dayBasedQuote for consistency
   */
  DAILY_QUOTE: "dailyQuote",
  DAILY_QUOTE_DATE: "dailyQuoteDate",
} as const;
