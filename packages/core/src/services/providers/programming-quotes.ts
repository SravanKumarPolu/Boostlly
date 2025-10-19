import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

/**
 * Programming Quotes API Provider
 *
 * Free API for programming and developer quotes.
 * No API key required.
 *
 * API Endpoint: https://programming-quotesapi.vercel.app/api/random
 * Returns: Single random programming quote
 *
 * Features:
 * - Programming and tech quotes
 * - No rate limits
 * - Simple JSON response
 * - No authentication required
 */
export class ProgrammingQuotesProvider implements QuoteProvider {
  readonly name = "Programming Quotes" as const;
  private dailyQuoteCache: Quote | null = null;
  private dailyQuoteDate: string | null = null;

  /**
   * Get a random programming quote
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
        const url = maybeProxy(
          "https://programming-quotesapi.vercel.app/api/random",
        );
        const res = await guardedFetch(url, {
          cache: "default",
          headers: {
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();

          // API can return different formats, handle both
          const quoteText = data.quote || data.en || data.text || "";
          const quoteAuthor = data.author || "Unknown";

          if (quoteText) {
            const quote = normalizeQuote({
              id: `programming-${data.id || Date.now()}`,
              text: quoteText,
              author: quoteAuthor,
              category: "programming",
              tags: ["programming", "technology", "development"],
              source: "Programming Quotes",
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
          "Programming Quotes",
          "random",
        );
      }

      // Fallback to hardcoded programming quotes
      return this.getFallbackQuote();
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Programming Quotes",
        "random-outer",
      );
      return this.getFallbackQuote();
    }
  }

  /**
   * Search quotes (not supported - returns random)
   */
  async search(query: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Programming Quotes",
        "search",
      );
      return [];
    }
  }

  /**
   * Get quotes by category (returns programming quote)
   */
  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Programming Quotes",
        "getByCategory",
      );
      return [];
    }
  }

  /**
   * Get quotes by author (returns random programming quote)
   */
  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Programming Quotes",
        "getByAuthor",
      );
      return [];
    }
  }

  /**
   * Health check for Programming Quotes API
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const url = maybeProxy(
        "https://programming-quotesapi.vercel.app/api/random",
      );
      const res = await guardedFetch(url, {
        method: "HEAD",
        cache: "no-cache",
      }, 8000); // 8 second timeout for Programming Quotes

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
   * Get a hardcoded fallback programming quote
   */
  private getFallbackQuote(): Quote {
    // Use centralized fallback quotes from Boostlly.ts
    return getRandomFallbackQuote("programming");
  }
}
