/**
 * Scalable State Manager
 * 
 * Advanced state management utilities designed to handle large-scale
 * applications with efficient memory usage and performance optimization.
 */

import { SCALABILITY_LIMITS } from './scalability-manager';
import { logError, logDebug, logWarning } from './logger';

/**
 * State slice configuration for scalability
 */
export interface ScalableStateConfig {
  maxItems?: number;
  enablePagination?: boolean;
  enableVirtualization?: boolean;
  enableCompression?: boolean;
  cleanupInterval?: number;
}

/**
 * Paginated state slice for large datasets
 */
export class PaginatedStateSlice<T> {
  private data: T[] = [];
  private currentPage = 1;
  private pageSize: number;
  private maxItems: number;
  private enableCompression: boolean;
  private compressedData?: string;

  constructor(
    private key: string,
    config: ScalableStateConfig = {}
  ) {
    this.pageSize = config.maxItems || SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY;
    this.maxItems = config.maxItems || SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY;
    this.enableCompression = config.enableCompression || false;
  }

  /**
   * Add items with automatic pagination
   */
  addItems(items: T[]): void {
    this.data.push(...items);
    
    // Enforce size limits
    if (this.data.length > this.maxItems) {
      this.data = this.data.slice(-this.maxItems);
      logDebug(`Trimmed ${this.key} data to ${this.maxItems} items`);
    }
    
    // Compress if enabled
    if (this.enableCompression) {
      this.compressData();
    }
  }

