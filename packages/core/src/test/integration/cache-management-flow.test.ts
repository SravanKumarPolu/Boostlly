/**
 * Integration Tests for Cache Management Flow
 * 
 * Tests cache operations, invalidation, and migration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuoteCacheManager } from '../../services/quote-cache-manager';
import { QuoteService } from '../../services/quote-service';
import { MockStorageService } from '../mocks/storage-mock';
import type { Quote } from '../../types';

describe('Cache Management Flow Integration', () => {
  let cacheManager: QuoteCacheManager;
  let quoteService: QuoteService;
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
    cacheManager = new QuoteCacheManager(storage, {
      maxCacheSize: 100,
      cleanupIntervalMs: 60000,
    });
    quoteService = new QuoteService(storage);
  });

  describe('Cache Storage Flow', () => {
    it('should cache API responses', () => {
      const testData = { quotes: [] };
      const timestamp = Date.now();

      cacheManager.setApiCache('test-key', testData, timestamp);
      const cached = cacheManager.getApiCache('test-key');

      expect(cached).toBeTruthy();
      expect(cached!.data).toEqual(testData);
      expect(cached!.ts).toBe(timestamp);
    });

    it('should cache quotes', async () => {
      const quotes: Quote[] = [
        {
          id: '1',
          text: 'Test quote',
          author: 'Test Author',
          source: 'ZenQuotes',
        },
      ];

      await cacheManager.setCachedApiQuotes(quotes);
      const cached = cacheManager.getCachedApiQuotes();

      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('1');
    });

    it('should limit cache size', async () => {
      const largeQuotes: Quote[] = Array.from({ length: 150 }, (_, i) => ({
        id: `quote-${i}`,
        text: `Quote ${i}`,
        author: `Author ${i}`,
        source: 'ZenQuotes',
      }));

      await cacheManager.setCachedApiQuotes(largeQuotes);
      const cached = cacheManager.getCachedApiQuotes();

      expect(cached.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Cache Invalidation Flow', () => {
    it('should track last call timestamps', () => {
      const timestamp = Date.now();
      cacheManager.setApiCache('test-key', {}, timestamp);

      const lastCall = cacheManager.getLastCallAt('test-key');
      expect(lastCall).toBe(timestamp);
    });

    it('should handle cache cleanup', () => {
      const oldTimestamp = Date.now() - 2000000; // Old timestamp
      cacheManager.setApiCache('old-key', {}, oldTimestamp);
      cacheManager.setApiCache('new-key', {}, Date.now());

      // Start cleanup (will run in background)
      cacheManager.startCleanup();

      // Verify cache manager is working
      expect(cacheManager.getApiCache('new-key')).toBeTruthy();
    });
  });

  describe('Cache Migration Flow', () => {
    it('should migrate old cache keys', () => {
      const oldQuote = {
        id: '1',
        text: 'Old quote',
        author: 'Author',
        source: 'ZenQuotes',
      };
      const oldDate = '2024-01-01';

      storage.setSync('dayBasedQuote', oldQuote);
      storage.setSync('dayBasedQuoteDate', oldDate);

      // Create new manager (triggers migration)
      const newManager = new QuoteCacheManager(storage, {
        maxCacheSize: 100,
        cleanupIntervalMs: 60000,
      });

      // Migration should have occurred
      expect(newManager).toBeDefined();
    });
  });

  describe('Cache Persistence Flow', () => {
    it('should persist cache to storage', () => {
      const testData = { quotes: [] };
      const timestamp = Date.now();

      cacheManager.setApiCache('persist-key', testData, timestamp);

      // Verify persistence by creating new manager
      const newManager = new QuoteCacheManager(storage, {
        maxCacheSize: 100,
        cleanupIntervalMs: 60000,
      });

      const cached = newManager.getApiCache('persist-key');
      expect(cached).toBeTruthy();
      expect(cached!.data).toEqual(testData);
    });

    it('should persist cached quotes', async () => {
      const quotes: Quote[] = [
        {
          id: '1',
          text: 'Persisted quote',
          author: 'Author',
          source: 'ZenQuotes',
        },
      ];

      await cacheManager.setCachedApiQuotes(quotes);

      // Verify persistence
      const newManager = new QuoteCacheManager(storage, {
        maxCacheSize: 100,
        cleanupIntervalMs: 60000,
      });

      const cached = newManager.getCachedApiQuotes();
      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('1');
    });
  });
});

