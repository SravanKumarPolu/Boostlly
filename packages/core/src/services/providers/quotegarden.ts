import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

export class QuoteGardenProvider implements QuoteProvider {
  readonly name = "QuoteGarden";
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

  async random(): Promise<Quote> {
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
      const url = maybeProxy(
        "https://quote-garden.onrender.com/api/v3/quotes/random",
      );
      const res = await guardedFetch(url, {
        cache: "no-store",
      }, 8000); // 8 second timeout for QuoteGarden

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const content = data?.data?.[0];

      if (!content?.quoteText) {
        throw new Error("Invalid response format");
      }

      // Reset failure state on success
      this.isServiceDown = false;

      return normalizeQuote({
        text: content.quoteText,
        author: content.quoteAuthor || "Unknown",
        category: (content.quoteGenre || "general").toLowerCase(),
        source: "QuoteGarden",
      });
    } catch (e) {
      // Log as a warning since we will gracefully fallback without impacting UX
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
      // If service is down, return fallback search results
      if (this.isServiceDown) {
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

      // Try to get quotes from API
      const q = await this.random();
      const normalized = query.toLowerCase().trim();

      if (
        q.text.toLowerCase().includes(normalized) ||
        (q.author?.toLowerCase() ?? "").includes(normalized) ||
        (q.category?.toLowerCase() ?? "").includes(normalized)
      ) {
        return [q];
      }

      return [];
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
}
