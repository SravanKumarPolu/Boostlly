import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote } from "./base";
import { logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

export class QuotableProvider implements QuoteProvider {
  readonly name = "Quotable";
  private dailyQuoteCache: Quote | null = null;
  private dailyQuoteDate: string | null = null;

  private getQuoteIndexForDate(): number {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Use multiple factors to create more variety
    // Combine day of year, year, month, and day for better distribution
    const combined = (dayOfYear * 7 + year * 3 + month * 5 + day * 11) % 1000;
    return combined;
  }

  private getFallbackQuotes(): Quote[] {
    // Use centralized fallback quotes from Boostlly.ts
    return [getRandomFallbackQuote("motivation")];
  }

  async random(): Promise<Quote> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if we already have today's quote cached
      if (this.dailyQuoteCache && this.dailyQuoteDate === today) {
        return this.dailyQuoteCache;
      }

      // Try to get a quote from the API first
      try {
        const url = maybeProxy("https://api.quotable.io/random");

        const res = await guardedFetch(url, {
          cache: "default",
        });

        if (res.ok) {
          const quote = await res.json();

          if (quote) {
            const dailyQuote = normalizeQuote({
              id: quote._id,
              text: quote.content,
              author: quote.author,
              category:
                Array.isArray(quote.tags) && quote.tags[0]
                  ? quote.tags[0]
                  : "general",
              source: "Quotable",
            });

            // Cache the daily quote
            this.dailyQuoteCache = dailyQuote;
            this.dailyQuoteDate = today;

            return dailyQuote;
          }
        }
      } catch (apiError) {
        // Route through unified provider logger (handles rate_limited as warning)
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Quotable",
          "daily",
        );
      }

      // Fallback to local quotes with date-based selection
      const fallbackQuotes = this.getFallbackQuotes();
      const quoteIndex = this.getQuoteIndexForDate() % fallbackQuotes.length;
      const dailyQuote = fallbackQuotes[quoteIndex];

      // Cache the daily quote
      this.dailyQuoteCache = dailyQuote;
      this.dailyQuoteDate = today;

      return dailyQuote;
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Quotable",
        "daily",
      );

      // Final fallback
      const fallbackQuotes = this.getFallbackQuotes();
      const quoteIndex = Math.floor(Math.random() * fallbackQuotes.length);
      return fallbackQuotes[quoteIndex];
    }
  }

  async search(query: string): Promise<Quote[]> {
    try {
      // Try API first
      try {
        const url = `https://api.quotable.io/search/quotes?query=${encodeURIComponent(query)}&limit=10`;
        const res = await guardedFetch(url, {
          cache: "default",
        });

        if (res.ok) {
          const data = await res.json();
          return (
            data.results?.map((item: any) =>
              normalizeQuote({
                id: item._id,
                text: item.content,
                author: item.author,
                category:
                  Array.isArray(item.tags) && item.tags[0]
                    ? item.tags[0]
                    : "general",
                source: "Quotable",
              }),
            ) || []
          );
        }
      } catch (apiError) {
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Quotable",
          "search",
        );
      }

      // Fallback to local search
      const fallbackQuotes = this.getFallbackQuotes();
      const normalizedQuery = query.toLowerCase().trim();

      return fallbackQuotes
        .filter(
          (quote) =>
            quote.text.toLowerCase().includes(normalizedQuery) ||
            (quote.author?.toLowerCase() ?? "").includes(normalizedQuery) ||
            (quote.category?.toLowerCase() ?? "").includes(normalizedQuery),
        )
        .slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Quotable",
        "search",
      );
      return [];
    }
  }

  async getByCategory(category: string): Promise<Quote[]> {
    try {
      // Try API first
      try {
        const url = `https://api.quotable.io/quotes?tags=${encodeURIComponent(category)}&limit=10`;
        const res = await guardedFetch(url, {
          cache: "default",
        });

        if (res.ok) {
          const data = await res.json();
          return (
            data.results?.map((item: any) =>
              normalizeQuote({
                id: item._id,
                text: item.content,
                author: item.author,
                category:
                  Array.isArray(item.tags) && item.tags[0]
                    ? item.tags[0]
                    : "general",
                source: "Quotable",
              }),
            ) || []
          );
        }
      } catch (apiError) {
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Quotable",
          "getByCategory",
        );
      }

      // Fallback to local category filtering
      const fallbackQuotes = this.getFallbackQuotes();
      const normalizedCategory = category.toLowerCase().trim();

      return fallbackQuotes
        .filter((quote) =>
          (quote.category?.toLowerCase() ?? "").includes(normalizedCategory),
        )
        .slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Quotable",
        "getByCategory",
      );
      return [];
    }
  }

  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      // Try API first
      try {
        const url = `https://api.quotable.io/quotes?author=${encodeURIComponent(author)}&limit=10`;
        const res = await guardedFetch(url, {
          cache: "default",
        });

        if (res.ok) {
          const data = await res.json();
          return (
            data.results?.map((item: any) =>
              normalizeQuote({
                id: item._id,
                text: item.content,
                author: item.author,
                category:
                  Array.isArray(item.tags) && item.tags[0]
                    ? item.tags[0]
                    : "general",
                source: "Quotable",
              }),
            ) || []
          );
        }
      } catch (apiError) {
        logProviderError(
          apiError instanceof Error ? apiError : new Error(String(apiError)),
          "Quotable",
          "getByAuthor",
        );
      }

      // Fallback to local author filtering
      const fallbackQuotes = this.getFallbackQuotes();
      const normalizedAuthor = author.toLowerCase().trim();

      return fallbackQuotes
        .filter((quote) =>
          (quote.author?.toLowerCase() ?? "").includes(normalizedAuthor),
        )
        .slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "Quotable",
        "getByAuthor",
      );
      return [];
    }
  }

  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const res = await guardedFetch("https://api.quotable.io/random", {
        cache: "no-store",
      });
      const responseTime = Date.now() - startTime;

      if (res.ok) {
        return {
          status:
            responseTime < 1000
              ? "healthy"
              : responseTime < 3000
                ? "degraded"
                : "down",
          responseTime,
        };
      } else {
        // We have fallback quotes, so mark as degraded instead of down
        return {
          status: "degraded",
          responseTime,
        };
      }
    } catch (e) {
      // We have fallback quotes, so mark as degraded instead of down
      return {
        status: "degraded",
        responseTime: Date.now() - startTime,
      };
    }
  }
}
