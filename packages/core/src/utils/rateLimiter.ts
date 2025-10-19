/**
 * Client-side rate limiting for API requests
 */

import { extensionFetch } from "./network";

export interface RateLimiterOptions {
  capacity?: number;
  refillPerMin?: number;
}

export function createLimiter({
  capacity = 4,
  refillPerMin = 8,
}: RateLimiterOptions = {}) {
  let tokens = capacity;
  let last = Date.now();

  return function allow(): boolean {
    const now = Date.now();
    const refill = ((now - last) / 60000) * refillPerMin;
    tokens = Math.min(capacity, tokens + refill);
    last = now;

    if (tokens >= 1) {
      tokens -= 1;
      return true;
    }
    return false;
  };
}

// Create a global rate limiter instance
const allow = createLimiter({ capacity: 4, refillPerMin: 8 });

/**
 * Rate-limited fetch wrapper
 * Uses extensionFetch which automatically routes through background worker in Chrome extensions
 */
export async function guardedFetch(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs: number = 10000, // 10 second default timeout
): Promise<Response> {
  if (!allow()) {
    throw new Error("rate_limited");
  }
  const url = typeof input === "string" ? input : input.url;
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await extensionFetch(url, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Create a rate limiter for specific endpoints
 */
export function createEndpointLimiter(
  endpoint: string,
  options: RateLimiterOptions = {},
) {
  const limiter = createLimiter(options);

  return {
    allow: () => limiter(),
    endpoint,
  };
}

/**
 * Rate-limited fetch with retry logic
 */
export async function guardedFetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  maxRetries: number = 2,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await guardedFetch(input, init);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.message === "rate_limited") {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-rate-limit errors should not be retried
      throw error;
    }
  }

  throw lastError!;
}
