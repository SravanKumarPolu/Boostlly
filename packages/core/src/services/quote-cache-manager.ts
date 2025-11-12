/**
 * Quote Cache Manager Module
 * 
 * Handles all caching operations for quotes:
 * - API response caching
 * - Quote cache management
 * - Cache migration
 * - Cache cleanup
 */

import type { Quote } from "../types";
import { StorageService } from "@boostlly/platform";
import { logDebug, logWarning } from "../utils/logger";
import { CACHE_KEYS } from "../utils/cache-utils";

export interface CacheEntry {
  data: any;
  ts: number;
}

export interface CacheManagerConfig {
  maxCacheSize: number;
  cleanupIntervalMs: number;
}

export class QuoteCacheManager {
  private storage: StorageService;
  private apiCache: Map<string, CacheEntry> = new Map();
  private lastCallAt: Map<string, number> = new Map();
  private cachedApiQuotes: Quote[] = [];
  private config: CacheManagerConfig;
  private cleanupInterval: number | null = null;

  constructor(
    storage: StorageService,
    config: CacheManagerConfig
  ) {
    this.storage = storage;
    this.config = config;
    this.loadFromStorage();
    this.migrateCacheKeys();
  }

  /**
   * Load cache from storage
   */
  private loadFromStorage(): void {
    try {
      const persisted: Record<string, CacheEntry> | null = (
        this.storage.getSync as any
      )?.("apiCache");
      if (persisted && typeof persisted === "object") {
        for (const [k, v] of Object.entries(persisted)) {
          if (v && typeof v.ts === "number") {
            this.apiCache.set(k, v);
          }
        }
      }
      
      const lastCalls: Record<string, number> | null = (
        this.storage.getSync as any
      )?.("apiLastCall");
      if (lastCalls && typeof lastCalls === "object") {
        for (const [k, v] of Object.entries(lastCalls)) {
          if (typeof v === "number") {
            this.lastCallAt.set(k, v);
          }
        }
      }
      
      const persistedApiQuotes = (
        this.storage.getSync as any
      )?.("quotes-cache");
      if (Array.isArray(persistedApiQuotes)) {
        this.cachedApiQuotes = persistedApiQuotes as Quote[];
      }
    } catch (error) {
      logDebug("Error loading cache from storage", { error });
    }
  }

  /**
   * Get API cache entry
   */
  getApiCache(key: string): CacheEntry | undefined {
    return this.apiCache.get(key);
  }

  /**
   * Set API cache entry
   */
  setApiCache(key: string, data: any, timestamp: number): void {
    this.apiCache.set(key, { data, ts: timestamp });
    this.lastCallAt.set(key, timestamp);
    
    // Persist to storage
    try {
      const apiCacheObj: Record<string, CacheEntry> = {};
      this.apiCache.forEach((value, k) => {
        apiCacheObj[k] = value;
      });
      this.storage.setSync("apiCache", apiCacheObj);
      
      const lastCallObj: Record<string, number> = {};
      this.lastCallAt.forEach((value, k) => {
        lastCallObj[k] = value;
      });
      this.storage.setSync("apiLastCall", lastCallObj);
    } catch (error) {
      logDebug("Error persisting API cache", { error });
    }
  }

  /**
   * Get cached API quotes
   */
  getCachedApiQuotes(): Quote[] {
    return [...this.cachedApiQuotes];
  }

  /**
   * Set cached API quotes
   */
  async setCachedApiQuotes(quotes: Quote[]): Promise<void> {
    // Limit cache size
    if (quotes.length > this.config.maxCacheSize) {
      quotes = quotes.slice(0, this.config.maxCacheSize);
      logWarning(
        `Cached API quotes exceeded max size, trimmed to ${this.config.maxCacheSize}`,
        {
          previousSize: this.cachedApiQuotes.length + this.config.maxCacheSize,
          newSize: quotes.length,
        },
        "QuoteCacheManager",
      );
    }
    
    this.cachedApiQuotes = quotes;
    await this.storage.set("quotes-cache", quotes);
  }

  /**
   * Add quote to cached API quotes
   */
  async addCachedApiQuote(quote: Quote): Promise<void> {
    const current = [...this.cachedApiQuotes, quote];
    await this.setCachedApiQuotes(current);
  }

  /**
   * Get last call timestamp for a key
   */
  getLastCallAt(key: string): number | undefined {
    return this.lastCallAt.get(key);
  }

  /**
   * Migrate old cache keys to unified cache keys
   */
  migrateCacheKeys(): void {
    try {
      // Check if we have old dayBasedQuote cache
      const oldDayBasedQuote = this.storage.getSync("dayBasedQuote");
      const oldDayBasedQuoteDate = this.storage.getSync("dayBasedQuoteDate");
      
      // If we have old cache but no new cache, migrate it
      const unifiedQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
      const unifiedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);
      
      if (oldDayBasedQuote && oldDayBasedQuoteDate && !unifiedQuote) {
        // Migrate old cache to new unified cache
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, oldDayBasedQuote);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, oldDayBasedQuoteDate);
        logDebug("Migrated dayBasedQuote cache to unified dailyQuote cache");
      }
    } catch (error) {
      logDebug("Error during cache key migration", { error });
    }
  }

  /**
   * Start periodic cache cleanup
   */
  startCleanup(): void {
    if (typeof window === "undefined") {
      return;
    }

    // Clear any existing interval
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
    }

    // Perform initial cleanup
    this.performCleanup();

    // Set up periodic cleanup
    this.cleanupInterval = window.setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Perform cache cleanup
   */
  private performCleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up expired API cache entries
    for (const [key, value] of this.apiCache.entries()) {
      if (now - value.ts > maxAge) {
        this.apiCache.delete(key);
        this.lastCallAt.delete(key);
      }
    }

    // Persist cleaned cache
    try {
      const apiCacheObj: Record<string, CacheEntry> = {};
      this.apiCache.forEach((value, k) => {
        apiCacheObj[k] = value;
      });
      this.storage.setSync("apiCache", apiCacheObj);
      
      const lastCallObj: Record<string, number> = {};
      this.lastCallAt.forEach((value, k) => {
        lastCallObj[k] = value;
      });
      this.storage.setSync("apiLastCall", lastCallObj);
    } catch (error) {
      logDebug("Error persisting cleaned cache", { error });
    }
  }

  /**
   * Stop cache cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval !== null && typeof window !== "undefined") {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    this.apiCache.clear();
    this.lastCallAt.clear();
    this.cachedApiQuotes = [];
    
    try {
      await this.storage.set("apiCache", {});
      await this.storage.set("apiLastCall", {});
      await this.storage.set("quotes-cache", []);
    } catch (error) {
      logDebug("Error clearing cache", { error });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    apiCacheSize: number;
    lastCallCount: number;
    cachedQuotesCount: number;
  } {
    return {
      apiCacheSize: this.apiCache.size,
      lastCallCount: this.lastCallAt.size,
      cachedQuotesCount: this.cachedApiQuotes.length,
    };
  }
}

