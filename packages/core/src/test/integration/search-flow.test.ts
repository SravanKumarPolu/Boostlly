/**
 * Integration Tests for Search Flow
 * 
 * Tests the complete search functionality including filters and results
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchService } from '../../services/search-service';
import { QuoteService } from '../../services/quote-service';
import { MockStorageService } from '../mocks/storage-mock';
import type { Quote } from '../../types';

describe('Search Flow Integration', () => {
  let searchService: SearchService;
  let quoteService: QuoteService;
  let storage: MockStorageService;
  let testQuotes: Quote[];

  beforeEach(async () => {
    storage = new MockStorageService();
    quoteService = new QuoteService(storage);
    searchService = new SearchService();

    // Get some test quotes
    const dailyQuote = await quoteService.getDailyQuote();
    testQuotes = [dailyQuote];

    // Update search service with test data
    searchService.updateData(testQuotes, []);
  });

  describe('Basic Search Flow', () => {
    it('should search quotes by text', () => {
      if (testQuotes.length === 0 || !testQuotes[0].text) {
        // Skip if no quotes available
        return;
      }

      const searchTerm = testQuotes[0].text.split(' ')[0];
      const results = searchService.search(searchTerm);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.text.includes(searchTerm))).toBe(true);
    });

    it('should search quotes by author', () => {
      if (testQuotes.length === 0 || !testQuotes[0].author) {
        return;
      }

      const author = testQuotes[0].author;
      const results = searchService.search(author);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.author === author)).toBe(true);
    });

    it('should return empty results for non-matching query', () => {
      const results = searchService.search('nonexistentquery12345');
      expect(results).toEqual([]);
    });
  });

  describe('Advanced Search with Filters', () => {
    beforeEach(() => {
      // Add more diverse test data
      const diverseQuotes: Quote[] = [
        {
          id: '1',
          text: 'Motivational quote about success',
          author: 'Author One',
          source: 'ZenQuotes',
          category: 'motivation',
          isLiked: true,
        },
        {
          id: '2',
          text: 'Inspirational quote about life',
          author: 'Author Two',
          source: 'Quotable',
          category: 'inspiration',
          isLiked: false,
        },
        {
          id: '3',
          text: 'Success quote about achievement',
          author: 'Author One',
          source: 'ZenQuotes',
          category: 'success',
          isLiked: true,
        },
      ];

      searchService.updateData(diverseQuotes, []);
    });

    it('should filter by author', () => {
      const results = searchService.advancedSearch({
        author: 'Author One',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.item.author === 'Author One')).toBe(true);
    });

    it('should filter by category', () => {
      const results = searchService.advancedSearch({
        category: 'motivation',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.item.category === 'motivation')).toBe(true);
    });

    it('should filter by liked status', () => {
      const likedResults = searchService.advancedSearch({
        isLiked: true,
      });

      expect(likedResults.length).toBeGreaterThan(0);
      expect(likedResults.every(r => r.item.isLiked === true)).toBe(true);

      const notLikedResults = searchService.advancedSearch({
        isLiked: false,
      });

      expect(notLikedResults.length).toBeGreaterThan(0);
      expect(notLikedResults.every(r => r.item.isLiked === false)).toBe(true);
    });

    it('should combine query and filters', () => {
      const results = searchService.advancedSearch({
        query: 'quote',
        author: 'Author One',
        category: 'motivation',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => {
        return r.item.author === 'Author One' &&
               r.item.category === 'motivation' &&
               (r.item.text.toLowerCase().includes('quote') ||
                r.item.author.toLowerCase().includes('quote'));
      })).toBe(true);
    });
  });

  describe('Search Suggestions Flow', () => {
    beforeEach(() => {
      const quotes: Quote[] = [
        {
          id: '1',
          text: 'Success is not final',
          author: 'Winston Churchill',
          source: 'ZenQuotes',
          category: 'success',
        },
        {
          id: '2',
          text: 'Motivation drives action',
          author: 'Unknown',
          source: 'Quotable',
          category: 'motivation',
        },
      ];

      searchService.updateData(quotes, []);
    });

    it('should provide search suggestions', () => {
      const suggestions = searchService.getSuggestions('succ');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('success'))).toBe(true);
    });

    it('should limit suggestions count', () => {
      const suggestions = searchService.getSuggestions('q');
      // Should be limited to reasonable number
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Search with Empty Data', () => {
    it('should handle empty quote list', () => {
      searchService.updateData([], []);
      const results = searchService.search('test');
      expect(results).toEqual([]);
    });

    it('should handle null/undefined gracefully', () => {
      searchService.updateData([], []);
      const results = searchService.advancedSearch({});
      expect(results).toEqual([]);
    });
  });

  describe('Search Performance', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeQuotes: Quote[] = Array.from({ length: 100 }, (_, i) => ({
        id: `quote-${i}`,
        text: `Quote text ${i} with some content`,
        author: `Author ${i % 10}`,
        source: 'ZenQuotes',
        category: i % 2 === 0 ? 'motivation' : 'inspiration',
      }));

      searchService.updateData(largeQuotes, []);

      const startTime = Date.now();
      const results = searchService.search('Quote');
      const endTime = Date.now();

      expect(results.length).toBeGreaterThan(0);
      // Should complete in reasonable time (< 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

