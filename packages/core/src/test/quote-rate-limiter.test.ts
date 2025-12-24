/**
 * Tests for QuoteRateLimiter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QuoteRateLimiter } from "../services/quote-rate-limiter";
import type { Source } from "../types";

describe("QuoteRateLimiter", () => {
  let rateLimiter: QuoteRateLimiter;
  const config = {
    ZenQuotes: { capacity: 3, refillPerMin: 6 },
    Quotable: { capacity: 5, refillPerMin: 10 },
    FavQs: { capacity: 2, refillPerMin: 4 },
  };

  beforeEach(() => {
    rateLimiter = new QuoteRateLimiter(config);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("should initialize with config", () => {
      expect(rateLimiter).toBeDefined();
    });

    it("should initialize rate limiters for sources", () => {
      const sources: Source[] = ["ZenQuotes", "Quotable", "FavQs"];
      rateLimiter.initialize(sources);

      sources.forEach((source) => {
        const limiter = rateLimiter.getLimiter(source);
        expect(limiter).toBeDefined();
        expect(typeof limiter).toBe("function");
      });
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      rateLimiter.initialize(["ZenQuotes", "Quotable", "FavQs"]);
    });

    it("should allow requests within capacity", () => {
      // ZenQuotes has capacity of 3
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
    });

    it("should rate limit after exceeding capacity", () => {
      // Exceed capacity for ZenQuotes (capacity: 3)
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(false); // Should be rate limited
    });

    it("should respect different capacities for different sources", () => {
      // Quotable has capacity of 5
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed("Quotable")).toBe(true);
      }
      expect(rateLimiter.isAllowed("Quotable")).toBe(false);

      // FavQs has capacity of 2
      expect(rateLimiter.isAllowed("FavQs")).toBe(true);
      expect(rateLimiter.isAllowed("FavQs")).toBe(true);
      expect(rateLimiter.isAllowed("FavQs")).toBe(false);
    });

    it("should refill tokens over time", () => {
      // Exhaust capacity
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed("ZenQuotes");
      }
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(false);

      // Advance time (refillPerMin: 6 means 0.1 tokens per second)
      // So after 10 seconds, we should get 1 token
      vi.advanceTimersByTime(10000);

      // Should allow one more request
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(false);
    });
  });

  describe("isRateLimited", () => {
    beforeEach(() => {
      rateLimiter.initialize(["ZenQuotes"]);
    });

    it("should return false when not rate limited", () => {
      expect(rateLimiter.isRateLimited("ZenQuotes")).toBe(false);
    });

    it("should return true when rate limited", () => {
      // Exhaust capacity
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed("ZenQuotes");
      }
      expect(rateLimiter.isRateLimited("ZenQuotes")).toBe(true);
    });

    it("should be inverse of isAllowed", () => {
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(!rateLimiter.isRateLimited("ZenQuotes"));
      
      // Exhaust capacity
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed("ZenQuotes");
      }
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(!rateLimiter.isRateLimited("ZenQuotes"));
    });
  });

  describe("Limiter Retrieval", () => {
    beforeEach(() => {
      rateLimiter.initialize(["ZenQuotes", "Quotable"]);
    });

    it("should return limiter for initialized source", () => {
      const limiter = rateLimiter.getLimiter("ZenQuotes");
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe("function");
    });

    it("should return undefined for uninitialized source", () => {
      const limiter = rateLimiter.getLimiter("UnknownSource" as Source);
      expect(limiter).toBeUndefined();
    });
  });

  describe("Default Configuration", () => {
    it("should use default config for unconfigured sources", () => {
      const sources: Source[] = ["UnknownSource" as Source];
      rateLimiter.initialize(sources);

      // Default: capacity: 3, refillPerMin: 6
      expect(rateLimiter.isAllowed("UnknownSource" as Source)).toBe(true);
      expect(rateLimiter.isAllowed("UnknownSource" as Source)).toBe(true);
      expect(rateLimiter.isAllowed("UnknownSource" as Source)).toBe(true);
      expect(rateLimiter.isAllowed("UnknownSource" as Source)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should allow requests for uninitialized source", () => {
      // No initialization, should default to allowing
      expect(rateLimiter.isAllowed("UnknownSource" as Source)).toBe(true);
      expect(rateLimiter.isRateLimited("UnknownSource" as Source)).toBe(false);
    });

    it("should handle rapid successive requests", () => {
      rateLimiter.initialize(["ZenQuotes"]);

      // Make rapid requests
      const results: boolean[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.isAllowed("ZenQuotes"));
      }

      // First 3 should be allowed, rest should be rate limited
      expect(results.slice(0, 3).every(r => r === true)).toBe(true);
      expect(results.slice(3).every(r => r === false)).toBe(true);
    });

    it("should handle multiple sources independently", () => {
      rateLimiter.initialize(["ZenQuotes", "Quotable"]);

      // Exhaust ZenQuotes
      for (let i = 0; i < 3; i++) {
        rateLimiter.isAllowed("ZenQuotes");
      }

      // Quotable should still work
      expect(rateLimiter.isAllowed("Quotable")).toBe(true);
      expect(rateLimiter.isAllowed("ZenQuotes")).toBe(false);
    });
  });
});

