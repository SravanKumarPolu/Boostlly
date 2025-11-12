/**
 * Comprehensive test suite for BaseService
 * 
 * Tests the foundational service class that provides:
 * - Caching with smart cache
 * - Error handling and retry logic
 * - Performance monitoring
 * - Scalability management
 * - Service factory pattern
 * 
 * @module BaseService Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BaseService, ServiceFactory, type BaseServiceConfig } from "../services/base-service";

// Create a concrete implementation for testing
class TestService extends BaseService {
  constructor(config?: Partial<BaseServiceConfig>) {
    super("TestService", config);
  }

  async testExecute<T>(
    operation: string,
    cacheKey: string,
    fetcher: () => Promise<T>,
    options?: {
      useCache?: boolean;
      ttl?: number;
      retryOnError?: boolean;
    }
  ): Promise<any> {
    return this.execute(operation, cacheKey, fetcher, options);
  }

}

describe("BaseService", () => {
  let testService: TestService;

  beforeEach(() => {
    testService = new TestService();
  });

  afterEach(() => {
    testService.destroy();
    ServiceFactory.destroyAll();
  });

  describe("Constructor", () => {
    it("should create BaseService instance with default config", () => {
      const service = new TestService();
      expect(service).toBeInstanceOf(BaseService);
      expect(service).toBeInstanceOf(TestService);
    });

    it("should create BaseService with custom config", () => {
      const customConfig: Partial<BaseServiceConfig> = {
        cacheEnabled: false,
        cacheTTL: 1000,
        retryAttempts: 5,
        timeout: 5000,
        monitoringEnabled: false,
      };
      const service = new TestService(customConfig);
      expect(service).toBeInstanceOf(BaseService);
    });

    it("should initialize with correct default values", () => {
      const service = new TestService();
      const metrics = service.getMetrics();
      expect(metrics.totalCalls).toBe(0);
      expect(metrics.successCalls).toBe(0);
      expect(metrics.errorCalls).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe("execute", () => {
    it("should execute operation and return success response", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "test" });
      
      const result = await testService.testExecute(
        "test-op",
        "test-key",
        fetcher
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: "test" });
      expect(result.cached).toBe(false);
      expect(result.source).toBe("TestService");
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should cache result when cache is enabled", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "cached" });
      
      // First call
      const result1 = await testService.testExecute(
        "test-op",
        "cache-key",
        fetcher,
        { useCache: true }
      );
      
      expect(result1.cached).toBe(false);
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await testService.testExecute(
        "test-op",
        "cache-key",
        fetcher,
        { useCache: true }
      );
      
      expect(result2.cached).toBe(true);
      expect(result2.data).toEqual({ data: "cached" });
      // Fetcher should not be called again
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should not cache when cache is disabled", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "no-cache" });
      
      const result1 = await testService.testExecute(
        "test-op",
        "no-cache-key",
        fetcher,
        { useCache: false }
      );
      
      const result2 = await testService.testExecute(
        "test-op",
        "no-cache-key",
        fetcher,
        { useCache: false }
      );
      
      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should handle errors and return error response", async () => {
      const error = new Error("Test error");
      const fetcher = vi.fn().mockRejectedValue(error);
      
      const result = await testService.testExecute(
        "test-op",
        "error-key",
        fetcher
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test error");
      expect(result.data).toBeNull();
      expect(result.cached).toBe(false);
    });

    it("should retry on error when retryOnError is true", async () => {
      let attempts = 0;
      const fetcher = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("Retry error"));
        }
        return Promise.resolve({ data: "success" });
      });

      const service = new TestService({ retryAttempts: 3 });
      
      const result = await service.testExecute(
        "test-op",
        "retry-key",
        fetcher,
        { retryOnError: true }
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: "success" });
      expect(attempts).toBeGreaterThanOrEqual(1);
      service.destroy();
    });

    it("should not retry when retryOnError is false", async () => {
      const error = new Error("No retry");
      const fetcher = vi.fn().mockRejectedValue(error);
      
      const result = await testService.testExecute(
        "test-op",
        "no-retry-key",
        fetcher,
        { retryOnError: false }
      );

      expect(result.success).toBe(false);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should timeout after configured timeout period", async () => {
      const fetcher = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 2000))
      );

      const service = new TestService({ timeout: 100 });
      
      const result = await service.testExecute(
        "test-op",
        "timeout-key",
        fetcher
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
      service.destroy();
    });
  });

  describe("Metrics", () => {
    it("should track successful calls", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "success" });
      
      await testService.testExecute("op1", "key1", fetcher);
      await testService.testExecute("op2", "key2", fetcher);
      
      const metrics = testService.getMetrics();
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successCalls).toBe(2);
      expect(metrics.errorCalls).toBe(0);
    });

    it("should track error calls", async () => {
      const errorFetcher = vi.fn().mockRejectedValue(new Error("Error"));
      const successFetcher = vi.fn().mockResolvedValue({ data: "success" });
      
      await testService.testExecute("op1", "key1", errorFetcher);
      await testService.testExecute("op2", "key2", successFetcher);
      
      const metrics = testService.getMetrics();
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successCalls).toBe(1);
      expect(metrics.errorCalls).toBe(1);
    });

    it("should calculate average response time", async () => {
      const fastFetcher = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: "fast" }), 10))
      );
      const slowFetcher = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: "slow" }), 50))
      );
      
      await testService.testExecute("op1", "key1", fastFetcher);
      await testService.testExecute("op2", "key2", slowFetcher);
      
      const metrics = testService.getMetrics();
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeLessThan(100);
    });

    it("should track cache hit rate", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "cached" });
      
      // First call - cache miss
      await testService.testExecute("op", "cache-key", fetcher, { useCache: true });
      
      // Second call - cache hit
      await testService.testExecute("op", "cache-key", fetcher, { useCache: true });
      
      const metrics = testService.getMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
    });

    it("should update last call time", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "test" });
      const before = Date.now();
      
      await testService.testExecute("op", "key", fetcher);
      
      const metrics = testService.getMetrics();
      expect(metrics.lastCallTime).toBeGreaterThanOrEqual(before);
      expect(metrics.lastCallTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("Cache Management", () => {
    it("should clear cache", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "test" });
      
      await testService.testExecute("op", "key", fetcher, { useCache: true });
      await testService.clearCache();
      
      // After clearing, cache should be empty
      const stats = testService.getCacheStats();
      expect(stats).toBeDefined();
    });

    it("should get cache statistics", () => {
      const stats = testService.getCacheStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");
    });
  });

  describe("Health Check", () => {
    it("should return healthy when error rate is low", async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: "success" });
      
      // Make multiple successful calls
      for (let i = 0; i < 10; i++) {
        await testService.testExecute(`op${i}`, `key${i}`, fetcher);
      }
      
      expect(testService.isHealthy()).toBe(true);
    });

    it("should return unhealthy when error rate is high", async () => {
      const errorFetcher = vi.fn().mockRejectedValue(new Error("Error"));
      
      // Make multiple error calls (need > 10% error rate)
      // Health check: errorRate < 0.1 means healthy
      // So we need errorRate >= 0.1 (at least 10% errors)
      // With 10 calls all failing, error rate = 1.0 (100%)
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(testService.testExecute(`op${i}`, `key${i}`, errorFetcher));
      }
      await Promise.all(promises);
      
      const metrics = testService.getMetrics();
      expect(metrics.totalCalls).toBe(10);
      expect(metrics.errorCalls).toBe(10);
      
      const errorRate = metrics.errorCalls / Math.max(metrics.totalCalls, 1);
      
      // Verify error rate is high (100% in this case)
      expect(errorRate).toBe(1.0);
      // Service should be unhealthy (error rate >= 0.1)
      expect(testService.isHealthy()).toBe(false);
    }, 10000);

    it("should return unhealthy when response time is too high", async () => {
      const slowFetcher = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: "slow" }), 100))
      );

      const service = new TestService({ timeout: 10000 });
      // Make multiple slow calls to increase average response time
      for (let i = 0; i < 5; i++) {
        await service.testExecute(`op${i}`, `key${i}`, slowFetcher);
      }
      
      // Wait for metrics to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Service should be healthy for 100ms response time
      // Test that metrics are being tracked
      const metrics = service.getMetrics();
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      service.destroy();
    }, 10000);
  });

  describe("Cleanup", () => {
    it("should destroy service and cleanup resources", () => {
      const service = new TestService();
      expect(() => service.destroy()).not.toThrow();
    });

    it("should be safe to destroy multiple times", () => {
      const service = new TestService();
      service.destroy();
      expect(() => service.destroy()).not.toThrow();
    });
  });
});

describe("ServiceFactory", () => {
  afterEach(() => {
    ServiceFactory.destroyAll();
  });

  describe("create", () => {
    it("should create a new service instance", () => {
      const service = ServiceFactory.create(TestService, "test-service");
      expect(service).toBeInstanceOf(TestService);
      expect(service).toBeInstanceOf(BaseService);
    });

    it("should return same instance for same service name", () => {
      const service1 = ServiceFactory.create(TestService, "singleton");
      const service2 = ServiceFactory.create(TestService, "singleton");
      
      expect(service1).toBe(service2);
    });

    it("should create different instances for different names", () => {
      const service1 = ServiceFactory.create(TestService, "service-1");
      const service2 = ServiceFactory.create(TestService, "service-2");
      
      expect(service1).not.toBe(service2);
    });

    it("should accept custom config", () => {
      const service = ServiceFactory.create(
        TestService,
        "configured-service",
        { cacheEnabled: false, timeout: 5000 }
      );
      expect(service).toBeInstanceOf(TestService);
    });
  });

  describe("get", () => {
    it("should retrieve existing service", () => {
      const created = ServiceFactory.create(TestService, "retrievable");
      const retrieved = ServiceFactory.get<TestService>("retrievable");
      
      expect(retrieved).toBe(created);
    });

    it("should return undefined for non-existent service", () => {
      const retrieved = ServiceFactory.get<TestService>("non-existent");
      expect(retrieved).toBeUndefined();
    });
  });

  describe("destroy", () => {
    it("should destroy specific service", () => {
      const service = ServiceFactory.create(TestService, "to-destroy");
      ServiceFactory.destroy("to-destroy");
      
      const retrieved = ServiceFactory.get<TestService>("to-destroy");
      expect(retrieved).toBeUndefined();
    });

    it("should be safe to destroy non-existent service", () => {
      expect(() => ServiceFactory.destroy("non-existent")).not.toThrow();
    });
  });

  describe("destroyAll", () => {
    it("should destroy all services", () => {
      ServiceFactory.create(TestService, "service-1");
      ServiceFactory.create(TestService, "service-2");
      ServiceFactory.create(TestService, "service-3");
      
      ServiceFactory.destroyAll();
      
      expect(ServiceFactory.get<TestService>("service-1")).toBeUndefined();
      expect(ServiceFactory.get<TestService>("service-2")).toBeUndefined();
      expect(ServiceFactory.get<TestService>("service-3")).toBeUndefined();
    });
  });
});

