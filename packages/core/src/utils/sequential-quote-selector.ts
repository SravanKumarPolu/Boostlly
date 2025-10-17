/**
 * Sequential Quote Selection System
 * 
 * This provides multiple quote selection strategies for better user experience:
 * 1. Sequential (one after another, cycling back to start)
 * 2. Smart Sequential (avoid recent quotes, track completion)
 * 3. Weighted Random (favor unseen quotes)
 * 4. Category Rotation (cycle through categories)
 */

import { Quote } from "../types";

export interface QuoteSelectionConfig {
  strategy: 'sequential' | 'smart-sequential' | 'weighted-random' | 'category-rotation';
  trackHistory?: boolean;
  avoidRecentDays?: number;
  categoryRotation?: boolean;
}

export interface QuoteHistory {
  shownQuotes: string[];
  lastShownDate: string;
  completionCount: number;
  categoryIndex: number;
}

/**
 * Sequential Quote Selector - Shows quotes one after another
 */
export class SequentialQuoteSelector {
  private history: QuoteHistory;
  private storage: StorageLike;

  constructor(storage: StorageLike) {
    this.storage = storage;
    this.history = this.loadHistory();
  }

  /**
   * Get next quote using the specified strategy
   */
  getNextQuote(quotes: Quote[], config: QuoteSelectionConfig): Quote {
    switch (config.strategy) {
      case 'sequential':
        return this.getSequentialQuote(quotes);
      case 'smart-sequential':
        return this.getSmartSequentialQuote(quotes, config);
      case 'weighted-random':
        return this.getWeightedRandomQuote(quotes, config);
      case 'category-rotation':
        return this.getCategoryRotationQuote(quotes, config);
      default:
        return this.getSequentialQuote(quotes);
    }
  }

  /**
   * Simple sequential: Quote 1, 2, 3... then back to 1
   */
  private getSequentialQuote(quotes: Quote[]): Quote {
    const currentIndex = this.history.completionCount % quotes.length;
    const quote = quotes[currentIndex];
    
    this.history.completionCount++;
    this.saveHistory();
    
    return quote;
  }

  /**
   * Smart sequential: Avoid recent quotes, track completion
   */
  private getSmartSequentialQuote(quotes: Quote[], config: QuoteSelectionConfig): Quote {
    const today = new Date().toISOString().split('T')[0];
    const avoidRecentDays = config.avoidRecentDays || 7;
    
    // Filter out recently shown quotes
    const recentQuotes = this.getRecentQuotes(avoidRecentDays);
    const availableQuotes = quotes.filter(q => !recentQuotes.includes(q.id));
    
    // If all quotes were shown recently, reset and use all
    const quotesToUse = availableQuotes.length > 0 ? availableQuotes : quotes;
    
    // Get next sequential quote
    const currentIndex = this.history.completionCount % quotesToUse.length;
    const quote = quotesToUse[currentIndex];
    
    // Update history
    this.history.shownQuotes.push(quote.id);
    this.history.lastShownDate = today;
    this.history.completionCount++;
    
    // Clean old history (keep last 30 days)
    this.cleanOldHistory(30);
    this.saveHistory();
    
    return quote;
  }

