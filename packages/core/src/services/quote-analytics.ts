/**
 * Analytics and Health Monitoring for Quote Providers
 * 
 * Manages analytics tracking, health status monitoring, and performance metrics
 * for quote providers.
 */

import type { Source, QuoteAnalytics, APIHealthStatus, Quote } from "../types";
import { StorageService } from "@boostlly/platform";
import { logDebug, logError } from "../utils/logger";
import type { QuoteProvider } from "./providers/base";

export interface PerformanceMetrics {
  totalCalls: number;
  successCalls: number;
  avgResponseTime: number;
}

export interface HealthMonitoringConfig {
  healthCheckIntervalMs: number;
  degradedThreshold: number;
  downThreshold: number;
}

export class QuoteAnalyticsManager {
  private storage: StorageService;
  private analytics: QuoteAnalytics;
  private healthStatus: Map<Source, APIHealthStatus> = new Map();
  private performanceMetrics: Map<Source, PerformanceMetrics> = new Map();
  private healthCheckInterval: number | null = null;
  private config: HealthMonitoringConfig;
  private providers: QuoteProvider[] = [];

  constructor(
    storage: StorageService,
    config: HealthMonitoringConfig,
    providers: QuoteProvider[]
  ) {
    this.storage = storage;
    this.config = config;
    this.providers = providers;
    this.analytics = this.loadAnalytics();
    this.initializeHealthStatus();
  }

  /**
   * Load analytics from storage
   */
  private loadAnalytics(): QuoteAnalytics {
    try {
      const stored = this.storage.getSync("quoteAnalytics") as QuoteAnalytics | null;
      if (stored && typeof stored === "object") {
        return stored;
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadAnalytics" },
        "QuoteAnalyticsManager",
      );
    }

    return {
      totalQuotes: 0,
      sourceDistribution: {
        ZenQuotes: 0,
        Quotable: 0,
        FavQs: 0,
        "They Said So": 0,
        "Type.fit": 0,
        "Stoic Quotes": 0,
        "Programming Quotes": 0,
        DummyJSON: 0,
      },
      categoryDistribution: {},
      averageRating: 0,
      mostLikedQuotes: [],
      recentlyViewed: [],
      searchHistory: [],
    };
  }

  /**
   * Initialize health status for all sources
   */
  private initializeHealthStatus(): void {
    const sources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
      "Type.fit",
      "Stoic Quotes",
      "Programming Quotes",
      "DummyJSON",
    ];
    
