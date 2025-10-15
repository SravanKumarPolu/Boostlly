import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote, logProviderError } from "./base";
import { guardedFetch } from "../../utils/rateLimiter";
import { maybeProxy } from "../../utils/network";

export class FavQsProvider implements QuoteProvider {
  readonly name = "FavQs";

  async random(): Promise<Quote> {
    try {
      const url = maybeProxy("https://favqs.com/api/qotd");
      const res = await guardedFetch(url, {
        cache: "default",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const quote = data?.quote;
      return normalizeQuote({
        text: quote?.body,
        author: quote?.author,
        category: quote?.tags?.[0] || "general",
        source: "FavQs",
      });
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "FavQs",
        "daily",
      );
      return normalizeQuote({
        text: "Every day is a new opportunity.",
        author: "Anonymous",
        category: "general",
        source: "FavQs",
      });
    }
  }

  async search(query: string): Promise<Quote[]> {
    try {
      const url = maybeProxy(
        `https://favqs.com/api/quotes?filter=${encodeURIComponent(query)}&type=tag`,
      );
      const res = await guardedFetch(url, {
        cache: "default",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const quotes = data?.quotes || [];

      return quotes.slice(0, 10).map((quote: any) =>
        normalizeQuote({
          text: quote.body,
          author: quote.author,
          category: quote.tags?.[0] || "general",
          source: "FavQs",
        }),
      );
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "FavQs",
        "search",
      );
      return [];
    }
  }

  async getByCategory(category: string): Promise<Quote[]> {
    try {
      const url = maybeProxy(
        `https://favqs.com/api/quotes?filter=${encodeURIComponent(category)}&type=tag`,
      );
      const res = await guardedFetch(url, {
        cache: "default",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const quotes = data?.quotes || [];

      return quotes.slice(0, 10).map((quote: any) =>
        normalizeQuote({
          text: quote.body,
          author: quote.author,
          category: quote.tags?.[0] || category,
          source: "FavQs",
        }),
      );
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "FavQs",
        "getByCategory",
      );
      return [];
    }
  }

  async getByAuthor(author: string): Promise<Quote[]> {
    try {
      const url = maybeProxy(
        `https://favqs.com/api/quotes?filter=${encodeURIComponent(author)}&type=author`,
      );
      const res = await guardedFetch(url, {
        cache: "default",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const quotes = data?.quotes || [];

      return quotes.slice(0, 10).map((quote: any) =>
        normalizeQuote({
          text: quote.body,
          author: quote.author,
          category: quote.tags?.[0] || "general",
          source: "FavQs",
        }),
      );
    } catch (e) {
      logProviderError(
        e instanceof Error ? e : new Error(String(e)),
        "FavQs",
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
      const url = maybeProxy("https://favqs.com/api/qotd");
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
