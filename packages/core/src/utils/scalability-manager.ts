/**
 * Scalability Manager
 * 
 * Centralized scalability management utilities to handle growth
 * and prevent performance degradation as the application scales.
 */

import { logError, logWarning, logDebug } from './logger';

/**
 * Resource limits and thresholds for scalability
 */
export const SCALABILITY_LIMITS = {
  // Memory limits
  MAX_QUOTES_IN_MEMORY: 1000,
  MAX_SEARCH_HISTORY: 100,
  MAX_CACHED_RESULTS: 500,
  MAX_COLLECTIONS: 50,
  
  // Performance thresholds
  MAX_RENDER_TIME_MS: 16, // 60fps
  MAX_MEMORY_USAGE_MB: 100,
  MAX_BUNDLE_SIZE_KB: 500,
  
  // API limits
  MAX_CONCURRENT_REQUESTS: 5,
  MAX_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  
  // Cache limits
  MAX_CACHE_SIZE_MB: 50,
  CACHE_CLEANUP_INTERVAL_MS: 300000, // 5 minutes
} as const;

/**
 * Scalability monitoring and management
 */
export class ScalabilityManager {
  private static instance: ScalabilityManager;
  private metrics: Map<string, number> = new Map();
  private cleanupTasks: Set<() => void> = new Set();
  private isMonitoring = false;

  static getInstance(): ScalabilityManager {
    if (!ScalabilityManager.instance) {
      ScalabilityManager.instance = new ScalabilityManager();
    }
    return ScalabilityManager.instance;
  }

  /**
   * Start monitoring scalability metrics
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor performance
    this.monitorPerformance();
    
    // Schedule cleanup tasks
    this.scheduleCleanup();
    
    logDebug('Scalability monitoring started');
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks.clear();
    logDebug('Scalability monitoring stopped');
  }

  /**
   * Monitor memory usage and trigger cleanup if needed
   */
  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      if (!this.isMonitoring) return;
      
      const memoryUsage = this.getMemoryUsage();
      this.metrics.set('memoryUsage', memoryUsage);
      
      if (memoryUsage > SCALABILITY_LIMITS.MAX_MEMORY_USAGE_MB) {
        logWarning('High memory usage detected', { memoryUsage });
        this.triggerMemoryCleanup();
      }
      
