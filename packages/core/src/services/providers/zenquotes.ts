import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote } from "./base";
import { logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";
import { getRandomFallbackQuote } from "../../utils/Boostlly";

export class ZenQuotesProvider implements QuoteProvider {
  readonly name = "ZenQuotes";
  private todayQuoteCache: Quote | null = null;
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private async getTodayQuote(): Promise<Quote> {
    const now = Date.now();

    // Return cached quote if still valid
    if (
      this.todayQuoteCache &&
      now - this.lastCacheUpdate < this.CACHE_DURATION
    ) {
      return this.todayQuoteCache;
    }

    try {
      const url = maybeProxy("https://zenquotes.io/api/today");
      const res = await guardedFetch(url, {
        cache: "default",
      }, 8000); // 8 second timeout for ZenQuotes

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;

      // Convert to our Quote format and cache
      this.todayQuoteCache = normalizeQuote({
        text: item?.q,
        author: item?.a,
        category: "general", // ZenQuotes doesn't provide categories
        source: "ZenQuotes",
      });

      this.lastCacheUpdate = now;
      return this.todayQuoteCache;
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "ZenQuotes",
        "getTodayQuote",
      );
      // Fallback to Boostlly quotes with zen/mindfulness category
      return getRandomFallbackQuote("mindfulness");
    }
  }

  async random(): Promise<Quote> {
    return this.getTodayQuote();
  }

  async search(query: string): Promise<Quote[]> {
    try {
      const quote = await this.getTodayQuote();
      const normalizedQuery = query.toLowerCase().trim();

      // Search in quote text and author
      const matches =
        quote.text.toLowerCase().includes(normalizedQuery) ||
        (quote.author?.toLowerCase() ?? "").includes(normalizedQuery);

      // Return the quote if it matches, otherwise return empty array
      return matches ? [quote] : [];
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "ZenQuotes",
        "search",
      );
      return [];
    }
  }

  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const quote = await this.getTodayQuote();
      const normalizedCategory = category.toLowerCase().trim();

      // Since ZenQuotes doesn't provide categories, we'll do keyword matching
      // on the quote text to find relevant quotes
      const categoryKeywords: Record<string, string[]> = {
        motivation: [
          "motivation",
          "inspire",
          "success",
          "achieve",
          "goal",
          "dream",
        ],
        wisdom: ["wisdom", "wise", "knowledge", "learn", "understand", "truth"],
        love: ["love", "heart", "relationship", "care", "affection"],
        life: ["life", "live", "experience", "journey", "path"],
        happiness: ["happy", "joy", "happiness", "smile", "positive"],
        leadership: ["lead", "leader", "guide", "inspire", "team"],
        courage: ["courage", "brave", "fear", "strength", "bold"],
        success: ["success", "achieve", "win", "victory", "triumph"],
      };

      const keywords = categoryKeywords[normalizedCategory] || [
        normalizedCategory,
      ];
      const matches = keywords.some((keyword) =>
        quote.text.toLowerCase().includes(keyword),
      );

      // Return the quote if it matches the category, otherwise return empty array
      return matches ? [quote] : [];
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "ZenQuotes",
        "getByCategory",
      );
      return [];
    }
  }

  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const quote = await this.getTodayQuote();
      const normalizedAuthor = author.toLowerCase().trim();

      // Find quotes by the specified author
      const matches = (quote.author?.toLowerCase() ?? "").includes(
        normalizedAuthor,
      );

      // Return the quote if it matches the author, otherwise return empty array
      return matches ? [quote] : [];
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "ZenQuotes",
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
      const url = maybeProxy("https://zenquotes.io/api/today");
      const res = await guardedFetch(url, {
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
        return {
          status: "down",
          responseTime,
        };
      }
    } catch (e) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
      };
    }
  }
}
