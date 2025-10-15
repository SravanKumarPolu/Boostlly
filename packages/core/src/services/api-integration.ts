import { logError, logDebug, logWarning } from "../utils/logger";
import { Quote } from "../types";
import { QuoteProvider } from "./providers/base";
import { QuotableProvider } from "./providers/quotable";
import { ZenQuotesProvider } from "./providers/zenquotes";
// import { TheySaidSoProvider } from "./providers/theysaidso";
// import { FavQsProvider } from "./providers/favqs";
// import { QuoteGardenProvider } from "./providers/quotegarden";
import { LocalProvider } from "./providers/local";

export interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  enabled: boolean;
  priority: number;
  categories: string[];
  timeout: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  timestamp: number;
  cached: boolean;
}

export interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: number;
  cacheHitRate: number;
}

export class APIIntegrationManager {
  private static instance: APIIntegrationManager;
  private providers: Map<string, QuoteProvider> = new Map();
  private configs: Map<string, APIConfig> = new Map();
  private metrics: Map<string, APIMetrics> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();
  private rateLimiters: Map<string, { lastCall: number; count: number }> =
    new Map();

  static getInstance(): APIIntegrationManager {
    if (!APIIntegrationManager.instance) {
      APIIntegrationManager.instance = new APIIntegrationManager();
    }
    return APIIntegrationManager.instance;
  }

  constructor() {
    this.initializeProviders();
    this.initializeConfigs();
  }

  private initializeProviders(): void {
    this.providers.set("quotable", new QuotableProvider());
    this.providers.set("zenquotes", new ZenQuotesProvider());
  }

