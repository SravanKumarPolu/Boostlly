import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

/**
 * DummyJSON Quote Provider
 *
 * Free API with a collection of quotes.
 * No API key required.
 *
 * API Endpoint: https://dummyjson.com/quotes/random
 * Returns: Single random quote
 *
 * Role: FALLBACK PROVIDER
 * This provider is used as a backup when Monday-Saturday APIs fail.
 * Not assigned to any specific day, but available as a reliable fallback.
 *
 * Features:
 * - Diverse quote collection
 * - No rate limits
 * - Simple JSON response
 * - No authentication required
 * - High reliability
 */
export class DummyJSONProvider implements QuoteProvider {
  readonly name = "DummyJSON" as const;
  private dailyQuoteCache: Quote | null = null;
  private dailyQuoteDate: string | null = null;

  /**
   * Get a random quote from DummyJSON
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
        const url = maybeProxy("https://dummyjson.com/quotes/random");
        const res = await guardedFetch(url, {
          cache: "default",
          headers: {
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();

          if (data && data.quote) {
            const quote = normalizeQuote({
              id: `dummyjson-${data.id || Date.now()}`,
              text: data.quote || "",
              author: data.author || "Unknown",
              category: this.categorizeQuote(data.quote || ""),
              source: "DummyJSON",
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
          "DummyJSON",
          "random",
        );
      }

      // Fallback to hardcoded quotes
      return this.getFallbackQuote();
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "DummyJSON",
        "random-outer",
      );
      return this.getFallbackQuote();
    }
  }

  /**
   * Search quotes (not directly supported - returns random)
   */
  async search(query: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "DummyJSON",
        "search",
      );
      return [];
    }
  }

  /**
   * Get quotes by category (returns random quote)
   */
  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "DummyJSON",
        "getByCategory",
      );
      return [];
    }
  }

  /**
   * Get quotes by author (returns random quote)
   */
  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const quote = await this.random();
      return [quote];
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "DummyJSON",
        "getByAuthor",
      );
      return [];
    }
  }

  /**
   * Health check for DummyJSON API
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const url = maybeProxy("https://dummyjson.com/quotes/random");
      const res = await guardedFetch(url, {
        method: "HEAD",
        cache: "no-cache",
      }, 8000); // 8 second timeout for DummyJSON

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
   * Simple categorization based on keywords in the quote text
   */
  private categorizeQuote(text: string): string {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("success") ||
      lowerText.includes("achieve") ||
      lowerText.includes("goal")
    ) {
      return "success";
    }
    if (
      lowerText.includes("love") ||
      lowerText.includes("heart") ||
      lowerText.includes("passion")
    ) {
      return "love";
    }
    if (
      lowerText.includes("lead") ||
      lowerText.includes("manage") ||
      lowerText.includes("guide")
    ) {
      return "leadership";
    }
    if (
      lowerText.includes("happy") ||
      lowerText.includes("joy") ||
      lowerText.includes("smile")
    ) {
      return "happiness";
    }
    if (
      lowerText.includes("wise") ||
      lowerText.includes("learn") ||
      lowerText.includes("knowledge")
    ) {
      return "wisdom";
    }
    if (
      lowerText.includes("inspire") ||
      lowerText.includes("motivate") ||
      lowerText.includes("dream")
    ) {
      return "motivation";
    }

    return "general";
  }

  /**
   * Get a hardcoded fallback quote
   */
  private getFallbackQuote(): Quote {
    // Use centralized fallback quotes from Boostlly.ts
    return getRandomFallbackQuote("motivation");
  }
}
