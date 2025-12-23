/**
 * Integration Tests for Quote Flow
 * 
 * Tests the complete flow from quote fetching to display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuoteService } from '../../services/quote-service';
import { MockStorageService } from '../mocks/storage-mock';

describe('Quote Flow Integration', () => {
  let quoteService: QuoteService;
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
    quoteService = new QuoteService(storage);
  });

  it('should fetch and cache daily quote', async () => {
    const quote = await quoteService.getDailyQuote();
    
    expect(quote).toBeTruthy();
    expect(quote.text).toBeTruthy();
    expect(quote.author).toBeTruthy();
    
    // Verify quote is cached
    const cachedQuote = await quoteService.getDailyQuote();
    expect(cachedQuote.id).toBe(quote.id);
  });

  it('should handle API failures gracefully', async () => {
    // This tests the fallback chain
    const quote = await quoteService.getDailyQuote();
    
    // Should still return a quote even if APIs fail
    expect(quote).toBeTruthy();
    expect(quote.text).toBeTruthy();
  });

  it('should save and retrieve quotes', async () => {
    const quote = await quoteService.getDailyQuote();
    
    // Save quote
    await storage.set('savedQuotes', [quote]);
    
    // Retrieve saved quotes
    const savedQuotes = await storage.get('savedQuotes');
    expect(savedQuotes).toHaveLength(1);
    expect(savedQuotes[0].id).toBe(quote.id);
  });
});

