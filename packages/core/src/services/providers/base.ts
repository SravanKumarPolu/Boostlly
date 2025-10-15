import { Quote } from "../../types";
import { logWarning } from "../../utils/logger";

export interface QuoteProvider {
  readonly name: string;
  random(): Promise<Quote>;
  search(query: string): Promise<Quote[]>;
  getByCategory?(category: string): Promise<Quote[]>;
  getByAuthor?(author: string): Promise<Quote[]>;
  healthCheck?(): Promise<{
    status: "healthy" | "degraded" | "down";
    responseTime: number;
  }>;
}

/**
 * Helper function to log provider errors as warnings since they're handled gracefully
 */
export function logProviderError(
  error: Error | string,
  provider: string,
  operation: string,
  source: string = "QuoteProvider",
): void {
  const message = typeof error === "string" ? error : error.message;
  const isRateLimited = message === "rate_limited";

  if (isRateLimited) {
    // Reduce noise for rate limiting - only log in development
    if (process.env.NODE_ENV === "development") {
      logWarning(
        `${provider} rate limited, using fallback`,
        {
          provider,
          operation,
          reason: "rate_limited",
        },
        source,
      );
    }
  } else {
    logWarning(
      `${provider} provider failed, using fallback`,
      {
        provider,
        operation,
        error: message,
      },
      source,
    );
  }
}

export function normalizeQuote(
  input: Partial<Quote> & {
    text?: string;
    author?: string;
    category?: string;
    categories?: string[];
    tags?: string[];
  },
): Quote {
  const id = Math.random().toString(36).slice(2, 10);
  const categories = input.categories || [];
  const category = (input.category || categories[0] || "general").trim();
  const tags = input.tags || categories;

  return {
    id: input.id || id,
    text: (input.text || "").trim(),
    author: (input.author || "Unknown").trim(),
    category,
    categories: categories.length ? categories : undefined,
    tags: tags && tags.length ? tags : undefined,
    source: input.source || "external",
  };
}
