import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

/**
 * Stoic Quotes Provider
 *
 * Free API for stoic philosophy quotes.
 * No API key required.
 *
 * API Endpoint: https://stoic-quotes.com/api/quote
 * Returns: Single random stoic quote
 *
 * Features:
 * - Stoic philosophy quotes
 * - No rate limits
 * - Simple JSON response
 * - No authentication required
 */
export class StoicQuotesProvider implements QuoteProvider {
  readonly name = "Stoic Quotes" as const;
  private dailyQuoteCache: Quote | null = null;
  private dailyQuoteDate: string | null = null;

  /**
   * Get a random stoic quote
   */
  async random(): Promise<Quote> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if we have cached today's quote
      if (this.dailyQuoteCache && this.dailyQuoteDate === today) {
        return this.dailyQuoteCache;
      }

      // Fetch from API
      try {
        const url = maybeProxy("https://stoic-quotes.com/api/quote");
        const res = await guardedFetch(url, {
          cache: "default",
          headers: {
            Accept: "application/json",
          },
        }, 8000); // 8 second timeout for Stoic Quotes

        if (res.ok) {
          const data = await res.json();

          if (data && data.text) {
            const quote = normalizeQuote({
              id: `stoic-${Date.now()}`,
              text: data.text || data.quote || "",
              author: data.author || "Unknown Stoic",
              category: "philosophy",
              tags: ["stoicism", "philosophy", "wisdom"],
              source: "Stoic Quotes",
            });

            // Cache the quote
            this.dailyQuoteCache = quote;
            this.dailyQuoteDate = today;

            return quote;
          }
        }
      } catch (apiError) {
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Stoic Quotes",
          "random",
        );
      }

      // Fallback to hardcoded stoic quotes
      return this.getFallbackQuote();
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Stoic Quotes",
        "random-outer",
      );
      return this.getFallbackQuote();
    }
  }

  /**
   * Search quotes (not supported - returns fallback)
   */
  async search(query: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Stoic Quotes",
        "search",
      );
      return [];
    }
  }

  /**
   * Get quotes by category (returns stoic quote)
   */
  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Stoic Quotes",
        "getByCategory",
      );
      return [];
    }
  }

  /**
   * Get quotes by author (returns random stoic quote)
   */
  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Stoic Quotes",
        "getByAuthor",
      );
      return [];
    }
  }

  /**
   * Health check for Stoic Quotes API
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const url = maybeProxy("https://stoic-quotes.com/api/quote");
      const res = await guardedFetch(url, {
        method: "HEAD",
        cache: "no-cache",
      });

      const responseTime = Date.now() - startTime;

      if (res.ok) {
        return {
          status: responseTime < 2000 ? "healthy" : "degraded",
          responseTime,
        };
      }

      return { status: "down", responseTime };
    } catch (error) {
      return { status: "down", responseTime: Date.now() - startTime };
    }
  }

  /**
   * Get a hardcoded fallback stoic quote
   */
  private getFallbackQuote(): Quote {
    // Use centralized fallback quotes from Boostlly.ts
    return getRandomFallbackQuote("philosophy");
  }
}
