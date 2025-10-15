import { Quote } from "../../types";
import { QuoteProvider, normalizeQuote } from "./base";

export class LocalProvider implements QuoteProvider {
  readonly name = "Local";
  private quotes: Quote[];

  constructor(quotes: Quote[]) {
    this.quotes = quotes;
  }

  async random(): Promise<Quote> {
    if (this.quotes.length === 0) {
      return normalizeQuote({
        text: "No quotes available.",
        author: "System",
        category: "general",
        source: "Local",
      });
    }

    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  async search(query: string): Promise<Quote[]> {
    const normalizedQuery = query.toLowerCase();
    return this.quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(normalizedQuery) ||
        quote.author?.toLowerCase().includes(normalizedQuery) ||
        quote.category?.toLowerCase().includes(normalizedQuery),
    );
  }

  async getByCategory(category: string): Promise<Quote[]> {
    const normalizedCategory = category.toLowerCase();
    return this.quotes.filter((quote) =>
      quote.category?.toLowerCase().includes(normalizedCategory),
    );
  }

  async getByAuthor(author: string): Promise<Quote[]> {
    const normalizedAuthor = author.toLowerCase();
    return this.quotes.filter((quote) =>
      quote.author?.toLowerCase().includes(normalizedAuthor),
    );
  }

  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      // Local provider is always healthy if it has quotes
      const responseTime = Date.now() - startTime;
      return {
        status: this.quotes.length > 0 ? "healthy" : "degraded",
        responseTime,
      };
    } catch (e) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
      };
    }
  }
}
