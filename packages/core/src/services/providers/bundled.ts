import { logError, logDebug, logWarning } from "../../utils/logger";
import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote } from "./base";
import { getDateKey, pickQuote } from "../../utils/date-utils";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

/**
 * Bundled Quote Provider
 * Serves quotes from bundled quotes.json using deterministic algorithm
 */
export class BundledProvider implements QuoteProvider {
  readonly name = "Bundled";
  private quotes: Quote[] = [];
  private quotesLoaded = false;

  constructor() {
    // Initialize with fallback quotes
    this.quotes = this.getFallbackQuotes();
  }

  /**
   * Load bundled quotes from quotes.json
   */
  private async loadBundledQuotes(): Promise<void> {
    try {
      // Try multiple possible paths for the quotes file
      const possiblePaths = [
        "/assets/quotes/quotes.json",
        "./assets/quotes/quotes.json",
        "assets/quotes/quotes.json",
      ];

      let response: Response | null = null;

      for (const path of possiblePaths) {
        try {
          response = await fetch(path);
          if (response.ok) break;
        } catch (e) {
          // Try next path
        }
      }

      if (response && response.ok) {
        const bundledQuotesData = await response.json();
        this.quotes = bundledQuotesData.quotes.map((quote: any) =>
          normalizeQuote({
            id: quote.id,
            text: quote.text,
            author: quote.author,
            categories: quote.categories,
            category: quote.categories?.[0] || "general",
            tags: quote.categories || [],
            source: "Bundled",
          }),
        );

        this.quotesLoaded = true;
        logDebug(
          `BundledProvider: Loaded ${this.quotes.length} bundled quotes`,
        );
      } else {
        logWarning(
          "BundledProvider: Failed to load bundled quotes, using fallback",
        );
        // ensure we stick with fallbacks if fetch failed
        this.quotes = this.getFallbackQuotes();
      }
    } catch (error) {
      logWarning("BundledProvider: Failed to load bundled quotes:", {
        error: error,
      });
      this.quotes = this.getFallbackQuotes();
    }
  }

  /**
   * Get random quote using deterministic algorithm
   */
  async random(): Promise<Quote> {
    if (!this.quotesLoaded) {
      await this.loadBundledQuotes();
    }

    const dateKey = getDateKey();

    // If bundled quotes are still not loaded (e.g., fetch failed), use first fallback deterministically
    if (!this.quotesLoaded) {
      const firstFallback = this.getFallbackQuotes()[0];
      return {
        ...firstFallback,
        id: `daily-${dateKey}-${firstFallback.id}`,
        tags: [...(firstFallback.tags || []), "daily", "deterministic"],
      };
    }

    const quote = pickQuote(this.quotes, dateKey);

    return {
      ...quote,
      id: `daily-${dateKey}-${quote.id}`,
      tags: [...(quote.tags || []), "daily", "deterministic"],
    };
  }

  /**
   * Search quotes (not implemented for bundled provider)
   */
  async search(query: string): Promise<Quote[]> {
    if (!this.quotesLoaded) {
      await this.loadBundledQuotes();
    }

    if (!this.quotes || this.quotes.length === 0) {
      this.quotes = this.getFallbackQuotes();
    }

    const lowercaseQuery = query.toLowerCase();
    return this.quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(lowercaseQuery) ||
        quote.author?.toLowerCase().includes(lowercaseQuery) ||
        (quote.tags &&
          quote.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))),
    );
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    if (!this.quotesLoaded) {
      await this.loadBundledQuotes();
    }

    if (!this.quotes || this.quotes.length === 0) {
      this.quotes = this.getFallbackQuotes();
    }

    const categories = new Set<string>();
    this.quotes.forEach((quote) => {
      if (quote.category) {
        categories.add(quote.category);
      }
      if (quote.tags) {
        quote.tags.forEach((tag) => categories.add(tag));
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Get quotes by category
   */
  async getByCategory(category: string): Promise<Quote[]> {
    if (!this.quotesLoaded) {
      await this.loadBundledQuotes();
    }

    return this.quotes.filter(
      (quote) =>
        quote.category === category ||
        (quote.tags && quote.tags.includes(category)),
    );
  }

  /**
   * Get fallback quotes when bundled quotes fail to load
   */
  private getFallbackQuotes(): Quote[] {
    // Use centralized fallback quotes from Boostlly.ts
    return [getRandomFallbackQuote("motivation")];
  }
}