  private initializeConfigs(): void {
    const defaultConfigs: APIConfig[] = [
      {
        name: "quotable",
        baseUrl: "https://api.quotable.io",
        rateLimit: 30,
        enabled: true,
        priority: 1, // Primary provider (60% weight)
        categories: [
          "motivation",
          "success",
          "leadership",
          "happiness",
          "wisdom",
          "creativity",
          "advice",
          "inspiration",
          "productivity",
          "growth",
          "learning",
          "mindset",
          "positivity",
          "courage",
          "confidence",
          "peace",
          "simplicity",
          "calm",
          "discipline",
          "focus",
          "love",
          "kindness",
          "compassion",
          "purpose",
          "life",
          "resilience",
          "vision",
          "innovation",
          "gratitude",
          "mindfulness",
          "change",
          "adaptability",
          "faith",
          "hope",
        ],
        timeout: 5000,
      },
      {
        name: "zenquotes",
        baseUrl: "https://zenquotes.io/api",
        rateLimit: 20,
        enabled: true,
        priority: 2, // Secondary provider (40% weight)
        categories: ["general", "motivation", "wisdom", "success", "leadership", "happiness", "creativity", "advice", "inspiration", "productivity", "growth", "learning", "mindset", "positivity", "courage", "confidence", "peace", "simplicity", "calm", "discipline", "focus", "love", "kindness", "compassion", "purpose", "life", "resilience", "vision", "innovation", "gratitude", "mindfulness", "change", "adaptability", "faith", "hope"],
        timeout: 5000,
      },
    ];

    defaultConfigs.forEach((config) => {
      this.configs.set(config.name, config);
      this.metrics.set(config.name, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: 0,
        cacheHitRate: 0,
      });
    });
  }

  /**
   * Get a random quote from all available providers
   */
  async getRandomQuote(category?: string): Promise<APIResponse<Quote>> {
    const enabledProviders = this.getEnabledProviders();
    const startTime = Date.now();

    // Try only the first 2 providers to reduce delay, then fallback quickly
    const providersToTry = Array.from(enabledProviders).slice(0, 2);

    for (const [name, provider] of providersToTry) {
      if (category && !this.supportsCategory(name, category)) {
        continue;
      }

      if (this.isRateLimited(name)) {
        continue;
      }

      try {
        const quote = await provider.random();
        this.updateMetrics(name, true, Date.now() - startTime);

        return {
          success: true,
          data: quote,
          provider: name,
          timestamp: Date.now(),
          cached: false,
        };
      } catch (error) {
        this.updateMetrics(name, false, Date.now() - startTime);
        // Only log non-rate-limit errors to reduce noise
        if (error instanceof Error && error.message !== "rate_limited") {
          logWarning(`Failed to get quote from ${name}:`, { error: error });
        }
      }
    }

    // Fallback to local provider
    const localProvider = new LocalProvider(this.getDefaultQuotes());
    const fallbackQuote = await localProvider.random();

    return {
      success: true,
      data: fallbackQuote,
      provider: "local",
      timestamp: Date.now(),
      cached: false,
    };
  }

  /**
   * Search quotes across all providers
   */
  async searchQuotes(
    query: string,
    limit: number = 10,
  ): Promise<APIResponse<Quote[]>> {
    const enabledProviders = this.getEnabledProviders();
    const startTime = Date.now();

    const searchPromises = Array.from(enabledProviders.entries()).map(
      async ([name, provider]) => {
        if (this.isRateLimited(name)) {
          return [];
        }

        try {
          const quotes = await provider.search(query);
          this.updateMetrics(name, true, Date.now() - startTime);
          return quotes.slice(0, Math.ceil(limit / enabledProviders.size));
        } catch (error) {
          this.updateMetrics(name, false, Date.now() - startTime);
          logWarning(`Search failed for ${name}:`, { error: error });
          return [];
        }
      },
    );

    const allResults = await Promise.all(searchPromises);
    const mergedResults = allResults.flat().slice(0, limit);

    return {
      success: mergedResults.length > 0,
      data: mergedResults,
      provider: "multiple",
      timestamp: Date.now(),
      cached: false,
    };
  }

  /**
   * Get quotes by category
   */
  async getQuotesByCategory(
    category: string,
    limit: number = 5,
  ): Promise<APIResponse<Quote[]>> {
    const cacheKey = `category:${category}:${limit}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return {
        success: true,
        data: cached as Quote[],
        provider: "cache",
        timestamp: Date.now(),
        cached: true,
      };
    }

    const enabledProviders = this.getEnabledProviders();
    const results: Quote[] = [];
    const startTime = Date.now();

    for (const [name, provider] of enabledProviders) {
      if (!this.supportsCategory(name, category) || this.isRateLimited(name)) {
        continue;
      }

      try {
        const quote = await provider.random();
        if (quote.category?.toLowerCase().includes(category.toLowerCase())) {
          results.push(quote);
          if (results.length >= limit) break;
        }
        this.updateMetrics(name, true, Date.now() - startTime);
      } catch (error) {
        this.updateMetrics(name, false, Date.now() - startTime);
        logWarning(`Category search failed for ${name}:`, { error: error });
      }
    }

    if (results.length > 0) {
      this.setCached(cacheKey, results, 5 * 60 * 1000); // 5 minutes
    }

    return {
      success: results.length > 0,
      data: results,
      provider: "category-search",
      timestamp: Date.now(),
      cached: false,
    };
  }

  /**
   * Get API health status
   */
  async getAPIHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    const enabledProviders = this.getEnabledProviders();

    const healthPromises = Array.from(enabledProviders.entries()).map(
      async ([name, provider]) => {
        try {
          const startTime = Date.now();
          await provider.random();
          const responseTime = Date.now() - startTime;

          health[name] = responseTime < 10000; // 10 second timeout
          this.updateMetrics(name, health[name], responseTime);
        } catch (error) {
          health[name] = false;
          this.updateMetrics(name, false, 0);
        }
      },
    );

    await Promise.all(healthPromises);
    return health;
  }

  /**
   * Get API metrics
   */
  getAPIMetrics(): Record<string, APIMetrics> {
    const metrics: Record<string, APIMetrics> = {};
    this.metrics.forEach((value, key) => {
      metrics[key] = { ...value };
    });
    return metrics;
  }

  /**
   * Update API configuration
   */
  updateAPIConfig(name: string, config: Partial<APIConfig>): void {
    const existing = this.configs.get(name);
    if (existing) {
      this.configs.set(name, { ...existing, ...config });
    }
  }

  /**
   * Enable/disable API provider
   */
  setAPIEnabled(name: string, enabled: boolean): void {
    const config = this.configs.get(name);
    if (config) {
      config.enabled = enabled;
      this.configs.set(name, config);
    }
  }

  /**
   * Clear API cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = Array.from(this.metrics.values()).reduce(
      (sum, m) => sum + m.totalRequests,
      0,
    );
    const cacheHits = Array.from(this.metrics.values()).reduce(
      (sum, m) => sum + m.totalRequests * m.cacheHitRate,
      0,
    );

    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
    };
  }

  private getEnabledProviders(): Map<string, QuoteProvider> {
    const enabled = new Map<string, QuoteProvider>();

    this.providers.forEach((provider, name) => {
      const config = this.configs.get(name);
      if (config?.enabled) {
        enabled.set(name, provider);
      }
    });

    return enabled;
  }

  private supportsCategory(providerName: string, category: string): boolean {
    const config = this.configs.get(providerName);
    return (
      config?.categories.some((c) =>
        c.toLowerCase().includes(category.toLowerCase()),
      ) ?? false
    );
  }

  private isRateLimited(providerName: string): boolean {
    const config = this.configs.get(providerName);
    if (!config) return true;

    const limiter = this.rateLimiters.get(providerName) || {
      lastCall: 0,
      count: 0,
    };
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    // Reset counter if window has passed
    if (now - limiter.lastCall > windowMs) {
      limiter.count = 0;
    }

    if (limiter.count >= config.rateLimit) {
      return true;
    }

    limiter.count++;
    limiter.lastCall = now;
    this.rateLimiters.set(providerName, limiter);
    return false;
  }

  private updateMetrics(
    providerName: string,
    success: boolean,
    responseTime: number,
  ): void {
    const metrics = this.metrics.get(providerName);
    if (!metrics) return;

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
      metrics.averageResponseTime =
        (metrics.averageResponseTime * (metrics.successfulRequests - 1) +
          responseTime) /
        metrics.successfulRequests;
    } else {
      metrics.failedRequests++;
    }
    metrics.lastUsed = Date.now();

    this.metrics.set(providerName, metrics);
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCached<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getDefaultQuotes(): Quote[] {
    return [
      {
        id: "1",
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation",
        source: "Stanford Commencement Speech",
      },
      {
        id: "2",
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "success",
        source: "Famous Quote",
      },
      {
        id: "3",
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "motivation",
        source: "Famous Quote",
      },
    ];
  }
}
