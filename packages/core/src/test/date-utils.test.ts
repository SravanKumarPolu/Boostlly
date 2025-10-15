/**
 * Unit tests for date-utils
 * Tests deterministic quote selection and date key generation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getDateKey, djb2Hash, pickQuote } from "../utils/date-utils";

describe("date-utils", () => {
  describe("getDateKey", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = getDateKey(date);
      expect(result).toBe("2024-01-15");
    });

    it("should use current date when no date provided", () => {
      const result = getDateKey();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("djb2Hash", () => {
    it("should return same hash for same input", () => {
      const input = "test-string";
      const hash1 = djb2Hash(input);
      const hash2 = djb2Hash(input);
      expect(hash1).toBe(hash2);
    });

    it("should return different hashes for different inputs", () => {
      const hash1 = djb2Hash("test1");
      const hash2 = djb2Hash("test2");
      expect(hash1).not.toBe(hash2);
    });

    it("should return positive number", () => {
      const hash = djb2Hash("test");
      expect(hash).toBeGreaterThan(0);
    });

    it("should be deterministic across multiple calls", () => {
      const input = "2024-01-15";
      const hashes = Array.from({ length: 10 }, () => djb2Hash(input));
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1);
    });
  });

  describe("pickQuote", () => {
    const mockQuotes = [
      { id: "1", text: "Quote 1", author: "Author 1" },
      { id: "2", text: "Quote 2", author: "Author 2" },
      { id: "3", text: "Quote 3", author: "Author 3" },
      { id: "4", text: "Quote 4", author: "Author 4" },
      { id: "5", text: "Quote 5", author: "Author 5" },
    ];

    it("should return same quote for same date", () => {
      const dateKey = "2024-01-15";
      const quote1 = pickQuote(mockQuotes, dateKey);
      const quote2 = pickQuote(mockQuotes, dateKey);
      expect(quote1.id).toBe(quote2.id);
    });

    it("should return different quotes for different dates", () => {
      const quote1 = pickQuote(mockQuotes, "2024-01-15");
      const quote2 = pickQuote(mockQuotes, "2024-01-16");
      expect(quote1.id).not.toBe(quote2.id);
    });

    it("should handle empty quotes array", () => {
      const result = pickQuote([], "2024-01-15");
      expect(result).toEqual({
        text: "No quotes available.",
        author: "System",
      });
    });

    it("should handle null/undefined quotes", () => {
      const result1 = pickQuote(null as any, "2024-01-15");
      const result2 = pickQuote(undefined as any, "2024-01-15");

      expect(result1).toEqual({
        text: "No quotes available.",
        author: "System",
      });
      expect(result2).toEqual({
        text: "No quotes available.",
        author: "System",
      });
    });

    it("should distribute quotes evenly across dates", () => {
      const dateKeys = [
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
        "2024-01-19",
        "2024-01-20",
      ];

      const quotes = dateKeys.map((dateKey) => pickQuote(mockQuotes, dateKey));
      const uniqueQuotes = new Set(quotes.map((q) => q.id));

      // Should have some distribution (not all same, not all different)
      expect(uniqueQuotes.size).toBeGreaterThan(1);
      expect(uniqueQuotes.size).toBeLessThanOrEqual(mockQuotes.length);
    });
  });
});