  /**
   * Weighted random: Favor quotes that haven't been shown recently
   */
  private getWeightedRandomQuote(quotes: Quote[], config: QuoteSelectionConfig): Quote {
    const today = new Date().toISOString().split('T')[0];
    const avoidRecentDays = config.avoidRecentDays || 7;
    const recentQuotes = this.getRecentQuotes(avoidRecentDays);
    
    // Calculate weights (unseen quotes get higher weight)
    const weights = quotes.map(quote => {
      const isRecent = recentQuotes.includes(quote.id);
      return isRecent ? 1 : 10; // 10x higher weight for unseen quotes
    });
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < quotes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        const quote = quotes[i];
        
        // Update history
        this.history.shownQuotes.push(quote.id);
        this.history.lastShownDate = today;
        this.saveHistory();
        
        return quote;
      }
    }
    
    // Fallback to first quote
    return quotes[0];
  }

  /**
   * Category rotation: Cycle through categories systematically
   */
  private getCategoryRotationQuote(quotes: Quote[], config: QuoteSelectionConfig): Quote {
    const categories = [...new Set(quotes.map(q => q.category).filter(Boolean))];
    
    if (categories.length === 0) {
      return this.getSequentialQuote(quotes);
    }
    
    // Get current category
    const currentCategoryIndex = this.history.categoryIndex % categories.length;
    const currentCategory = categories[currentCategoryIndex];
    
    // Get quotes for current category
    const categoryQuotes = quotes.filter(q => q.category === currentCategory);
    
    if (categoryQuotes.length === 0) {
      // Move to next category
      this.history.categoryIndex++;
      this.saveHistory();
      return this.getCategoryRotationQuote(quotes, config);
    }
    
    // Get next quote in category
    const quoteIndex = this.history.completionCount % categoryQuotes.length;
    const quote = categoryQuotes[quoteIndex];
    
    // Update history
    this.history.completionCount++;
    this.history.categoryIndex++;
    this.saveHistory();
    
    return quote;
  }

  /**
   * Get completion statistics
   */
  getCompletionStats(quotes: Quote[]): {
    totalQuotes: number;
    shownQuotes: number;
    completionPercentage: number;
    lastShownDate: string;
    nextQuoteIndex: number;
  } {
    const uniqueShownQuotes = new Set(this.history.shownQuotes);
    const shownCount = uniqueShownQuotes.size;
    const totalCount = quotes.length;
    
    return {
      totalQuotes: totalCount,
      shownQuotes: shownCount,
      completionPercentage: totalCount > 0 ? (shownCount / totalCount) * 100 : 0,
      lastShownDate: this.history.lastShownDate,
      nextQuoteIndex: this.history.completionCount % totalCount
    };
  }

  /**
   * Reset completion tracking
   */
  resetHistory(): void {
    this.history = {
      shownQuotes: [],
      lastShownDate: '',
      completionCount: 0,
      categoryIndex: 0
    };
    this.saveHistory();
  }

  private getRecentQuotes(days: number): string[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    // For simplicity, return all shown quotes if last shown was after cutoff
    if (this.history.lastShownDate >= cutoffString) {
      return this.history.shownQuotes;
    }
    
    return [];
  }

  private cleanOldHistory(keepDays: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    // If last shown was before cutoff, clear history
    if (this.history.lastShownDate < cutoffString) {
      this.history.shownQuotes = [];
    }
  }

  private loadHistory(): QuoteHistory {
    try {
      const stored = this.storage.getItem('quote-selection-history');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load quote selection history:', error);
    }
    
    return {
      shownQuotes: [],
      lastShownDate: '',
      completionCount: 0,
      categoryIndex: 0
    };
  }

  private saveHistory(): void {
    try {
      this.storage.setItem('quote-selection-history', JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save quote selection history:', error);
    }
  }
}

// Storage interface for compatibility
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Enhanced quote selection with multiple strategies
 */
export function createEnhancedQuoteSelector(storage: StorageLike) {
  return new SequentialQuoteSelector(storage);
}

/**
 * Predefined configurations for different use cases
 */
export const QUOTE_SELECTION_CONFIGS = {
  // Simple sequential - shows quotes 1, 2, 3... then back to 1
  SEQUENTIAL: {
    strategy: 'sequential' as const,
    trackHistory: false
  },
  
  // Smart sequential - avoids recent quotes, tracks completion
  SMART_SEQUENTIAL: {
    strategy: 'smart-sequential' as const,
    trackHistory: true,
    avoidRecentDays: 7
  },
  
  // Weighted random - favors unseen quotes
  WEIGHTED_RANDOM: {
    strategy: 'weighted-random' as const,
    trackHistory: true,
    avoidRecentDays: 5
  },
  
  // Category rotation - cycles through categories
  CATEGORY_ROTATION: {
    strategy: 'category-rotation' as const,
    trackHistory: true,
    categoryRotation: true
  }
} as const;
