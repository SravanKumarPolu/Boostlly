/**
 * Rate Limiter for Quote Providers
 * 
 * Manages rate limiting for each quote provider to prevent
 * exceeding API rate limits.
 */

import type { Source } from "../types";
import { createLimiter, type RateLimiterOptions } from "../utils/rateLimiter";

export interface RateLimiterConfig {
  [key: string]: RateLimiterOptions;
}

export class QuoteRateLimiter {
  private limiters: Map<Source, () => boolean> = new Map();
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Initialize rate limiters for all sources
   */
  initialize(sources: Source[]): void {
    sources.forEach((source) => {
      const config = this.config[source] || { capacity: 3, refillPerMin: 6 };
      this.limiters.set(source, createLimiter(config));
    });
  }

  /**
   * Check if a provider request is allowed
   */
  isAllowed(source: Source): boolean {
    const limiter = this.limiters.get(source);
    if (!limiter) return true; // No limiter = allow
    
    return limiter(); // Returns true if allowed, false if rate limited
  }

  /**
   * Check if a provider is rate limited
   */
  isRateLimited(source: Source): boolean {
    return !this.isAllowed(source);
  }

  /**
   * Get rate limiter for a source
   */
  getLimiter(source: Source): (() => boolean) | undefined {
    return this.limiters.get(source);
  }
}

