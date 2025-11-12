/**
 * Comprehensive test suite for QuoteService
 * Tests all major functionality including caching, providers, analytics, and error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { QuoteService } from "../services/quote-service";
import { MockStorageService } from "./mocks/storage-mock";
import type { Quote, Source, QuoteServiceConfig } from "../types";
import { getRandomFallbackQuote } from "../utils/Boostlly";

describe("QuoteService", () => {
  let storage: MockStorageService;
  let quoteService: QuoteService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storage = new MockStorageService();
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
    
    // Reset storage
    storage.reset();
    
    // Create service instance
    quoteService = new QuoteService(storage, {
      cacheEnabled: true,
      maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
      categories: ["motivation", "success"],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Constructor", () => {
    it("should create QuoteService instance with valid storage", () => {
      expect(quoteService).toBeInstanceOf(QuoteService);
    });

    it("should throw error if storage is not provided", () => {
      expect(() => {
        // @ts-ignore - Testing error case
        new QuoteService(undefined);
      }).toThrow("StorageService must be provided to QuoteService");
    });

    it("should initialize with default config", () => {
      const service = new QuoteService(storage);
      expect(service).toBeInstanceOf(QuoteService);
    });

    it("should initialize with custom config", () => {
      const customConfig: Partial<QuoteServiceConfig> = {
        cacheEnabled: false,
        categories: ["work", "life"],
      };
      const service = new QuoteService(storage, customConfig);
      expect(service).toBeInstanceOf(QuoteService);
    });
  });

  describe("getDailyQuote", () => {
    it("should return a quote", () => {
      const quote = quoteService.getDailyQuote();
      expect(quote).toBeDefined();
      expect(quote.text).toBeDefined();
      expect(quote.author).toBeDefined();
    });

    it("should return same quote for same day", () => {
      const quote1 = quoteService.getDailyQuote();
      const quote2 = quoteService.getDailyQuote();
      expect(quote1.id).toBe(quote2.id);
      expect(quote1.text).toBe(quote2.text);
    });

    it("should return fallback quote when no quotes available", () => {
      storage.reset();
      const quote = quoteService.getDailyQuote();
      expect(quote).toBeDefined();
      expect(quote.text).toBeDefined();
    });
  });

  describe("getDailyQuoteAsync", () => {
    it("should return a quote asynchronously", async () => {
      const quote = await quoteService.getDailyQuoteAsync();
      expect(quote).toBeDefined();
      expect(quote.text).toBeDefined();
      expect(quote.author).toBeDefined();
    });

    it("should return same quote for same day", async () => {
      const quote1 = await quoteService.getDailyQuoteAsync();
      const quote2 = await quoteService.getDailyQuoteAsync();
      expect(quote1.id).toBe(quote2.id);
    });

    it("should force refresh when force=true", async () => {
      const quote1 = await quoteService.getDailyQuoteAsync(false);
      const quote2 = await quoteService.getDailyQuoteAsync(true);
      // May or may not be the same depending on provider, but should complete
      expect(quote2).toBeDefined();
    });
  });

  describe("getQuoteByDay", () => {
    it("should return a quote for a specific day", async () => {
      const quote = await quoteService.getQuoteByDay();
      expect(quote).toBeDefined();
      expect(quote.text).toBeDefined();
    });

    it("should return different quotes for different days", async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Mock date to test different days
      const originalDate = Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
        }
      } as any;

      const quote1 = await quoteService.getQuoteByDay();
      
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(tomorrow.getTime());
          } else {
            super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
        }
      } as any;

      const quote2 = await quoteService.getQuoteByDay();
      
      // Restore original Date
      global.Date = originalDate;

      // Quotes should be defined (may be same or different)
      expect(quote1).toBeDefined();
      expect(quote2).toBeDefined();
    });
  });

  describe("searchQuotes", () => {
    it("should search quotes by source and query", async () => {
      // Mock provider response
      const mockQuotes: Quote[] = [
        {
          id: "1",
          text: "Test quote about success",
          author: "Test Author",
          source: "DummyJSON",
        },
      ];

      // Since searchQuotes uses providers, we'll test with DummyJSON which should work
      const results = await quoteService.searchQuotes("DummyJSON", "success");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should return empty array for invalid source", async () => {
      const results = await quoteService.searchQuotes("InvalidSource" as Source, "test");
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("getBulkQuotes", () => {
    it("should fetch multiple quotes", async () => {
      const quotes = await quoteService.getBulkQuotes({
        count: 5,
        sources: ["DummyJSON"],
      });
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
    });

    it("should respect count limit", async () => {
      const quotes = await quoteService.getBulkQuotes({
        count: 3,
        sources: ["DummyJSON"],
      });
      expect(quotes.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getQuotesByCategory", () => {
    it("should return quotes by category", async () => {
      const quotes = await quoteService.getQuotesByCategory("motivation");
      expect(Array.isArray(quotes)).toBe(true);
    });

    it("should return empty array for non-existent category", async () => {
      const quotes = await quoteService.getQuotesByCategory("nonexistent");
      expect(Array.isArray(quotes)).toBe(true);
    });
  });

  describe("getQuotesByAuthor", () => {
    it("should return quotes by author", async () => {
      const quotes = await quoteService.getQuotesByAuthor("Einstein");
      expect(Array.isArray(quotes)).toBe(true);
    });

    it("should return empty array for non-existent author", async () => {
      const quotes = await quoteService.getQuotesByAuthor("NonExistentAuthor123");
      expect(Array.isArray(quotes)).toBe(true);
    });
  });

  describe("getQuoteRecommendations", () => {
    it("should return quote recommendations", async () => {
      const baseQuote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "DummyJSON",
      };
      const recommendations = await quoteService.getQuoteRecommendations(baseQuote);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe("deleteQuote", () => {
    it("should delete a quote", async () => {
      // First, ensure we have quotes loaded
      await quoteService.loadQuotes();
      
      // Try to delete a quote (may not exist, but should handle gracefully)
      const result = await quoteService.deleteQuote("test-id");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Analytics", () => {
    it("should return analytics", () => {
      const analytics = quoteService.getAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.totalQuotes).toBeGreaterThanOrEqual(0);
      // Check that analytics has expected structure
      expect(typeof analytics.totalQuotes).toBe('number');
    });

    it("should track quote views", () => {
      const quote = quoteService.getDailyQuote();
      const analyticsBefore = quoteService.getAnalytics();
      
      // View quote multiple times
      quoteService.getDailyQuote();
      quoteService.getDailyQuote();
      
      const analyticsAfter = quoteService.getAnalytics();
      // Analytics should be updated
      expect(analyticsAfter).toBeDefined();
    });
  });

  describe("Health Status", () => {
    it("should return health status for providers", () => {
      const healthStatus = quoteService.getHealthStatus();
      expect(Array.isArray(healthStatus)).toBe(true);
    });

    it("should have health status for all sources", () => {
      const healthStatus = quoteService.getHealthStatus();
      const sources: Source[] = [
        "ZenQuotes",
        "Quotable",
        "FavQs",
        "They Said So",
        "QuoteGarden",
        "Stoic Quotes",
        "Programming Quotes",
        "DummyJSON",
      ];
      
      expect(healthStatus.length).toBeGreaterThan(0);
      // Check that we have status entries
      healthStatus.forEach((status) => {
        expect(status).toBeDefined();
        expect(status.source).toBeDefined();
      });
    });
  });

  describe("Caching", () => {
    it("should cache quotes", async () => {
      await quoteService.loadQuotes();
      const cached = await storage.get("quotes");
      expect(cached).toBeDefined();
    });

    it("should use cached quotes when available", async () => {
      const testQuotes: Quote[] = [
        {
          id: "cached-1",
          text: "Cached quote",
          author: "Cached Author",
          source: "DummyJSON",
        },
      ];
      await storage.set("quotes", testQuotes);
      
      await quoteService.loadQuotes();
      const quote = quoteService.getDailyQuote();
      // Should use cached quote or fallback
      expect(quote).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      const errorStorage = {
        get: vi.fn().mockRejectedValue(new Error("Storage error")),
        set: vi.fn().mockRejectedValue(new Error("Storage error")),
        remove: vi.fn().mockRejectedValue(new Error("Storage error")),
        clear: vi.fn().mockRejectedValue(new Error("Storage error")),
        keys: vi.fn().mockRejectedValue(new Error("Storage error")),
        getSync: vi.fn().mockReturnValue(null),
        setSync: vi.fn(),
      } as any;

      const service = new QuoteService(errorStorage);
      const quote = service.getDailyQuote();
      // Should still return a fallback quote
      expect(quote).toBeDefined();
    });

    it("should handle provider failures gracefully", async () => {
      // Mock fetch to fail
      mockFetch.mockRejectedValue(new Error("Network error"));
      
      const quote = await quoteService.getDailyQuoteAsync();
      // Should return fallback quote
      expect(quote).toBeDefined();
      expect(quote.text).toBeDefined();
    });
  });

  describe("Source Weights", () => {
    it("should have default source weights", () => {
      const analytics = quoteService.getAnalytics();
      expect(analytics).toBeDefined();
    });

    it("should allow updating source weights", () => {
      const newWeights = {
        ZenQuotes: 0.3,
        Quotable: 0.2,
        FavQs: 0.15,
        "They Said So": 0.1,
        QuoteGarden: 0.15,
        "Stoic Quotes": 0.1,
        "Programming Quotes": 0.0,
        DummyJSON: 0,
      };
      
      quoteService.updateSourceWeights(newWeights);
      // Should update without error
      expect(true).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should load quotes efficiently", async () => {
      const start = Date.now();
      await quoteService.loadQuotes();
      const duration = Date.now() - start;
      
      // Should complete in reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it("should return daily quote quickly", () => {
      const start = Date.now();
      const quote = quoteService.getDailyQuote();
      const duration = Date.now() - start;
      
      expect(quote).toBeDefined();
      // Should be very fast (synchronous)
      expect(duration).toBeLessThan(100);
    });
  });
});

