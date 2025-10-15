import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote } from "./base";
import { logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";

export class TheySaidSoProvider implements QuoteProvider {
  readonly name = "They Said So";
  private quotesCache: Quote[] | null = null;
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private async getQuotesCollection(): Promise<Quote[]> {
    const now = Date.now();

    // Return cached quotes if still valid
    if (this.quotesCache && now - this.lastCacheUpdate < this.CACHE_DURATION) {
      return this.quotesCache;
    }

    try {
      // Try to get quotes from multiple endpoints to build a collection
      // Note: Most They Said So endpoints require authentication, so we'll use fallback quotes
      const quotes: Quote[] = [];

      // Try a few endpoints that might work without authentication
      const endpoints = [
        "https://quotes.rest/qod.json",
        "https://quotes.rest/qod?language=en",
        "https://quotes.rest/qod",
      ].map(maybeProxy);

      for (const endpoint of endpoints) {
        try {
          const res = await guardedFetch(endpoint, {
            cache: "default",
          });

          if (res.ok) {
            const data = await res.json();
            const content = data?.contents?.quotes?.[0];

            if (content?.quote && content?.author) {
              quotes.push(
                normalizeQuote({
                  text: content.quote,
                  author: content.author,
                  category: (content.category || "general").toLowerCase(),
                  source: "They Said So",
                }),
              );
              break; // If we get one successful quote, we can stop
            }
          }
        } catch (e) {
          // Continue with next endpoint if one fails
          continue;
        }
      }

      // If we couldn't get any quotes from the API, use fallback quotes
      if (quotes.length === 0) {
        quotes.push(
          normalizeQuote({
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            category: "motivation",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill",
            category: "success",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt",
            category: "motivation",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "It always seems impossible until it's done.",
            author: "Nelson Mandela",
            category: "success",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker",
            category: "leadership",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "Don't watch the clock; do what it does. Keep going.",
            author: "Sam Levenson",
            category: "motivation",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "The only limit to our realization of tomorrow is our doubts of today.",
            author: "Franklin D. Roosevelt",
            category: "motivation",
            source: "They Said So",
          }),
          normalizeQuote({
            text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
            author: "Paul J. Meyer",
            category: "productivity",
            source: "They Said So",
          }),
        );
      }

      this.quotesCache = quotes;
      this.lastCacheUpdate = now;
      return this.quotesCache;
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "TheySaidSo",
        "getQuotesCollection",
      );
      return [];
    }
  }

  async random(): Promise<Quote> {
    try {
      // Try to get quote from API first
      const res = await guardedFetch("https://quotes.rest/qod?language=en", {
        cache: "default",
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.contents?.quotes?.[0];
        if (content?.quote && content?.author) {
          return normalizeQuote({
            text: content.quote,
            author: content.author,
            category: (content.category || "general").toLowerCase(),
            source: "They Said So",
          });
        }
      }

      // If API fails, get from our collection
      const quotes = await this.getQuotesCollection();
      if (quotes.length > 0) {
        // Use date-based selection for daily consistency
        const today = new Date();
        const dayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const quoteIndex = dayOfYear % quotes.length;
        return quotes[quoteIndex];
      }

      // Final fallback
      return normalizeQuote({
        text: "Keep going.",
        author: "They Said So",
        category: "general",
        source: "They Said So",
      });
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "TheySaidSo",
        "daily",
      );
      return normalizeQuote({
        text: "Keep going.",
        author: "They Said So",
        category: "general",
        source: "They Said So",
      });
    }
  }

  async search(query: string): Promise<Quote[]> {
    try {
      const quotes = await this.getQuotesCollection();
      const normalizedQuery = query.toLowerCase().trim();

      // Search in quote text and author
      const results = quotes.filter(
        (quote) =>
          quote.text.toLowerCase().includes(normalizedQuery) ||
          (quote.author?.toLowerCase() ?? "").includes(normalizedQuery),
      );

      // Return up to 10 results
      return results.slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "TheySaidSo",
        "search",
      );
      return [];
    }
  }

  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const quotes = await this.getQuotesCollection();
      const normalizedCategory = category.toLowerCase().trim();

      // Filter quotes by category
      const results = quotes.filter(
        (quote) => quote.category === normalizedCategory,
      );

      // If no exact matches, try keyword matching
      if (results.length === 0) {
        const categoryKeywords: Record<string, string[]> = {
          motivation: [
            "motivation",
            "inspire",
            "success",
            "achieve",
            "goal",
            "dream",
          ],
          wisdom: [
            "wisdom",
            "wise",
            "knowledge",
            "learn",
            "understand",
            "truth",
          ],
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
        const keywordResults = quotes.filter((quote) =>
          keywords.some((keyword) =>
            quote.text.toLowerCase().includes(keyword),
          ),
        );

        return keywordResults.slice(0, 10);
      }

      return results.slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "TheySaidSo",
        "getByCategory",
      );
      return [];
    }
  }

  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const quotes = await this.getQuotesCollection();
      const normalizedAuthor = author.toLowerCase().trim();

      // Find quotes by the specified author
      const results = quotes.filter((quote) =>
        (quote.author?.toLowerCase() ?? "").includes(normalizedAuthor),
      );

      return results.slice(0, 10);
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "TheySaidSo",
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
      const url = maybeProxy("https://quotes.rest/qod?language=en");
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
        // Even if API requires auth, we have fallback quotes, so mark as degraded
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
