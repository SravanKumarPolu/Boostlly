/**
 * Comprehensive test suite for UserAnalyticsService
 * 
 * Tests all major functionality including:
 * - Homepage visit tracking
 * - Read button click tracking
 * - Analytics data retrieval
 * - Data aggregation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserAnalyticsService, StorageLike } from "../services/user-analytics-service";
import { MockStorageService } from "./mocks/storage-mock";

describe("UserAnalyticsService", () => {
  let service: UserAnalyticsService;
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
    service = new UserAnalyticsService(storage);
  });

  describe("Constructor", () => {
    it("should create UserAnalyticsService instance", () => {
      expect(service).toBeInstanceOf(UserAnalyticsService);
    });

    it("should initialize with storage", () => {
      expect(service).toBeDefined();
    });
  });

  describe("Track Homepage Visit", () => {
    it("should track a homepage visit", async () => {
      await expect(service.trackHomepageVisit()).resolves.not.toThrow();
    });

    it("should increment homepage visits count", async () => {
      await service.trackHomepageVisit();
      await service.trackHomepageVisit();
      
      const analytics = await service.getAnalytics("all");
      expect(analytics.totalHomepageVisits).toBeGreaterThanOrEqual(2);
    });

    it("should track visits per day", async () => {
      await service.trackHomepageVisit();
      await service.trackHomepageVisit();
      
      const analytics = await service.getAnalytics("all");
      const today = analytics.dailyData.find(d => {
        const today = new Date().toISOString().split("T")[0];
        return d.date === today;
      });
      
      expect(today).toBeDefined();
      expect(today!.homepageVisits).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Track Read Button Click", () => {
    it("should track a read button click", async () => {
      await expect(service.trackReadButtonClick()).resolves.not.toThrow();
    });

    it("should increment read button clicks count", async () => {
      await service.trackReadButtonClick();
      await service.trackReadButtonClick();
      
      const analytics = await service.getAnalytics("all");
      expect(analytics.totalReadButtonClicks).toBeGreaterThanOrEqual(2);
    });

    it("should track clicks per day", async () => {
      await service.trackReadButtonClick();
      
      const analytics = await service.getAnalytics("all");
      const today = analytics.dailyData.find(d => {
        const today = new Date().toISOString().split("T")[0];
        return d.date === today;
      });
      
      expect(today).toBeDefined();
      expect(today!.readButtonClicks).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Get Analytics", () => {
    it("should return analytics data", async () => {
      const analytics = await service.getAnalytics("all");
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalHomepageVisits).toBe("number");
      expect(typeof analytics.totalReadButtonClicks).toBe("number");
      expect(Array.isArray(analytics.dailyData)).toBe(true);
    });

    it("should return data for 7 days", async () => {
      await service.trackHomepageVisit();
      const analytics = await service.getAnalytics("7d");
      expect(analytics).toBeDefined();
      expect(Array.isArray(analytics.dailyData)).toBe(true);
    });

    it("should return data for 30 days", async () => {
      await service.trackHomepageVisit();
      const analytics = await service.getAnalytics("30d");
      expect(analytics).toBeDefined();
    });

    it("should return data for 90 days", async () => {
      await service.trackHomepageVisit();
      const analytics = await service.getAnalytics("90d");
      expect(analytics).toBeDefined();
    });

    it("should filter data by time range", async () => {
      await service.trackHomepageVisit();
      const allData = await service.getAnalytics("all");
      const weekData = await service.getAnalytics("7d");
      
      // Week data should have same or fewer entries
      expect(weekData.dailyData.length).toBeLessThanOrEqual(allData.dailyData.length);
    });
  });

  describe("Get Daily Chart Data", () => {
    it("should return chart data for homepage visits", async () => {
      await service.trackHomepageVisit();
      const chartData = await service.getDailyChartData("7d");
      
      expect(chartData).toBeDefined();
      expect(Array.isArray(chartData.homepageVisits)).toBe(true);
      expect(chartData.homepageVisits.length).toBeGreaterThan(0);
    });

    it("should return chart data for read button clicks", async () => {
      await service.trackReadButtonClick();
      const chartData = await service.getDailyChartData("7d");
      
      expect(chartData).toBeDefined();
      expect(Array.isArray(chartData.readButtonClicks)).toBe(true);
      expect(chartData.readButtonClicks.length).toBeGreaterThan(0);
    });

    it("should return data for 7 days", async () => {
      const chartData = await service.getDailyChartData("7d");
      expect(chartData.homepageVisits.length).toBe(7);
      expect(chartData.readButtonClicks.length).toBe(7);
    });

    it("should return data for 30 days", async () => {
      const chartData = await service.getDailyChartData("30d");
      expect(chartData.homepageVisits.length).toBe(30);
      expect(chartData.readButtonClicks.length).toBe(30);
    });
  });

  describe("Get Summary", () => {
    it("should return summary statistics", async () => {
      await service.trackHomepageVisit();
      await service.trackReadButtonClick();
      
      const summary = await service.getSummary();
      expect(summary).toBeDefined();
      expect(typeof summary.totalHomepageVisits).toBe("number");
      expect(typeof summary.totalReadButtonClicks).toBe("number");
      expect(typeof summary.todayHomepageVisits).toBe("number");
      expect(typeof summary.todayReadButtonClicks).toBe("number");
      expect(typeof summary.averageDailyVisits).toBe("number");
      expect(typeof summary.averageDailyClicks).toBe("number");
    });

    it("should calculate today's statistics", async () => {
      await service.trackHomepageVisit();
      await service.trackHomepageVisit();
      
      const summary = await service.getSummary();
      expect(summary.todayHomepageVisits).toBeGreaterThanOrEqual(2);
    });

    it("should calculate averages", async () => {
      await service.trackHomepageVisit();
      const summary = await service.getSummary();
      
      expect(summary.averageDailyVisits).toBeGreaterThanOrEqual(0);
      expect(summary.averageDailyClicks).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Clear Analytics", () => {
    it("should clear all analytics data", async () => {
      await service.trackHomepageVisit();
      await service.trackReadButtonClick();
      
      await service.clearAnalytics();
      
      const analytics = await service.getAnalytics("all");
      expect(analytics.totalHomepageVisits).toBe(0);
      expect(analytics.totalReadButtonClicks).toBe(0);
    });

    it("should handle clear when no data exists", async () => {
      await expect(service.clearAnalytics()).resolves.not.toThrow();
    });
  });

  describe("Data Persistence", () => {
    it("should persist data across service instances", async () => {
      await service.trackHomepageVisit();
      
      const newService = new UserAnalyticsService(storage);
      const analytics = await newService.getAnalytics("all");
      expect(analytics.totalHomepageVisits).toBeGreaterThanOrEqual(1);
    });

    it("should handle sync storage methods", async () => {
      const syncStorage: StorageLike = {
        getSync: <T>(key: string) => storage.getSync<T>(key),
        setSync: <T>(key: string, value: T) => storage.setSync(key, value),
        get: async <T>(key: string) => storage.get<T>(key),
        set: async <T>(key: string, value: T) => storage.set(key, value),
      };
      
      const syncService = new UserAnalyticsService(syncStorage);
      await syncService.trackHomepageVisit();
      
      const analytics = await syncService.getAnalytics("all");
      expect(analytics.totalHomepageVisits).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();
      
      const errorStorage: StorageLike = {
        get: async () => {
          throw new Error("Storage error");
        },
        set: async () => {
          throw new Error("Storage error");
        },
      };
      
      const errorService = new UserAnalyticsService(errorStorage);
      // Should not throw, but may log errors
      await expect(errorService.trackHomepageVisit()).resolves.not.toThrow();
      
      // Restore console.error
      console.error = originalError;
    });
  });
});

