/**
 * Scalable API Manager
 * 
 * Advanced API management system designed to handle high-volume
 * requests with intelligent rate limiting, caching, and fallback strategies.
 */

import { SCALABILITY_LIMITS } from './scalability-manager';
import { logError, logDebug, logWarning } from './logger';

/**
 * API request configuration
 */
export interface APIRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  priority?: 'low' | 'normal' | 'high';
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * API response with metadata
 */
export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached: boolean;
  timestamp: number;
  requestId: string;
}

/**
 * Rate limiter for API requests
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = SCALABILITY_LIMITS.MAX_CONCURRENT_REQUESTS, windowMs: number = SCALABILITY_LIMITS.RATE_LIMIT_WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    this.requests.set(key, validRequests);
    
    return validRequests.length < this.maxRequests;
  }

  /**
   * Record a request
   */
  recordRequest(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNext(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length < this.maxRequests) return 0;
    
    const oldestRequest = Math.min(...requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

/**
 * Request queue for managing concurrent requests
 */
class RequestQueue {
  private queue: Array<{
    config: APIRequestConfig;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    priority: number;
    timestamp: number;
  }> = [];
  private activeRequests = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = SCALABILITY_LIMITS.MAX_CONCURRENT_REQUESTS) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add request to queue
   */
  async addRequest<T>(config: APIRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      const priority = this.getPriority(config.priority || 'normal');
      
      this.queue.push({
        config,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      });
      
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const request = this.queue.shift();
    if (!request) return;
    
    this.activeRequests++;
    
    try {
      const response = await this.executeRequest(request.config);
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue(); // Process next request
    }
  }

  /**
   * Execute the actual request
   */
  private async executeRequest<T>(config: APIRequestConfig): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);
    
    try {
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        cached: false,
        timestamp: Date.now(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get priority number
   */
  private getPriority(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Intelligent cache manager
 */
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number;

  constructor(maxSize: number = SCALABILITY_LIMITS.MAX_CACHED_RESULTS) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    // Enforce size limits
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would be calculated with hit/miss tracking
    };
  }
}

/**
 * Scalable API Manager
 */
export class ScalableAPIManager {
  private static instance: ScalableAPIManager;
  private rateLimiter: RateLimiter;
  private requestQueue: RequestQueue;
  private cacheManager: CacheManager;
  private retryStrategies: Map<string, number> = new Map();

  static getInstance(): ScalableAPIManager {
    if (!ScalableAPIManager.instance) {
      ScalableAPIManager.instance = new ScalableAPIManager();
    }
    return ScalableAPIManager.instance;
  }

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.requestQueue = new RequestQueue();
    this.cacheManager = new CacheManager();
  }

  /**
   * Make an API request with intelligent management
   */
  async request<T>(config: APIRequestConfig): Promise<APIResponse<T>> {
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache first
    if (config.cache !== false) {
      const cached = this.cacheManager.get<T>(cacheKey);
      if (cached) {
        logDebug('Cache hit', { url: config.url });
        return {
          data: cached,
          status: 200,
          headers: {},
          cached: true,
          timestamp: Date.now(),
          requestId: this.generateRequestId(),
        };
      }
    }
    
    // Check rate limiting
    const rateLimitKey = this.getRateLimitKey(config.url);
    if (!this.rateLimiter.isAllowed(rateLimitKey)) {
      const waitTime = this.rateLimiter.getTimeUntilNext(rateLimitKey);
      logWarning('Rate limit exceeded, waiting', { waitTime, url: config.url });
      await this.delay(waitTime);
    }
    
    // Record the request
    this.rateLimiter.recordRequest(rateLimitKey);
    
    // Add to queue
    const response = await this.requestQueue.addRequest<T>(config);
    
    // Cache the response
    if (config.cache !== false) {
      this.cacheManager.set(cacheKey, response.data, config.cacheTTL || 300000);
    }
    
    return response;
  }

  /**
   * Make multiple requests with batching
   */
  async batchRequest<T>(configs: APIRequestConfig[]): Promise<APIResponse<T>[]> {
    const promises = configs.map(config => this.request<T>(config));
    return Promise.all(promises);
  }

  /**
   * Make request with retry logic
   */
  async requestWithRetry<T>(
    config: APIRequestConfig,
    maxRetries: number = SCALABILITY_LIMITS.MAX_RETRY_ATTEMPTS
  ): Promise<APIResponse<T>> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(config);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          logDebug('Request failed, retrying', { attempt, delay, url: config.url });
          await this.delay(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(config: APIRequestConfig): string {
    const key = `${config.method || 'GET'}:${config.url}`;
    if (config.body) {
      return `${key}:${JSON.stringify(config.body)}`;
    }
    return key;
  }

  /**
   * Get rate limit key
   */
  private getRateLimitKey(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    cacheStats: any;
    queueSize: number;
    activeRequests: number;
  } {
    return {
      cacheStats: this.cacheManager.getStats(),
      queueSize: (this.requestQueue as any).queue.length,
      activeRequests: (this.requestQueue as any).activeRequests,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cacheManager.clear();
    logDebug('API cache cleared');
  }
}
