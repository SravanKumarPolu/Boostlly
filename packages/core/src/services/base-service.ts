/**
 * Base Service Architecture
 * 
 * Provides a unified foundation for all services with common patterns
 * for caching, error handling, performance monitoring, and scalability.
 */

import { logError, logWarning, logDebug } from '../utils/logger';
import { SmartCache } from '../utils/smart-cache';
import { ScalabilityManager } from '../utils/scalability-manager';

/**
 * Base service configuration interface
 */
export interface BaseServiceConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  retryAttempts: number;
  timeout: number;
  monitoringEnabled: boolean;
}

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  cached: boolean;
  timestamp: number;
  source: string;
}

/**
 * Service metrics interface
 */
export interface ServiceMetrics {
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastCallTime: number;
}

/**
 * Abstract base service class
 * 
 * Provides common functionality for all services including:
 * - Caching with smart cache
 * - Error handling and retry logic
 * - Performance monitoring
 * - Scalability management
 */
export abstract class BaseService {
  protected cache: SmartCache;
  protected scalabilityManager: ScalabilityManager;
  protected config: BaseServiceConfig;
  protected metrics: ServiceMetrics;
  protected serviceName: string;

  constructor(
    serviceName: string,
    config: Partial<BaseServiceConfig> = {}
  ) {
    this.serviceName = serviceName;
    this.config = {
      cacheEnabled: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      retryAttempts: 3,
      timeout: 10000, // 10 seconds
      monitoringEnabled: true,
      ...config,
    };

    this.cache = new SmartCache({
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000,
      defaultTTL: this.config.cacheTTL,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      predictiveCaching: true,
      compression: true,
    });

    this.scalabilityManager = ScalabilityManager.getInstance();
    this.metrics = {
      totalCalls: 0,
      successCalls: 0,
      errorCalls: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      lastCallTime: 0,
    };

    if (this.config.monitoringEnabled) {
      this.scalabilityManager.startMonitoring();
    }
  }

  /**
   * Execute a service operation with caching, error handling, and monitoring
   */
  protected async execute<T>(
    operation: string,
    cacheKey: string,
    fetcher: () => Promise<T>,
    options: {
      useCache?: boolean;
      ttl?: number;
      retryOnError?: boolean;
    } = {}
  ): Promise<ServiceResponse<T>> {
    const startTime = performance.now();
    const {
      useCache = this.config.cacheEnabled,
      ttl = this.config.cacheTTL,
      retryOnError = true,
    } = options;

    try {
      // Check cache first
      if (useCache) {
        const cached = await this.cache.get<T>(cacheKey);
        if (cached !== null) {
          this.updateMetrics(true, performance.now() - startTime, true);
          return {
            data: cached,
            success: true,
            cached: true,
            timestamp: Date.now(),
            source: this.serviceName,
          };
        }
      }

      // Execute with retry logic
      const data = await this.executeWithRetry(fetcher, retryOnError);
      
      // Cache the result
      if (useCache && data) {
        await this.cache.set(cacheKey, data, {
          ttl,
          priority: 1,
          tags: [this.serviceName, operation],
        });
      }

      this.updateMetrics(true, performance.now() - startTime, false);
      
      return {
        data,
        success: true,
        cached: false,
        timestamp: Date.now(),
        source: this.serviceName,
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(false, responseTime, false);
      
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { 
          service: this.serviceName, 
          operation, 
          cacheKey,
          responseTime 
        },
        this.serviceName
      );

      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        cached: false,
        timestamp: Date.now(),
        source: this.serviceName,
      };
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    fetcher: () => Promise<T>,
    retryOnError: boolean
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.executeWithTimeout(fetcher);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (!retryOnError || attempt === this.config.retryAttempts) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        logDebug(`Retry attempt ${attempt} for ${this.serviceName}`, {
          attempt,
          error: lastError.message,
          delay,
        });
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(fetcher: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fetcher()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }

  /**
   * Update service metrics
   */
  private updateMetrics(success: boolean, responseTime: number, cached: boolean): void {
    this.metrics.totalCalls++;
    this.metrics.lastCallTime = Date.now();

    if (success) {
      this.metrics.successCalls++;
    } else {
      this.metrics.errorCalls++;
    }

    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalCalls - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.totalCalls;

    // Update cache hit rate
    if (cached) {
      const totalHits = this.metrics.cacheHitRate * (this.metrics.totalCalls - 1);
      this.metrics.cacheHitRate = (totalHits + 1) / this.metrics.totalCalls;
    } else {
      this.metrics.cacheHitRate = this.metrics.cacheHitRate * (this.metrics.totalCalls - 1) / this.metrics.totalCalls;
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear service cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    logDebug(`Cache cleared for ${this.serviceName}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    const errorRate = this.metrics.errorCalls / Math.max(this.metrics.totalCalls, 1);
    return errorRate < 0.1 && this.metrics.averageResponseTime < 5000; // 5 seconds
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
    if (this.config.monitoringEnabled) {
      this.scalabilityManager.stopMonitoring();
    }
    logDebug(`Service ${this.serviceName} destroyed`);
  }
}

/**
 * Service factory for creating services with consistent configuration
 */
export class ServiceFactory {
  private static services: Map<string, BaseService> = new Map();

  static create<T extends BaseService>(
    ServiceClass: new (config?: Partial<BaseServiceConfig>) => T,
    serviceName: string,
    config?: Partial<BaseServiceConfig>
  ): T {
    if (this.services.has(serviceName)) {
      return this.services.get(serviceName) as T;
    }

    const service = new ServiceClass(config);
    this.services.set(serviceName, service);
    return service;
  }

  static get<T extends BaseService>(serviceName: string): T | undefined {
    return this.services.get(serviceName) as T;
  }

  static destroy(serviceName: string): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.destroy();
      this.services.delete(serviceName);
    }
  }

  static destroyAll(): void {
    this.services.forEach(service => service.destroy());
    this.services.clear();
  }
}