      setTimeout(checkMemory, 10000); // Check every 10 seconds
    };
    
    checkMemory();
  }

  /**
   * Monitor performance metrics
   */
  private monitorPerformance(): void {
    const checkPerformance = () => {
      if (!this.isMonitoring) return;
      
      // Monitor render times
      this.measureRenderPerformance();
      
      // Monitor bundle size
      this.monitorBundleSize();
      
      setTimeout(checkPerformance, 30000); // Check every 30 seconds
    };
    
    checkPerformance();
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  /**
   * Measure render performance
   */
  private measureRenderPerformance(): void {
    // Skip performance measurement during SSR
    if (typeof window === 'undefined') return;
    
    const startTime = performance.now();
    
    // Trigger a small render to measure performance
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.metrics.set('renderTime', renderTime);
      
      if (renderTime > SCALABILITY_LIMITS.MAX_RENDER_TIME_MS) {
        logWarning('Slow render detected', { renderTime });
        this.triggerPerformanceOptimization();
      }
    });
  }

  /**
   * Monitor bundle size
   */
  private monitorBundleSize(): void {
    if (typeof window === 'undefined') return;
    
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next/static')) {
        // Estimate size based on script loading
        totalSize += 50; // Rough estimate
      }
    });
    
    this.metrics.set('bundleSize', totalSize);
    
    if (totalSize > SCALABILITY_LIMITS.MAX_BUNDLE_SIZE_KB) {
      logWarning('Large bundle size detected', { bundleSize: totalSize });
    }
  }

  /**
   * Trigger memory cleanup
   */
  private triggerMemoryCleanup(): void {
    // Clear old caches
    this.clearOldCaches();
    
    // Trigger garbage collection in development
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
    
    logDebug('Memory cleanup triggered');
  }

  /**
   * Trigger performance optimization
   */
  private triggerPerformanceOptimization(): void {
    // Reduce animation complexity
    this.reduceAnimationComplexity();
    
    // Optimize rendering
    this.optimizeRendering();
    
    logDebug('Performance optimization triggered');
  }

  /**
   * Clear old caches
   */
  private clearOldCaches(): void {
    // Clear localStorage old entries
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('boostlly.cache.')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && now - data.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Reduce animation complexity
   */
  private reduceAnimationComplexity(): void {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    // Disable complex animations when performance is poor
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
  }

  /**
   * Optimize rendering
   */
  private optimizeRendering(): void {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    // Reduce DOM complexity
    const complexElements = document.querySelectorAll('[data-complex="true"]');
    complexElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Schedule periodic cleanup
   */
  private scheduleCleanup(): void {
    const cleanup = () => {
      if (!this.isMonitoring) return;
      
      this.clearOldCaches();
      this.cleanupUnusedResources();
      
      setTimeout(cleanup, SCALABILITY_LIMITS.CACHE_CLEANUP_INTERVAL_MS);
    };
    
    setTimeout(cleanup, SCALABILITY_LIMITS.CACHE_CLEANUP_INTERVAL_MS);
  }

  /**
   * Cleanup unused resources
   */
  private cleanupUnusedResources(): void {
    // Cleanup unused event listeners
    this.cleanupEventListeners();
    
    // Cleanup unused timers
    this.cleanupTimers();
    
    logDebug('Unused resources cleaned up');
  }

  /**
   * Cleanup event listeners
   */
  private cleanupEventListeners(): void {
    // This would be implemented based on specific event listener tracking
    // For now, we'll just log the action
    logDebug('Event listeners cleanup triggered');
  }

  /**
   * Cleanup timers
   */
  private cleanupTimers(): void {
    // This would be implemented based on specific timer tracking
    // For now, we'll just log the action
    logDebug('Timers cleanup triggered');
  }

  /**
   * Get current metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Check if system is under stress
   */
  isUnderStress(): boolean {
    const memoryUsage = this.metrics.get('memoryUsage') || 0;
    const renderTime = this.metrics.get('renderTime') || 0;
    
    return memoryUsage > SCALABILITY_LIMITS.MAX_MEMORY_USAGE_MB * 0.8 ||
           renderTime > SCALABILITY_LIMITS.MAX_RENDER_TIME_MS * 0.8;
  }
}

/**
 * Data pagination utilities for large datasets
 */
export const dataPagination = {
  /**
   * Paginate large arrays
   */
  paginateArray<T>(array: T[], page: number, pageSize: number): {
    data: T[];
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = array.slice(startIndex, endIndex);
    const totalPages = Math.ceil(array.length / pageSize);
    
    return {
      data,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  /**
   * Virtual scrolling for large lists
   */
  createVirtualScroll<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 5
  ) {
    return {
      getVisibleItems: (scrollTop: number) => {
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
          start + Math.ceil(containerHeight / itemHeight) + overscan,
          items.length
        );
        
        return {
          items: items.slice(Math.max(0, start - overscan), end),
          startIndex: Math.max(0, start - overscan),
          endIndex: end,
          totalHeight: items.length * itemHeight,
        };
      },
    };
  },
};

/**
 * Memory-efficient data structures
 */
export const efficientDataStructures = {
  /**
   * Circular buffer for limited size collections
   */
  createCircularBuffer<T>(maxSize: number) {
    const buffer: T[] = [];
    let head = 0;
    let tail = 0;
    let count = 0;

    return {
      push: (item: T) => {
        buffer[tail] = item;
        tail = (tail + 1) % maxSize;
        
        if (count < maxSize) {
          count++;
        } else {
          head = (head + 1) % maxSize;
        }
      },
      
      get: (index: number): T | undefined => {
        if (index >= count) return undefined;
        return buffer[(head + index) % maxSize];
      },
      
      getAll: (): T[] => {
        const result: T[] = [];
        for (let i = 0; i < count; i++) {
          result.push(buffer[(head + i) % maxSize]);
        }
        return result;
      },
      
      size: () => count,
      clear: () => {
        head = 0;
        tail = 0;
        count = 0;
      },
    };
  },

  /**
   * LRU Cache for efficient caching
   */
  createLRUCache<K, V>(maxSize: number) {
    const cache = new Map<K, V>();
    const accessOrder = new Map<K, number>();
    let accessCounter = 0;

    return {
      get: (key: K): V | undefined => {
        if (cache.has(key)) {
          accessOrder.set(key, ++accessCounter);
          return cache.get(key);
        }
        return undefined;
      },
      
      set: (key: K, value: V) => {
        if (cache.size >= maxSize && !cache.has(key)) {
          // Find least recently used key
          let lruKey: K | undefined;
          let minAccess = Infinity;
          
          for (const [k, access] of accessOrder.entries()) {
            if (access < minAccess) {
              minAccess = access;
              lruKey = k;
            }
          }
          
          if (lruKey !== undefined) {
            cache.delete(lruKey);
            accessOrder.delete(lruKey);
          }
        }
        
        cache.set(key, value);
        accessOrder.set(key, ++accessCounter);
      },
      
      has: (key: K) => cache.has(key),
      delete: (key: K) => {
        cache.delete(key);
        accessOrder.delete(key);
      },
      clear: () => {
        cache.clear();
        accessOrder.clear();
        accessCounter = 0;
      },
      size: () => cache.size,
    };
  },
};
