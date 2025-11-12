/**
 * Circuit Breaker for Quote Providers
 * 
 * Implements circuit breaker pattern to prevent cascading failures
 * when providers are experiencing issues.
 */

import type { Source } from "../types";
import { logWarning } from "../utils/logger";

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export class QuoteCircuitBreaker {
  private breakers: Map<Source, CircuitBreakerState> = new Map();
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Initialize circuit breakers for all sources
   */
  initialize(sources: Source[]): void {
    sources.forEach((source) => {
      this.breakers.set(source, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      });
    });
  }

  /**
   * Check if circuit breaker is open for a provider
   */
  isOpen(source: Source): boolean {
    const breaker = this.breakers.get(source);
    if (!breaker) return false;
    
    if (breaker.state === 'open') {
      // Check if we should transition to half-open
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      if (timeSinceLastFailure >= this.config.resetTimeoutMs) {
        breaker.state = 'half-open';
        return false; // Allow one attempt
      }
      return true; // Circuit is open, block requests
    }
    
    return false; // Circuit is closed or half-open, allow requests
  }

  /**
   * Record a successful request (reset circuit breaker)
   */
  recordSuccess(source: Source): void {
    const breaker = this.breakers.get(source);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  /**
   * Record a failure (may open circuit breaker)
   */
  recordFailure(source: Source): void {
    const breaker = this.breakers.get(source);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failures >= this.config.failureThreshold) {
        breaker.state = 'open';
        logWarning(
          `Circuit breaker opened for ${source} after ${breaker.failures} failures`,
          { source, failures: breaker.failures },
          "QuoteCircuitBreaker",
        );
      }
    }
  }

  /**
   * Get circuit breaker state for a source
   */
  getState(source: Source): CircuitBreakerState | undefined {
    return this.breakers.get(source);
  }

  /**
   * Reset circuit breaker for a source
   */
  reset(source: Source): void {
    const breaker = this.breakers.get(source);
    if (breaker) {
      breaker.failures = 0;
      breaker.lastFailureTime = 0;
      breaker.state = 'closed';
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => {
      breaker.failures = 0;
      breaker.lastFailureTime = 0;
      breaker.state = 'closed';
    });
  }
}

