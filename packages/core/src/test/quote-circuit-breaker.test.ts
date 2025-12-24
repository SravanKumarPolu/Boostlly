/**
 * Tests for QuoteCircuitBreaker
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { QuoteCircuitBreaker } from "../services/quote-circuit-breaker";
import type { Source } from "../types";

describe("QuoteCircuitBreaker", () => {
  let circuitBreaker: QuoteCircuitBreaker;
  const config = {
    failureThreshold: 3,
    resetTimeoutMs: 1000,
  };

  beforeEach(() => {
    circuitBreaker = new QuoteCircuitBreaker(config);
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with config", () => {
      expect(circuitBreaker).toBeDefined();
    });

    it("should initialize circuit breakers for sources", () => {
      const sources: Source[] = ["ZenQuotes", "Quotable", "FavQs"];
      circuitBreaker.initialize(sources);

      sources.forEach((source) => {
        const state = circuitBreaker.getState(source);
        expect(state).toBeDefined();
        expect(state?.state).toBe("closed");
        expect(state?.failures).toBe(0);
      });
    });
  });

  describe("Circuit State Management", () => {
    beforeEach(() => {
      const sources: Source[] = ["ZenQuotes", "Quotable"];
      circuitBreaker.initialize(sources);
    });

    it("should start with closed state", () => {
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
    });

    it("should remain closed after failures below threshold", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
    });

    it("should open after reaching failure threshold", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);
    });

    it("should transition to half-open after reset timeout", () => {
      // Open the circuit
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);

      // Fast-forward time
      vi.useFakeTimers();
      vi.advanceTimersByTime(config.resetTimeoutMs + 100);

      // Should transition to half-open (allows one attempt)
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
      
      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.state).toBe("half-open");

      vi.useRealTimers();
    });
  });

  describe("Success Recording", () => {
    beforeEach(() => {
      circuitBreaker.initialize(["ZenQuotes"]);
    });

    it("should reset circuit breaker on success", () => {
      // Open the circuit
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);

      // Record success
      circuitBreaker.recordSuccess("ZenQuotes");

      // Should be closed again
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.state).toBe("closed");
      expect(state?.failures).toBe(0);
    });

    it("should reset failures on success", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordSuccess("ZenQuotes");

      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.failures).toBe(0);
    });
  });

  describe("Failure Recording", () => {
    beforeEach(() => {
      circuitBreaker.initialize(["ZenQuotes"]);
    });

    it("should increment failure count", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.failures).toBe(1);
    });

    it("should update last failure time", () => {
      const before = Date.now();
      circuitBreaker.recordFailure("ZenQuotes");
      const after = Date.now();
      const state = circuitBreaker.getState("ZenQuotes");
      
      expect(state?.lastFailureTime).toBeGreaterThanOrEqual(before);
      expect(state?.lastFailureTime).toBeLessThanOrEqual(after);
    });

    it("should open circuit after threshold failures", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);

      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);
    });
  });

  describe("State Retrieval", () => {
    beforeEach(() => {
      circuitBreaker.initialize(["ZenQuotes", "Quotable"]);
    });

    it("should return state for initialized source", () => {
      const state = circuitBreaker.getState("ZenQuotes");
      expect(state).toBeDefined();
      expect(state?.state).toBe("closed");
      expect(state?.failures).toBe(0);
    });

    it("should return undefined for uninitialized source", () => {
      const state = circuitBreaker.getState("UnknownSource" as Source);
      expect(state).toBeUndefined();
    });
  });

  describe("Reset Operations", () => {
    beforeEach(() => {
      circuitBreaker.initialize(["ZenQuotes", "Quotable"]);
    });

    it("should reset a specific circuit breaker", () => {
      // Open the circuit
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);

      // Reset
      circuitBreaker.reset("ZenQuotes");

      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.state).toBe("closed");
      expect(state?.failures).toBe(0);
      expect(state?.lastFailureTime).toBe(0);
    });

    it("should reset all circuit breakers", () => {
      // Open both circuits
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      
      circuitBreaker.recordFailure("Quotable");
      circuitBreaker.recordFailure("Quotable");
      circuitBreaker.recordFailure("Quotable");

      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);
      expect(circuitBreaker.isOpen("Quotable")).toBe(true);

      // Reset all
      circuitBreaker.resetAll();

      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
      expect(circuitBreaker.isOpen("Quotable")).toBe(false);
    });

    it("should not affect other sources when resetting one", () => {
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      circuitBreaker.recordFailure("ZenQuotes");
      
      circuitBreaker.recordFailure("Quotable");
      circuitBreaker.recordFailure("Quotable");

      circuitBreaker.reset("ZenQuotes");

      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(false);
      const quotableState = circuitBreaker.getState("Quotable");
      expect(quotableState?.failures).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle uninitialized source gracefully", () => {
      expect(circuitBreaker.isOpen("UnknownSource" as Source)).toBe(false);
      
      circuitBreaker.recordFailure("UnknownSource" as Source);
      circuitBreaker.recordSuccess("UnknownSource" as Source);
      circuitBreaker.reset("UnknownSource" as Source);
      
      // Should not throw errors
      expect(circuitBreaker.getState("UnknownSource" as Source)).toBeUndefined();
    });

    it("should handle multiple rapid failures", () => {
      circuitBreaker.initialize(["ZenQuotes"]);
      
      for (let i = 0; i < 10; i++) {
        circuitBreaker.recordFailure("ZenQuotes");
      }

      expect(circuitBreaker.isOpen("ZenQuotes")).toBe(true);
      const state = circuitBreaker.getState("ZenQuotes");
      expect(state?.failures).toBeGreaterThanOrEqual(config.failureThreshold);
    });
  });
});

