/**
 * Tests for QuoteAnalyticsManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QuoteAnalyticsManager } from "../services/quote-analytics";
import { MockStorageService } from "./mocks/storage-mock";
import type { Quote, Source } from "../types";

// Mock provider
const createMockProvider = (name: Source) => ({
  name,
  random: vi.fn().mockResolvedValue({
    id: `quote-${name}`,
    text: "Test quote",
    author: "Test Author",
    source: name,
  }),
  search: vi.fn().mockResolvedValue([]),
});

describe("QuoteAnalyticsManager", () => {
  let analyticsManager: QuoteAnalyticsManager;
  let storage: MockStorageService;
  const config = {
    healthCheckIntervalMs: 60000,
    degradedThreshold: 0.7,
    downThreshold: 0.3,
  };

  beforeEach(() => {
    storage = new MockStorageService();
    const providers = [
      createMockProvider("ZenQuotes"),
      createMockProvider("Quotable"),
    ];
    analyticsManager = new QuoteAnalyticsManager(storage, config, providers);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    analyticsManager.stopHealthMonitoring();
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("should initialize with default analytics", () => {
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.totalQuotes).toBe(0);
      expect(analytics.sourceDistribution).toBeDefined();
      expect(analytics.categoryDistribution).toBeDefined();
      expect(analytics.mostLikedQuotes).toEqual([]);
      expect(analytics.recentlyViewed).toEqual([]);
    });

    it("should load analytics from storage", () => {
      const storedAnalytics = {
        totalQuotes: 10,
        sourceDistribution: { ZenQuotes: 5, Quotable: 5 },
        categoryDistribution: {},
        averageRating: 0,
        mostLikedQuotes: [],
        recentlyViewed: [],
        searchHistory: [],
      };
      storage.setSync("quoteAnalytics", storedAnalytics);

      const newManager = new QuoteAnalyticsManager(
        storage,
        config,
        [createMockProvider("ZenQuotes")]
      );
      const analytics = newManager.getAnalytics();
      expect(analytics.totalQuotes).toBe(10);
    });

    it("should initialize health status for all sources", () => {
      const healthStatus = analyticsManager.getHealthStatus();
      expect(healthStatus.length).toBeGreaterThan(0);
      
      healthStatus.forEach((status) => {
        expect(status.status).toBe("healthy");
        expect(status.successRate).toBe(100);
        expect(status.errorCount).toBe(0);
      });
    });
  });

  describe("Analytics Updates", () => {
    it("should update total quotes count", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
      };

      analyticsManager.updateAnalytics(quote);
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.totalQuotes).toBe(1);
    });

    it("should update source distribution", () => {
      const quote1: Quote = {
        id: "1",
        text: "Quote 1",
        author: "Author 1",
        source: "ZenQuotes",
      };
      const quote2: Quote = {
        id: "2",
        text: "Quote 2",
        author: "Author 2",
        source: "Quotable",
      };

      analyticsManager.updateAnalytics(quote1);
      analyticsManager.updateAnalytics(quote2);

      const analytics = analyticsManager.getAnalytics();
      expect(analytics.sourceDistribution.ZenQuotes).toBe(1);
      expect(analytics.sourceDistribution.Quotable).toBe(1);
    });

    it("should update category distribution", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
        category: "motivation",
      };

      analyticsManager.updateAnalytics(quote);
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.categoryDistribution.motivation).toBe(1);
    });

    it("should update recently viewed quotes", () => {
      const quotes: Quote[] = Array.from({ length: 5 }, (_, i) => ({
        id: `quote-${i}`,
        text: `Quote ${i}`,
        author: `Author ${i}`,
        source: "ZenQuotes",
      }));

      quotes.forEach((quote) => {
        analyticsManager.updateAnalytics(quote);
      });

      const analytics = analyticsManager.getAnalytics();
      expect(analytics.recentlyViewed.length).toBe(5);
      expect(analytics.recentlyViewed[0].id).toBe("quote-4"); // Most recent first
    });

    it("should limit recently viewed to 10 quotes", () => {
      const quotes: Quote[] = Array.from({ length: 15 }, (_, i) => ({
        id: `quote-${i}`,
        text: `Quote ${i}`,
        author: `Author ${i}`,
        source: "ZenQuotes",
      }));

      quotes.forEach((quote) => {
        analyticsManager.updateAnalytics(quote);
      });

      const analytics = analyticsManager.getAnalytics();
      expect(analytics.recentlyViewed.length).toBe(10);
    });

    it("should update most liked quotes", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
        isLiked: true,
      };

      analyticsManager.updateAnalytics(quote);
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.mostLikedQuotes.length).toBe(1);
      expect(analytics.mostLikedQuotes[0].id).toBe("1");
    });

    it("should not add non-liked quotes to most liked", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
        isLiked: false,
      };

      analyticsManager.updateAnalytics(quote);
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.mostLikedQuotes.length).toBe(0);
    });

    it("should persist analytics to storage", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
      };

      analyticsManager.updateAnalytics(quote);
      const stored = storage.getSync("quoteAnalytics");
      expect(stored).toBeDefined();
      expect(stored.totalQuotes).toBe(1);
    });
  });

  describe("Search History", () => {
    it("should update search history", () => {
      analyticsManager.updateSearchHistory("test query");
      const analytics = analyticsManager.getAnalytics();
      expect(analytics.searchHistory).toContain("test query");
    });

    it("should limit search history to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        analyticsManager.updateSearchHistory(`query ${i}`);
      }

      const analytics = analyticsManager.getAnalytics();
      expect(analytics.searchHistory.length).toBe(20);
      expect(analytics.searchHistory[0]).toBe("query 24"); // Most recent first
    });

    it("should persist search history to storage", () => {
      analyticsManager.updateSearchHistory("test query");
      const stored = storage.getSync("quoteAnalytics");
      expect(stored.searchHistory).toContain("test query");
    });
  });

  describe("Health Status", () => {
    it("should return health status for all sources", () => {
      const healthStatus = analyticsManager.getHealthStatus();
      expect(Array.isArray(healthStatus)).toBe(true);
      expect(healthStatus.length).toBeGreaterThan(0);
    });

    it("should return health status for specific source", () => {
      const status = analyticsManager.getSourceHealthStatus("ZenQuotes");
      expect(status).toBeDefined();
      expect(status?.source).toBe("ZenQuotes");
      expect(status?.status).toBe("healthy");
    });

    it("should return undefined for unknown source", () => {
      const status = analyticsManager.getSourceHealthStatus("UnknownSource" as Source);
      expect(status).toBeUndefined();
    });
  });

  describe("Performance Metrics", () => {
    it("should update performance metrics on success", () => {
      analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 100);
      const metrics = analyticsManager.getPerformanceMetrics();
      expect(metrics.ZenQuotes.totalCalls).toBe(1);
      expect(metrics.ZenQuotes.successCalls).toBe(1);
      expect(metrics.ZenQuotes.avgResponseTime).toBe(100);
    });

    it("should update performance metrics on failure", () => {
      analyticsManager.updatePerformanceMetrics("ZenQuotes", false, 0);
      const metrics = analyticsManager.getPerformanceMetrics();
      expect(metrics.ZenQuotes.totalCalls).toBe(1);
      expect(metrics.ZenQuotes.successCalls).toBe(0);
    });

    it("should calculate average response time correctly", () => {
      analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 100);
      analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 200);
      analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 300);

      const metrics = analyticsManager.getPerformanceMetrics();
      expect(metrics.ZenQuotes.avgResponseTime).toBe(200); // (100 + 200 + 300) / 3
    });

    it("should update health status based on metrics", () => {
      // Simulate failures to degrade health
      // Success rate: 2/7 = 0.286, which is below downThreshold (0.3), so status should be "down"
      for (let i = 0; i < 5; i++) {
        analyticsManager.updatePerformanceMetrics("ZenQuotes", false, 0);
      }
      for (let i = 0; i < 2; i++) {
        analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 100);
      }

      const status = analyticsManager.getSourceHealthStatus("ZenQuotes");
      expect(status).toBeDefined();
      // Success rate: 2/7 = 0.286, which is below downThreshold (0.3)
      expect(status?.status).toBe("down");
    });
  });

  describe("Provider Prioritization", () => {
    it("should prioritize healthy providers", () => {
      const sources: Source[] = ["ZenQuotes", "Quotable", "FavQs"];
      const prioritized = analyticsManager.prioritizeProvidersByHealth(sources);
      
      // Should return all sources (all are healthy by default)
      expect(prioritized.length).toBe(3);
    });

    it("should prioritize by health status", () => {
      // Make ZenQuotes degraded
      for (let i = 0; i < 3; i++) {
        analyticsManager.updatePerformanceMetrics("ZenQuotes", false, 0);
      }
      analyticsManager.updatePerformanceMetrics("ZenQuotes", true, 100);

      const sources: Source[] = ["ZenQuotes", "Quotable"];
      const prioritized = analyticsManager.prioritizeProvidersByHealth(sources);
      
      // Quotable (healthy) should come before ZenQuotes (degraded)
      expect(prioritized[0]).toBe("Quotable");
    });
  });

  describe("Health Monitoring", () => {
    it("should start health monitoring", () => {
      analyticsManager.startHealthMonitoring();
      // Should not throw
      expect(analyticsManager).toBeDefined();
    });

    it("should stop health monitoring", () => {
      analyticsManager.startHealthMonitoring();
      analyticsManager.stopHealthMonitoring();
      // Should not throw
      expect(analyticsManager).toBeDefined();
    });

    it("should check if provider is healthy", () => {
      expect(analyticsManager.isProviderHealthy("ZenQuotes")).toBe(true);
      
      // Make it down
      for (let i = 0; i < 10; i++) {
        analyticsManager.updatePerformanceMetrics("ZenQuotes", false, 0);
      }
      
      expect(analyticsManager.isProviderHealthy("ZenQuotes")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing storage gracefully", () => {
      const emptyStorage = new MockStorageService();
      const manager = new QuoteAnalyticsManager(
        emptyStorage,
        config,
        [createMockProvider("ZenQuotes")]
      );
      
      const analytics = manager.getAnalytics();
      expect(analytics.totalQuotes).toBe(0);
    });

    it("should handle duplicate quote IDs in recently viewed", () => {
      const quote: Quote = {
        id: "1",
        text: "Test quote",
        author: "Test Author",
        source: "ZenQuotes",
      };

      analyticsManager.updateAnalytics(quote);
      analyticsManager.updateAnalytics(quote);

      const analytics = analyticsManager.getAnalytics();
      expect(analytics.recentlyViewed.length).toBe(1);
      expect(analytics.recentlyViewed[0].id).toBe("1");
    });
  });
});

