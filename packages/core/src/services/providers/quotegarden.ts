import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

export class QuoteGardenProvider implements QuoteProvider {
  readonly name = "QuoteGarden";
  private cachedQuotes: Quote[] | null = null;
  private cacheDate: string | null = null;
  private isServiceDown = false;
  private lastFailureTime = 0;
  private readonly RECOVERY_TIME = 5 * 60 * 1000; // Try again after 5 minutes

  private getFallbackQuotes(): Quote[] {
    // Use centralized fallback quotes from Boostlly.ts
    return [getRandomFallbackQuote("motivation")];
  }

  private getRandomFallbackQuote(): Quote {
    const fallbackQuotes = this.getFallbackQuotes();
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return normalizeQuote(fallbackQuotes[randomIndex]);
  }

  /**
   * Get a random quote from cached quotes
   */
  private getRandomFromCache(): Quote {
    if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
      return this.getRandomFallbackQuote();
    }
    const randomIndex = Math.floor(Math.random() * this.cachedQuotes.length);
    return this.cachedQuotes[randomIndex];
  }

  async random(): Promise<Quote> {
    const today = new Date().toISOString().split("T")[0];

    // Check if we have cached quotes for today
    if (
      this.cachedQuotes &&
      this.cacheDate === today &&
      this.cachedQuotes.length > 0
    ) {
      return this.getRandomFromCache();
    }

    // If service is marked as down, check if we should try again
    if (this.isServiceDown) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.RECOVERY_TIME) {
        // Still in cooldown period, return fallback
        return this.getRandomFallbackQuote();
      } else {
        // Reset and try again
        this.isServiceDown = false;
      }
    }

    try {
      // Using Type.fit API as replacement for QuoteGarden
      // API returns array of quotes: [{"text":"...","author":"..."}, ...]
      const url = maybeProxy("https://type.fit/api/quotes");
      const res = await guardedFetch(url, {
        cache: "default",
        headers: {
          Accept: "application/json",
        },
      }, 8000); // 8 second timeout

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Type.fit returns an array of quotes
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response format - expected array");
      }

      // Parse and cache all quotes
      this.cachedQuotes = data.map((item: any, index: number) => {
        // Extract author name (some have ", type.fit" suffix)
        const rawAuthor = item.author || "Unknown";
        const author = rawAuthor.replace(/, type\.fit$/i, "").trim();

        return normalizeQuote({
          id: `quotegarden-${index}-${Date.now()}`,
          text: item.text || "",
          author: author || "Unknown",
          category: "general", // Type.fit doesn't provide categories
          source: "QuoteGarden", // Keep source name as QuoteGarden for consistency
        });
      });

      this.cacheDate = today;

      // Reset failure state on success
      this.isServiceDown = false;

      // Return random quote from cached list
      return this.getRandomFromCache();
    } catch (e) {
      // Log error for debugging
      console.error("[QuoteGarden] Error fetching from Type.fit API:", e);
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "QuoteGarden",
        "random",
      );

      // Update failure state
      this.lastFailureTime = Date.now();
      this.isServiceDown = true;

      // Return a fallback quote without error
      return this.getRandomFallbackQuote();
    }
  }

  async search(query: string): Promise<Quote[]> {
    try {
      // Ensure we have quotes cached
      if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
        // Try to fetch quotes first
        await this.random();
      }

      // If we still don't have cached quotes, use fallback
      if (!this.cachedQuotes || this.cachedQuotes.length === 0) {
        const fallbackQuotes = this.getFallbackQuotes();
        const normalizedQuery = query.toLowerCase().trim();

        return fallbackQuotes
          .filter(
            (quote) =>
              quote.text.toLowerCase().includes(normalizedQuery) ||
              (quote.author?.toLowerCase() ?? "").includes(normalizedQuery) ||
              (quote.category?.toLowerCase() ?? "").includes(normalizedQuery),
          )
          .map((quote) => normalizeQuote(quote));
      }

      // Search in cached quotes
      const normalizedQuery = query.toLowerCase().trim();
      const matchingQuotes = this.cachedQuotes
        .filter(
          (quote) =>
            quote.text.toLowerCase().includes(normalizedQuery) ||
            (quote.author?.toLowerCase() ?? "").includes(normalizedQuery) ||
            (quote.category?.toLowerCase() ?? "").includes(normalizedQuery),
        )
        .slice(0, 10); // Limit to 10 results

      return matchingQuotes;
    } catch (e) {
      // On any error, return fallback search results
      const fallbackQuotes = this.getFallbackQuotes();
      const normalizedQuery = query.toLowerCase().trim();

      return fallbackQuotes
        .filter(
          (quote) =>
            quote.text.toLowerCase().includes(normalizedQuery) ||
            (quote.author?.toLowerCase() ?? "").includes(normalizedQuery) ||
            (quote.category?.toLowerCase() ?? "").includes(normalizedQuery),
        )
        .map((quote) => normalizeQuote(quote));
    }
  }

  /**
   * Health check for QuoteGarden (Type.fit) API
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
      }, 5000);

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
}