    sources.forEach((source) => {
      this.healthStatus.set(source, {
        source,
        status: "healthy",
        responseTime: 0,
        successRate: 100,
        lastCheck: Date.now(),
        errorCount: 0,
      });
      this.performanceMetrics.set(source, {
        totalCalls: 0,
        successCalls: 0,
        avgResponseTime: 0,
      });
    });
  }

  /**
   * Get analytics
   */
  getAnalytics(): QuoteAnalytics {
    return { ...this.analytics };
  }

  /**
   * Update analytics with a quote view
   */
  updateAnalytics(quote: Quote): void {
    this.analytics.totalQuotes++;
    
    // Update source distribution
    if (quote.source) {
      const source = quote.source as Source;
      this.analytics.sourceDistribution[source] = 
        (this.analytics.sourceDistribution[source] || 0) + 1;
    }
    
    // Update category distribution
    if (quote.category) {
      this.analytics.categoryDistribution[quote.category] = 
        (this.analytics.categoryDistribution[quote.category] || 0) + 1;
    }
    
    // Update recently viewed (keep last 10)
    this.analytics.recentlyViewed = [
      quote,
      ...this.analytics.recentlyViewed.filter(q => q.id !== quote.id)
    ].slice(0, 10);
    
    // Update most liked if quote is liked
    if (quote.isLiked) {
      this.analytics.mostLikedQuotes = [
        quote,
        ...this.analytics.mostLikedQuotes.filter(q => q.id !== quote.id)
      ].slice(0, 10);
    }
    
    // Save to storage
    try {
      this.storage.setSync("quoteAnalytics", this.analytics);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "updateAnalytics" },
        "QuoteAnalyticsManager",
      );
    }
  }

  /**
   * Update search history
   */
  updateSearchHistory(query: string): void {
    this.analytics.searchHistory.unshift(query);
    this.analytics.searchHistory = this.analytics.searchHistory.slice(0, 20);
    
    try {
      this.storage.setSync("quoteAnalytics", this.analytics);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "updateSearchHistory" },
        "QuoteAnalyticsManager",
      );
    }
  }

  /**
   * Get health status for all providers
   */
  getHealthStatus(): APIHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get health status for a specific source
   */
  getSourceHealthStatus(source: Source): APIHealthStatus | undefined {
    return this.healthStatus.get(source);
  }

  /**
   * Update performance metrics for a provider
   */
  updatePerformanceMetrics(
    source: Source,
    success: boolean,
    responseTime: number,
  ): void {
    const metrics = this.performanceMetrics.get(source);
    if (metrics) {
      metrics.totalCalls++;
      if (success) {
        metrics.successCalls++;
      }
      // Calculate weighted average response time
      metrics.avgResponseTime =
        (metrics.avgResponseTime * (metrics.totalCalls - 1) + responseTime) /
        metrics.totalCalls;
      
      // Update health status based on new metrics
      this.updateHealthStatus(source);
    }
  }

  /**
   * Update health status based on performance metrics
   */
  private updateHealthStatus(
    source: Source,
    status?: "healthy" | "degraded" | "down",
  ): void {
    const health = this.healthStatus.get(source);
    const metrics = this.performanceMetrics.get(source);

    if (health && metrics) {
      // Calculate success rate
      const successRate = metrics.totalCalls > 0
        ? metrics.successCalls / metrics.totalCalls
        : 1.0;

      // Auto-determine status if not provided
      if (!status) {
        if (successRate >= this.config.degradedThreshold) {
          status = "healthy";
        } else if (successRate >= this.config.downThreshold) {
          status = "degraded";
        } else {
          status = "down";
        }
      }

      health.status = status;
      health.lastCheck = Date.now();
      health.responseTime = metrics.avgResponseTime;
      health.successRate = successRate * 100; // Convert to percentage
      
      // Update error count based on failures
      if (status === "down") {
        health.errorCount = metrics.totalCalls - metrics.successCalls;
      } else if (status === "healthy") {
        // Reset error count when healthy
        health.errorCount = 0;
      }
    }
  }

  /**
   * Get performance metrics for all sources
   */
  getPerformanceMetrics(): Record<Source, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {};
    this.performanceMetrics.forEach((metrics, source) => {
      result[source] = { ...metrics };
    });
    return result as Record<Source, PerformanceMetrics>;
  }

  /**
   * Prioritize providers by health status
   */
  prioritizeProvidersByHealth(providers: Source[]): Source[] {
    return [...providers].sort((a, b) => {
      const healthA = this.healthStatus.get(a);
      const healthB = this.healthStatus.get(b);
      
      if (!healthA && !healthB) return 0;
      if (!healthA) return 1;
      if (!healthB) return -1;
      
      // Priority: healthy > degraded > down
      const statusPriority: Record<string, number> = {
        healthy: 3,
        degraded: 2,
        down: 1,
      };
      
      const priorityA = (statusPriority[healthA.status as keyof typeof statusPriority] || 0) as number;
      const priorityB = (statusPriority[healthB.status as keyof typeof statusPriority] || 0) as number;
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // If same status, prefer higher success rate
      return healthB.successRate - healthA.successRate;
    });
  }

  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring(): void {
    if (typeof window === "undefined") {
      return;
    }

    // Clear any existing interval
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
    }

    // Perform initial health check
    this.performHealthCheck().catch((error) => {
      logDebug("Initial health check failed", { error });
    });

    // Set up periodic health checks
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck().catch((error) => {
        logDebug("Periodic health check failed", { error });
      });
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health check on all providers
   */
  private async performHealthCheck(): Promise<void> {
    const providersToCheck = Array.from(this.healthStatus.keys());
    
    const healthCheckPromises = providersToCheck.map(async (source) => {
      const provider = this.providers.find((p) => p.name === source);
      if (!provider) return;

      try {
        const startTime = Date.now();
        const healthCheckPromise = provider.random();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), 5000)
        );

        await Promise.race([healthCheckPromise, timeoutPromise]);
        const responseTime = Date.now() - startTime;

        this.updatePerformanceMetrics(source, true, responseTime);
        logDebug(`Health check passed for ${source}`, {
          source,
          responseTime,
        });
      } catch (error) {
        this.updatePerformanceMetrics(source, false, 0);
        logDebug(`Health check failed for ${source}`, {
          source,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval !== null && typeof window !== "undefined") {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Check if a provider is healthy
   */
  isProviderHealthy(source: Source): boolean {
    const health = this.healthStatus.get(source);
    return health ? health.status !== "down" : true;
  }
}

