import { logError, logDebug, logWarning } from "./logger";
/**
 * Smart Caching System
 * Predictive caching based on user behavior patterns and usage analytics
 */

// Removed monitoring imports for privacy-first approach

export interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
  size: number;
  expiresAt?: number;
  tags: string[];
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxItems: number; // Maximum number of items
  defaultTTL: number; // Default time to live in milliseconds
  cleanupInterval: number; // How often to clean up expired items
  predictiveCaching: boolean; // Enable predictive caching
  compression: boolean; // Enable compression for large items
}

export interface CachePrediction {
  key: string;
  confidence: number;
  reason: string;
  estimatedAccessTime: number;
}

class SmartCache {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private currentSize: number = 0;
  private cleanupTimer?: ReturnType<typeof setInterval>;
  // private userId?: string; // Not used yet

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      predictiveCaching: true,
      compression: true,
      ...config,
    };

    this.startCleanupTimer();
  }

  setUserId(_userId: string): void {
    // this.userId = _userId; // Not used yet
  }

  async set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      priority?: number;
      tags?: string[];
      size?: number;
    } = {},
  ): Promise<void> {
    const {
      ttl = this.config.defaultTTL,
      priority = 1,
      tags = [],
      size = this.estimateSize(data),
    } = options;

    const item: CacheItem<T> = {
      key,
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      priority,
      size,
      expiresAt: Date.now() + ttl,
      tags,
    };

    // Check if we need to evict items
    await this.ensureSpace(item.size);

    this.cache.set(key, item);
    this.currentSize += item.size;

    // Analytics removed for privacy-first approach
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    // Analytics removed for privacy-first approach

    return item.data as T;
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      priority?: number;
      tags?: string[];
    } = {},
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  async predictAndCache(): Promise<void> {
    // Predictive caching disabled for privacy-first approach
    // All data remains local and no external analytics are used
  }

  /*
  private generateCachePredictions(insights: any): CachePrediction[] {
    const predictions: CachePrediction[] = [];

    // Predict based on likely quotes
    if (insights.insights?.cachePredictions?.likelyQuotes) {
      insights.insights.cachePredictions.likelyQuotes.forEach(
        (quoteId: string, index: number) => {
          predictions.push({
            key: `quote_${quoteId}`,
            confidence:
              insights.insights.cachePredictions.confidence * (1 - index * 0.1),
            reason: "frequently_accessed_quote",
            estimatedAccessTime: Date.now() + (index + 1) * 60 * 60 * 1000, // Within next few hours
          });
        },
      );
    }

    // Predict based on likely collections
    if (insights.insights?.cachePredictions?.likelyCollections) {
      insights.insights.cachePredictions.likelyCollections.forEach(
        (collectionId: string, index: number) => {
          predictions.push({
            key: `collection_${collectionId}`,
            confidence:
              insights.insights.cachePredictions.confidence * (1 - index * 0.1),
            reason: "frequently_accessed_collection",
            estimatedAccessTime: Date.now() + (index + 1) * 2 * 60 * 60 * 1000, // Within next few hours
          });
        },
      );
    }

    // Predict based on optimal sync time
    const optimalSyncTime = insights.insights?.optimalSyncTime;
    if (optimalSyncTime && optimalSyncTime.confidence > 0.6) {
      const now = new Date();
      const targetHour = optimalSyncTime.hour;
      const currentHour = now.getHours();

      if (Math.abs(currentHour - targetHour) <= 2) {
        // Within 2 hours of optimal time
        predictions.push({
          key: "daily_quote",
          confidence: optimalSyncTime.confidence,
          reason: "optimal_sync_time",
          estimatedAccessTime: Date.now() + 30 * 60 * 1000, // Within 30 minutes
        });
      }
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }
  */

  /*
  private async prefetchItem(key: string, reason: string): Promise<void> {
    // Check if already cached
    if (this.cache.has(key)) {
      return;
    }

    try {
      // Simulate fetching data (in real implementation, this would call actual APIs)
      const mockData = {
        id: key,
        text: `Predicted content for ${key}`,
        author: "Predicted Author",
        category: "predicted",
        reason,
        prefetchedAt: Date.now(),
      };

      await this.set(key, mockData, {
        ttl: 60 * 60 * 1000, // 1 hour for predicted content
        priority: 0.5, // Lower priority for predicted content
        tags: ["predicted", reason],
      });

      logDebug(`Prefetched ${key} (${reason})`);
    } catch (error) {
      logWarning(`Failed to prefetch ${key}:`, { error: error });
    }
  }
  */

  private async ensureSpace(requiredSize: number): Promise<void> {
    if (
      this.currentSize + requiredSize <= this.config.maxSize &&
      this.cache.size < this.config.maxItems
    ) {
      return;
    }

    // Calculate items to evict
    const itemsToEvict = this.calculateEvictionCandidates(requiredSize);

    for (const key of itemsToEvict) {
      this.delete(key);
    }
  }

  private calculateEvictionCandidates(requiredSize: number): string[] {
    const candidates: Array<{ key: string; score: number }> = [];

    for (const [key, item] of this.cache.entries()) {
      // Calculate eviction score based on multiple factors
      const age = Date.now() - item.timestamp;
      const timeSinceLastAccess = Date.now() - item.lastAccessed;
      const accessFrequency =
        item.accessCount / Math.max(age / (60 * 60 * 1000), 1); // accesses per hour

      // Lower score = more likely to be evicted
      const score =
        (1 / item.priority) * 0.4 + // Priority factor
        (age / (24 * 60 * 60 * 1000)) * 0.3 + // Age factor (days)
        (timeSinceLastAccess / (60 * 60 * 1000)) * 0.2 + // Time since last access (hours)
        (1 / (accessFrequency + 1)) * 0.1; // Access frequency factor

      candidates.push({ key, score });
    }

    // Sort by eviction score (highest first = most likely to be evicted)
    candidates.sort((a, b) => b.score - a.score);

    // Calculate how much space we need to free
    let spaceToFree = this.currentSize + requiredSize - this.config.maxSize;
    const keysToEvict: string[] = [];

    for (const candidate of candidates) {
      const item = this.cache.get(candidate.key);
      if (item) {
        keysToEvict.push(candidate.key);
        spaceToFree -= item.size;

        if (spaceToFree <= 0) {
          break;
        }
      }
    }

    return keysToEvict;
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Default 1KB if estimation fails
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    if (expiredKeys.length > 0) {
      logDebug(`Cleaned up ${expiredKeys.length} expired cache items`);
    }
  }

  getStats(): {
    size: number;
    itemCount: number;
    hitRate: number;
    averageAccessCount: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const totalAccesses = items.reduce(
      (sum, item) => sum + item.accessCount,
      0,
    );

    return {
      size: this.currentSize,
      itemCount: this.cache.size,
      hitRate: items.length > 0 ? totalAccesses / items.length : 0,
      averageAccessCount: items.length > 0 ? totalAccesses / items.length : 0,
      oldestItem:
        items.length > 0 ? Math.min(...items.map((item) => item.timestamp)) : 0,
      newestItem:
        items.length > 0 ? Math.max(...items.map((item) => item.timestamp)) : 0,
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Singleton instance
export const smartCache = new SmartCache();

// Export utility functions
export async function cacheQuote(
  quoteId: string,
  quoteData: any,
  priority: number = 1,
): Promise<void> {
  await smartCache.set(`quote_${quoteId}`, quoteData, {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    priority,
    tags: [quoteData.category || "unknown", quoteData.author || "unknown"],
  });
}

export async function cacheCollection(
  collectionId: string,
  collectionData: any,
): Promise<void> {
  await smartCache.set(`collection_${collectionId}`, collectionData, {
    ttl: 12 * 60 * 60 * 1000, // 12 hours
    priority: 0.8,
    tags: ["collection", collectionData.name || "unknown"],
  });
}

export async function getCachedQuote(quoteId: string): Promise<any | null> {
  return await smartCache.get(`quote_${quoteId}`);
}

export async function getCachedCollection(
  collectionId: string,
): Promise<any | null> {
  return await smartCache.get(`collection_${collectionId}`);
}

export function getCacheStats() {
  return smartCache.getStats();
}

export function setCacheUserId(userId: string): void {
  smartCache.setUserId(userId);
}

export async function performPredictiveCaching(): Promise<void> {
  await smartCache.predictAndCache();
}
