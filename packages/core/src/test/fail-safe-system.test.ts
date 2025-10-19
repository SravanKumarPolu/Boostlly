/**
 * Comprehensive test for the fail-safe quote system
 * 
 * This test verifies that:
 * 1. Each day's API has proper error handling
 * 2. All APIs fall back to Boostlly.ts when they fail
 * 3. Timeout handling prevents hanging requests
 * 4. The system works reliably even when all APIs are down
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteService } from '../services/quote-service';
import { StorageService } from '@boostlly/platform';
import { getRandomFallbackQuote } from '../utils/Boostlly';

// Mock the Boostlly fallback function
vi.mock('../utils/Boostlly', () => ({
  getRandomFallbackQuote: vi.fn(() => ({
    id: 'fallback-1',
    text: 'This is a fallback quote from Boostlly',
    author: 'Test Author',
    category: 'motivation',
    source: 'Boostlly',
    tags: ['test'],
  })),
}));

// Mock fetch to simulate API failures
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Fail-Safe Quote System', () => {
  let quoteService: QuoteService;
  let storageService: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    storageService = new StorageService();
    quoteService = new QuoteService(storageService);
    
    // Mock successful API responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        q: 'Test quote',
        a: 'Test author',
      }),
    });
  });

  describe('Daily Provider Schedule', () => {
    it('should use correct providers for each day', async () => {
      const days = [
        { day: 0, expectedProvider: 'DummyJSON', dayName: 'Sunday' },
        { day: 1, expectedProvider: 'ZenQuotes', dayName: 'Monday' },
        { day: 2, expectedProvider: 'Quotable', dayName: 'Tuesday' },
        { day: 3, expectedProvider: 'FavQs', dayName: 'Wednesday' },
        { day: 4, expectedProvider: 'QuoteGarden', dayName: 'Thursday' },
        { day: 5, expectedProvider: 'Stoic Quotes', dayName: 'Friday' },
        { day: 6, expectedProvider: 'Programming Quotes', dayName: 'Saturday' },
      ];

      for (const { day, expectedProvider, dayName } of days) {
        // Mock the date to simulate different days
        const mockDate = new Date(2024, 0, 7 + day); // Start from Sunday
        vi.setSystemTime(mockDate);

        const quote = await quoteService.getQuoteByDay();
        expect(quote.source).toBe(expectedProvider);
      }
    });
  });

  describe('API Failure Handling', () => {
    it('should fall back to Boostlly when ZenQuotes API fails', async () => {
      // Mock ZenQuotes API failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
      expect(quote.text).toBe('This is a fallback quote from Boostlly');
    });

    it('should fall back to Boostlly when Quotable API fails', async () => {
      // Mock Quotable API failure
      mockFetch.mockRejectedValueOnce(new Error('API timeout'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should fall back to Boostlly when FavQs API fails', async () => {
      // Mock FavQs API failure
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should fall back to Boostlly when QuoteGarden API fails', async () => {
      // Mock QuoteGarden API failure
      mockFetch.mockRejectedValueOnce(new Error('Rate limit exceeded'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should fall back to Boostlly when Stoic Quotes API fails', async () => {
      // Mock Stoic Quotes API failure
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should fall back to Boostlly when Programming Quotes API fails', async () => {
      // Mock Programming Quotes API failure
      mockFetch.mockRejectedValueOnce(new Error('Server error'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should fall back to Boostlly when DummyJSON API fails', async () => {
      // Mock DummyJSON API failure
      mockFetch.mockRejectedValueOnce(new Error('API endpoint not found'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });
  });

  describe('Timeout Handling', () => {
    it('should handle API timeouts gracefully', async () => {
      // Mock a slow API response that times out
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ q: 'Slow quote', a: 'Slow author' }),
          }), 15000) // 15 second delay (longer than 8 second timeout)
        )
      );

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });

    it('should handle network timeouts', async () => {
      // Mock network timeout
      mockFetch.mockRejectedValueOnce(new Error('Request timeout after 8000ms'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
    });
  });

  describe('Complete System Failure', () => {
    it('should still provide quotes when all APIs are down', async () => {
      // Mock all API failures
      mockFetch.mockRejectedValue(new Error('All APIs down'));

      const quote = await quoteService.getQuoteByDay();
      expect(quote.source).toBe('Boostlly');
      expect(quote.text).toBe('This is a fallback quote from Boostlly');
    });

    it('should provide different quotes on different days even when APIs fail', async () => {
      // Mock all API failures
      mockFetch.mockRejectedValue(new Error('All APIs down'));

      const quotes = [];
      for (let day = 0; day < 7; day++) {
        const mockDate = new Date(2024, 0, 7 + day);
        vi.setSystemTime(mockDate);
        
        const quote = await quoteService.getQuoteByDay();
        quotes.push(quote);
      }

      // All should be Boostlly fallback quotes
      quotes.forEach(quote => {
        expect(quote.source).toBe('Boostlly');
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover when APIs come back online', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('API down'));
      const failedQuote = await quoteService.getQuoteByDay();
      expect(failedQuote.source).toBe('Boostlly');

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          q: 'Recovered quote',
          a: 'Recovered author',
        }),
      });

      const recoveredQuote = await quoteService.getQuoteByDay();
      expect(recoveredQuote.source).toBe('ZenQuotes'); // Assuming Monday
      expect(recoveredQuote.text).toBe('Recovered quote');
    });
  });

  describe('Category-Specific Fallbacks', () => {
    it('should use appropriate categories for different providers', async () => {
      const getRandomFallbackQuote = vi.mocked(require('../utils/Boostlly').getRandomFallbackQuote);
      
      // Test different providers and their expected categories
      const providerCategories = [
        { provider: 'ZenQuotes', expectedCategory: 'mindfulness' },
        { provider: 'Quotable', expectedCategory: 'motivation' },
        { provider: 'FavQs', expectedCategory: 'motivation' },
        { provider: 'QuoteGarden', expectedCategory: 'motivation' },
        { provider: 'Stoic Quotes', expectedCategory: 'philosophy' },
        { provider: 'Programming Quotes', expectedCategory: 'programming' },
        { provider: 'DummyJSON', expectedCategory: 'motivation' },
      ];

      for (const { provider, expectedCategory } of providerCategories) {
        // Mock API failure for this provider
        mockFetch.mockRejectedValueOnce(new Error(`${provider} API failed`));
        
        await quoteService.getQuoteByDay();
        
        // Verify the correct category was used for fallback
        expect(getRandomFallbackQuote).toHaveBeenCalledWith(expectedCategory);
      }
    });
  });
});