  /**
   * Get paginated data
   */
  getPage(page: number = this.currentPage): {
    data: T[];
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const data = this.data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    
    return {
      data,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Search with pagination
   */
  search(
    predicate: (item: T) => boolean,
    page: number = 1
  ): {
    data: T[];
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const filteredData = this.data.filter(predicate);
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const data = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / this.pageSize);
    
    return {
      data,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Compress data for storage
   */
  private compressData(): void {
    try {
      this.compressedData = JSON.stringify(this.data);
      // In a real implementation, you'd use actual compression
      logDebug(`Compressed ${this.key} data`);
    } catch (error) {
      logError('Failed to compress data', { error, key: this.key });
    }
  }

  /**
   * Decompress data
   */
  private decompressData(): void {
    if (this.compressedData) {
      try {
        this.data = JSON.parse(this.compressedData);
        this.compressedData = undefined;
        logDebug(`Decompressed ${this.key} data`);
      } catch (error) {
        logError('Failed to decompress data', { error, key: this.key });
      }
    }
  }

  /**
   * Get current state
   */
  getState(): {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  } {
    return {
      data: this.data,
      currentPage: this.currentPage,
      totalPages: Math.ceil(this.data.length / this.pageSize),
      totalItems: this.data.length,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data = [];
    this.currentPage = 1;
    this.compressedData = undefined;
  }
}

/**
 * Memory-efficient state manager
 */
export class ScalableStateManager {
  private static instance: ScalableStateManager;
  private slices: Map<string, PaginatedStateSlice<any>> = new Map();
  private cleanupInterval?: ReturnType<typeof setInterval>;

  static getInstance(): ScalableStateManager {
    if (!ScalableStateManager.instance) {
      ScalableStateManager.instance = new ScalableStateManager();
    }
    return ScalableStateManager.instance;
  }

  /**
   * Create a new state slice
   */
  createSlice<T>(
    key: string,
    config: ScalableStateConfig = {}
  ): PaginatedStateSlice<T> {
    const slice = new PaginatedStateSlice<T>(key, config);
    this.slices.set(key, slice);
    
    // Start cleanup if not already running
    if (!this.cleanupInterval) {
      this.startCleanup();
    }
    
    return slice;
  }

  /**
   * Get a state slice
   */
  getSlice<T>(key: string): PaginatedStateSlice<T> | undefined {
    return this.slices.get(key);
  }

  /**
   * Remove a state slice
   */
  removeSlice(key: string): void {
    const slice = this.slices.get(key);
    if (slice) {
      slice.clear();
      this.slices.delete(key);
      logDebug(`Removed state slice: ${key}`);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, SCALABILITY_LIMITS.CACHE_CLEANUP_INTERVAL_MS);
  }

  /**
   * Perform cleanup operations
   */
  private performCleanup(): void {
    const memoryUsage = this.getMemoryUsage();
    
    if (memoryUsage > SCALABILITY_LIMITS.MAX_MEMORY_USAGE_MB * 0.8) {
      logWarning('High memory usage, performing cleanup');
      
      // Cleanup old slices
      this.cleanupOldSlices();
      
      // Force garbage collection in development
      if (process.env.NODE_ENV === 'development' && 'gc' in window) {
        (window as any).gc();
      }
    }
  }

  /**
   * Cleanup old slices
   */
  private cleanupOldSlices(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, slice] of this.slices.entries()) {
      // This would be implemented with actual timestamp tracking
      // For now, we'll just log the cleanup action
      logDebug(`Cleanup triggered for slice: ${key}`);
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  /**
   * Get all slice metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [key, slice] of this.slices.entries()) {
      const state = slice.getState();
      metrics[key] = {
        totalItems: state.totalItems,
        totalPages: state.totalPages,
        currentPage: state.currentPage,
      };
    }
    
    return metrics;
  }

  /**
   * Cleanup all slices
   */
  cleanup(): void {
    for (const slice of this.slices.values()) {
      slice.clear();
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    logDebug('All state slices cleaned up');
  }
}

/**
 * Optimized state selectors
 */
export const stateSelectors = {
  /**
   * Create a memoized selector
   */
  createSelector<T, R>(
    selector: (state: T) => R,
    equalityFn?: (a: R, b: R) => boolean
  ) {
    let lastResult: R;
    let lastState: T;
    
    return (state: T): R => {
      if (lastState === state) {
        return lastResult;
      }
      
      const result = selector(state);
      
      if (equalityFn && lastResult !== undefined) {
        if (equalityFn(result, lastResult)) {
          return lastResult;
        }
      }
      
      lastResult = result;
      lastState = state;
      return result;
    };
  },

  /**
   * Create a paginated selector
   */
  createPaginatedSelector<T>(
    getItems: (state: any) => T[],
    pageSize: number = SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY
  ) {
    return (state: any, page: number = 1) => {
      const items = getItems(state);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: items.slice(startIndex, endIndex),
        totalPages: Math.ceil(items.length / pageSize),
        currentPage: page,
        hasNext: page < Math.ceil(items.length / pageSize),
        hasPrev: page > 1,
      };
    };
  },
};

/**
 * State persistence utilities
 */
export const statePersistence = {
  /**
   * Save state to storage with compression
   */
  async saveState<T>(
    key: string,
    state: T,
    storage: Storage = localStorage
  ): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data: state,
        timestamp: Date.now(),
        version: 1,
      });
      
      storage.setItem(key, serialized);
      logDebug(`State saved: ${key}`);
    } catch (error) {
      logError('Failed to save state', { error, key });
    }
  },

  /**
   * Load state from storage
   */
  async loadState<T>(
    key: string,
    storage: Storage = localStorage
  ): Promise<T | null> {
    try {
      const serialized = storage.getItem(key);
      if (!serialized) return null;
      
      const parsed = JSON.parse(serialized);
      
      // Check if data is too old
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - parsed.timestamp > maxAge) {
        storage.removeItem(key);
        return null;
      }
      
      logDebug(`State loaded: ${key}`);
      return parsed.data;
    } catch (error) {
      logError('Failed to load state', { error, key });
      return null;
    }
  },

  /**
   * Clear old state data
   */
  clearOldState(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('boostlly.state.')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && now - data.timestamp > maxAge) {
            localStorage.removeItem(key);
            logDebug(`Cleared old state: ${key}`);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  },
};
