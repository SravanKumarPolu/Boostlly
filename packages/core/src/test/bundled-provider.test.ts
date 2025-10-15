/**
 * Unit tests for bundled quote provider
 * Tests quote loading and deterministic selection
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BundledProvider } from "../services/providers/bundled";

// Mock fetch
global.fetch = vi.fn();

describe("BundledProvider", () => {
  let provider: BundledProvider;

  beforeEach(() => {
    provider = new BundledProvider();
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with fallback quotes", () => {
      expect(provider).toBeDefined();
      expect(provider.name).toBe("Bundled");
    });
  });

  describe("random", () => {
    it("should return a quote with daily tags", async () => {
      // Mock successful fetch
      const mockQuotes = {
        quotes: [
          {
            id: "1",
            text: "Test quote",
            author: "Test Author",
            categories: ["motivation"],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      } as Response);

      const result = await provider.random();

      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("id");
      expect(result.tags).toContain("daily");
      expect(result.tags).toContain("deterministic");
    });

    it("should handle fetch errors gracefully", async () => {
      // Mock fetch error
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await provider.random();

      // Should return a fallback quote
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("author");
      expect(result.text).toBe(
        "The only way to do great work is to love what you do.",
      );
      expect(result.author).toBe("Steve Jobs");
    });

    it("should return same quote for same date", async () => {
      const mockQuotes = {
        quotes: [
          {
            id: "1",
            text: "Quote 1",
            author: "Author 1",
            categories: ["motivation"],
          },
          {
            id: "2",
            text: "Quote 2",
            author: "Author 2",
            categories: ["success"],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      } as Response);

      // Mock getDateKey to return consistent date
      vi.doMock("../utils/date-utils", () => ({
        getDateKey: () => "2024-01-15",
        pickQuote: (quotes: any[], dateKey: string) => quotes[0],
      }));

      const result1 = await provider.random();
      const result2 = await provider.random();

      expect(result1.id).toBe(result2.id);
    });
  });

  describe("search", () => {
    it("should search through quotes", async () => {
      const mockQuotes = {
        quotes: [
          {
            id: "1",
            text: "Success quote",
            author: "Author 1",
            categories: ["success"],
          },
          {
            id: "2",
            text: "Motivation quote",
            author: "Author 2",
            categories: ["motivation"],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      } as Response);

      const results = await provider.search("success");

      expect(results).toHaveLength(1);
      expect(results[0].text).toContain("Success");
    });

    it("should return empty array when no matches", async () => {
      const mockQuotes = {
        quotes: [
          {
            id: "1",
            text: "Success quote",
            author: "Author 1",
            categories: ["success"],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      } as Response);

      const results = await provider.search("nonexistent");

      expect(results).toHaveLength(0);
    });
  });

  describe("getCategories", () => {
    it("should return available categories", async () => {
      const mockQuotes = {
        quotes: [
          {
            id: "1",
            text: "Quote 1",
            author: "Author 1",
            categories: ["motivation", "success"],
          },
          {
            id: "2",
            text: "Quote 2",
            author: "Author 2",
            categories: ["motivation"],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuotes),
      } as Response);

      const categories = await provider.getCategories();

      expect(categories).toContain("motivation");
      expect(categories).toContain("success");
    });
  });
});
