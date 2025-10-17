/**
 * Enhanced Boostlly Quote System
 * 
 * This extends the original Boostlly.ts with advanced quote selection strategies:
 * - Sequential quote selection (one after another)
 * - Smart completion tracking
 * - Category rotation
 * - Weighted random selection
 * - Completion statistics
 */

import { Quote } from "../types";
import { BOOSTLLY_FALLBACK_QUOTES } from "./Boostlly";
import { SequentialQuoteSelector, QuoteSelectionConfig, QUOTE_SELECTION_CONFIGS } from "./sequential-quote-selector";

// Storage interface for compatibility
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Enhanced Boostlly Quote Manager
 */
export class EnhancedBoostllyQuoteManager {
  private selector: SequentialQuoteSelector;
  private config: QuoteSelectionConfig;

  constructor(storage: StorageLike, config: QuoteSelectionConfig = QUOTE_SELECTION_CONFIGS.SMART_SEQUENTIAL) {
    this.selector = new SequentialQuoteSelector(storage);
    this.config = config;
  }

  /**
   * Get next quote using the configured strategy
   */
  getNextQuote(category?: string): Quote {
    let availableQuotes = BOOSTLLY_FALLBACK_QUOTES;
    
    // Filter by category if specified
    if (category) {
      availableQuotes = BOOSTLLY_FALLBACK_QUOTES.filter(
        quote => quote.category === category || 
        quote.tags?.includes(category.toLowerCase())
      );
      
      // If no quotes match the category, use all quotes
      if (availableQuotes.length === 0) {
        availableQuotes = BOOSTLLY_FALLBACK_QUOTES;
      }
    }
    
    return this.selector.getNextQuote(availableQuotes, this.config);
  }

  /**
   * Get completion statistics
   */
  getCompletionStats(category?: string) {
    let quotes = BOOSTLLY_FALLBACK_QUOTES;
    
    if (category) {
      quotes = BOOSTLLY_FALLBACK_QUOTES.filter(
        quote => quote.category === category || 
        quote.tags?.includes(category.toLowerCase())
      );
    }
    
    return this.selector.getCompletionStats(quotes);
  }

  /**
   * Reset completion tracking
   */
  resetProgress(): void {
    this.selector.resetHistory();
  }

  /**
   * Change selection strategy
   */
  setStrategy(config: QuoteSelectionConfig): void {
    this.config = config;
  }

  /**
   * Get all available quotes (for reference)
   */
  getAllQuotes(): Quote[] {
    return BOOSTLLY_FALLBACK_QUOTES;
  }

  /**
   * Get quotes by category
   */
  getQuotesByCategory(category: string): Quote[] {
    return BOOSTLLY_FALLBACK_QUOTES.filter(
      quote => quote.category === category || 
      quote.tags?.includes(category.toLowerCase())
    );
  }
}

/**
 * Factory function to create enhanced quote manager
 */
export function createEnhancedQuoteManager(storage: StorageLike, strategy: keyof typeof QUOTE_SELECTION_CONFIGS = 'SMART_SEQUENTIAL'): EnhancedBoostllyQuoteManager {
  const config = QUOTE_SELECTION_CONFIGS[strategy];
  return new EnhancedBoostllyQuoteManager(storage, config);
}

/**
 * Backward compatibility functions that use the enhanced system
 */

/**
 * Get next sequential quote (replaces getRandomFallbackQuote)
 */
export function getNextSequentialQuote(category?: string, storage?: StorageLike): Quote {
  if (!storage) {
    // Fallback to original method if no storage provided
    return getRandomFallbackQuote(category);
  }
  
  const manager = createEnhancedQuoteManager(storage, 'SEQUENTIAL');
  return manager.getNextQuote(category);
}

/**
 * Get smart sequential quote (avoids recent quotes)
 */
export function getSmartSequentialQuote(category?: string, storage?: StorageLike): Quote {
  if (!storage) {
    return getRandomFallbackQuote(category);
  }
  
  const manager = createEnhancedQuoteManager(storage, 'SMART_SEQUENTIAL');
  return manager.getNextQuote(category);
}

/**
 * Get weighted random quote (favors unseen quotes)
 */
export function getWeightedRandomQuote(category?: string, storage?: StorageLike): Quote {
  if (!storage) {
    return getRandomFallbackQuote(category);
  }
  
  const manager = createEnhancedQuoteManager(storage, 'WEIGHTED_RANDOM');
  return manager.getNextQuote(category);
}

/**
 * Get category rotation quote
 */
export function getCategoryRotationQuote(category?: string, storage?: StorageLike): Quote {
  if (!storage) {
    return getRandomFallbackQuote(category);
  }
  
  const manager = createEnhancedQuoteManager(storage, 'CATEGORY_ROTATION');
  return manager.getNextQuote(category);
}

/**
 * Get completion statistics
 */
export function getQuoteCompletionStats(category?: string, storage?: StorageLike) {
  if (!storage) {
    return {
      totalQuotes: BOOSTLLY_FALLBACK_QUOTES.length,
      shownQuotes: 0,
      completionPercentage: 0,
      lastShownDate: '',
      nextQuoteIndex: 0
    };
  }
  
  const manager = createEnhancedQuoteManager(storage, 'SMART_SEQUENTIAL');
  return manager.getCompletionStats(category);
}

// Import the original function for fallback
import { getRandomFallbackQuote } from "./Boostlly";

/**
 * Enhanced quote selection strategies
 */
export const ENHANCED_STRATEGIES = {
  /**
   * Simple sequential: Quote 1, 2, 3... then back to 1
   * ✅ Shows all quotes in order
   * ✅ Never repeats until all shown
   * ❌ Predictable pattern
   */
  SEQUENTIAL: 'SEQUENTIAL',
  
  /**
   * Smart sequential: Avoids recent quotes, tracks completion
   * ✅ Shows all quotes eventually
   * ✅ Avoids recent repeats
   * ✅ Tracks progress
   * ✅ Good balance of variety and completion
   */
  SMART_SEQUENTIAL: 'SMART_SEQUENTIAL',
  
  /**
   * Weighted random: Favors unseen quotes
   * ✅ High variety
   * ✅ Favors unseen quotes
   * ❌ May take longer to see all quotes
   */
  WEIGHTED_RANDOM: 'WEIGHTED_RANDOM',
  
  /**
   * Category rotation: Cycles through categories
   * ✅ Balanced category exposure
   * ✅ Systematic approach
   * ✅ Good for learning different topics
   */
  CATEGORY_ROTATION: 'CATEGORY_ROTATION'
} as const;

export type EnhancedStrategy = keyof typeof ENHANCED_STRATEGIES;
