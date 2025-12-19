import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

/**
 * Type.fit Quote Provider
 *
 * Free API that aggregates quotes from various sources.
 * No API key required.
 *
 * API Endpoint: https://type.fit/api/quotes
 * Returns: Array of quotes with text and author
 *
 * Features:
 * - Large collection of quotes (~1600+ quotes)
 * - No rate limits
 * - Simple JSON response
 * - No authentication required
 */
export class TypeFitProvider implements QuoteProvider {
  readonly name = "Type.fit" as const;
  private cachedQuotes: Quote[] | null = null;
  private cacheDate: string | null = null;

  /**
   * Get a random quote from Type.fit API
   * Uses caching strategy to avoid repeated API calls
   */
  async random(): Promise<Quote> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if we have cached quotes for today
      if (
        this.cachedQuotes &&
        this.cacheDate === today &&
        this.cachedQuotes.length > 0
      ) {
        return this.getRandomFromCache();
      }

      // Fetch all quotes from API
      try {
        const url = maybeProxy("https://type.fit/api/quotes");
        const res = await guardedFetch(url, {
          cache: "default",
          headers: {
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            // Parse and normalize all quotes
            this.cachedQuotes = data.map((item: any, index: number) => {
              // Extract author name (some have ", type.fit" suffix)
              const rawAuthor = item.author || "Unknown";
              const author = rawAuthor.replace(/, type\.fit$/i, "").trim();

              return normalizeQuote({
                id: `typefit-${index}`,
                text: item.text || "",
                author: author || "Unknown",
                category: this.categorizeQuote(item.text || ""),
                source: "Type.fit",
              });
            });

            this.cacheDate = today;

            // Return random quote from cached list
            return this.getRandomFromCache();
          }
        }
      } catch (apiError) {
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Type.fit",
          "random",
        );
      }

      // Fallback to hardcoded quotes if API fails
      return this.getFallbackQuote();
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Type.fit",
        "random-outer",
      );
      return this.getFallbackQuote();
    }
  }

  /**
   * Search quotes from Type.fit
   * Note: Type.fit doesn't have a search endpoint, so we filter cached results
   */
  async search(query: string): Promise<Quote[]> {
    try {
      // Ensure we have quotes cached
      if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
        await this.random(); // This will populate the cache
      }

      if (!this.cachedQuotes) {
        return [];
      }

      const lowerQuery = query.toLowerCase();
      return this.cachedQuotes.filter(
        (q) =>
          q.text.toLowerCase().includes(lowerQuery) ||
          (q.author && q.author.toLowerCase().includes(lowerQuery)),
      );
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Type.fit",
        "search",
      );
      return [];
    }
  }

  /**
   * Get quotes by category (best-effort filtering of cached quotes)
   */
  async getByCategory(category: string): Promise<Quote[]> {
    try {
      // Ensure we have quotes cached
      if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
        await this.random();
      }

      if (!this.cachedQuotes) {
        return [];
      }

      return this.cachedQuotes.filter((q) => q.category === category);
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Type.fit",
        "getByCategory",
      );
      return [];
    }
  }

  /**
   * Get quotes by author (from cached quotes)
   */
  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      // Ensure we have quotes cached
      if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
        await this.random();
      }

      if (!this.cachedQuotes) {
        return [];
      }

      const lowerAuthor = author.toLowerCase();
      return this.cachedQuotes.filter(
        (q) => q.author && q.author.toLowerCase().includes(lowerAuthor),
      );
    } catch (error) {
      logProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Type.fit",
        "getByAuthor",
      );
      return [];
    }
  }

  /**
   * Health check for Type.fit API
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const url = maybeProxy("https://type.fit/api/quotes");
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
   * Get a random quote from the cached list
   */
  private getRandomFromCache(): Quote {
    if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
      return this.getFallbackQuote();
    }

    const randomIndex = Math.floor(Math.random() * this.cachedQuotes.length);
    const quote = this.cachedQuotes[randomIndex];
    
    // Ensure source is always "Type.fit" for quotes from this provider
    if (quote.source !== "Type.fit") {
      quote.source = "Type.fit";
    }
    
    return quote;
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
   * Get a hardcoded fallback quote when API is unavailable
   */
  private getFallbackQuote(): Quote {
    // Use centralized fallback quotes from Boostlly.ts
    return getRandomFallbackQuote("motivation");
  }
}
