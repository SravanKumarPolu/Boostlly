/**
 * Refactored QuoteService
 * 
 * This is a refactored version of the QuoteService that uses the new base service
 * architecture for better performance, error handling, and maintainability.
 */

import {
  Quote,
  QuoteServiceConfig,
  Source,
  SourceWeights,
  SearchFilters,
  BulkQuoteOptions,
  QuoteAnalytics,
  APIHealthStatus,
  QuoteSearchResult,
  QuoteRecommendation,
} from "../types";
import { StorageService } from "@boostlly/platform";
import { QuotableProvider } from "./providers/quotable";
import { ZenQuotesProvider } from "./providers/zenquotes";
import { TheySaidSoProvider } from "./providers/theysaidso";
import { FavQsProvider } from "./providers/favqs";
import { QuoteGardenProvider } from "./providers/quotegarden";
import { StoicQuotesProvider } from "./providers/stoic-quotes";
import { ProgrammingQuotesProvider } from "./providers/programming-quotes";
import { DummyJSONProvider } from "./providers/dummyjson";
import type { QuoteProvider } from "./providers/base";
import { logError, logWarning, logDebug } from "../utils/logger";
import { debugEnv } from "../utils/env";
import {
  getTodaysProvider,
  getFallbackChain,
  getProviderDisplayName,
} from "../utils/day-based-quotes";
import { getRandomFallbackQuote } from "../utils/Boostlly";
import { SOURCE_WEIGHTS, TIME_CONSTANTS } from "../constants";
import { BaseService, ServiceResponse } from "./base-service";
import { errorHandler, ErrorUtils } from "../utils/error-handler";
import { getAPIConfig, getEnabledProviders } from "../utils/api-config";
import { createCacheConfig, CACHE_KEYS } from "../utils/cache-utils";

/**
 * Refactored QuoteService with improved architecture
 * 
 * This service extends BaseService to provide:
 * - Unified error handling
 * - Smart caching with predictive capabilities
 * - Performance monitoring
 * - Scalability management
 * - Consistent API patterns
 */
export class QuoteServiceRefactored extends BaseService {
  private storage: StorageService;
  private quoteConfig: QuoteServiceConfig;
  private quotes: Quote[] = [];
  private providers: QuoteProvider[] = [];
  private cachedApiQuotes: Quote[] = [];
  private sourceWeights: SourceWeights;
  private analytics: QuoteAnalytics;
  private healthStatus: Map<Source, APIHealthStatus> = new Map();
  private performanceMetrics: Map<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  > = new Map();

  constructor(storage?: StorageService, config?: Partial<QuoteServiceConfig>) {
    super('QuoteService', {
      cacheEnabled: true,
      cacheTTL: TIME_CONSTANTS.CACHE_24_HOURS,
      retryAttempts: 3,
      timeout: 10000,
      monitoringEnabled: true,
    });

    if (!storage) {
      throw new Error("StorageService must be provided to QuoteService");
    }
    
    this.storage = storage;
    this.quoteConfig = {
      cacheEnabled: true,
      maxCacheAge: TIME_CONSTANTS.CACHE_24_HOURS,
      categories: ["motivation", "productivity", "success", "leadership"],
      ...config,
    };

    this.initializeProviders();
    this.sourceWeights = this.loadSourceWeights();
    this.analytics = this.loadAnalytics();
    this.initializeHealthStatus();
  }

  /**
   * Initialize quote providers with configuration
   */
  private initializeProviders(): void {
    const enabledProviders = getEnabledProviders();
    
    this.providers = [
      new ZenQuotesProvider(),
      new QuotableProvider(),
      new FavQsProvider(),
      new QuoteGardenProvider(),
      new StoicQuotesProvider(),
      new ProgrammingQuotesProvider(),
      new DummyJSONProvider(),
      new TheySaidSoProvider(),
    ].filter(provider => {
      const config = getAPIConfig(provider.name as Source);
      return config?.enabled !== false;
    });
  }

  /**
   * Get today's quote with improved caching and error handling
   */
  async getTodayQuote(): Promise<Quote> {
    await this.ensureInitialized();

    const today = new Date();
    const todayKey = `today_${today.toISOString().split("T")[0]}`;
    const cacheKey = CACHE_KEYS.QUOTE('today', todayKey);

    return this.execute(
      'getTodayQuote',
      cacheKey,
      async () => {
        const todaysProvider = getTodaysProvider().provider as Source;
        const fallbackChain = getFallbackChain(todaysProvider);

        logDebug(`Fetching today's quote from ${todaysProvider}`, {
          provider: todaysProvider,
          fallbackChain,
        });

        // Try primary provider first
        try {
          const quote = await this.fetchQuoteFromProvider(todaysProvider);
          if (quote) {
            return quote;
          }
        } catch (error) {
          logWarning(`Primary provider ${todaysProvider} failed`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }

        // Try fallback providers
        for (const provider of fallbackChain) {
          try {
            const quote = await this.fetchQuoteFromProvider(provider);
            if (quote) {
              logDebug(`Fallback provider ${provider} succeeded`, {
                provider,
              });
              return quote;
            }
          } catch (error) {
            logWarning(`Fallback provider ${provider} failed`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // All providers failed, return fallback quote
        logWarning("All providers failed, returning fallback quote", {
          providers: [todaysProvider, ...fallbackChain],
        });
        return getRandomFallbackQuote();
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: true,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch today quote');
    });
  }

  /**
   * Get random quote with improved error handling
   */
  async getRandomQuote(): Promise<Quote> {
    await this.ensureInitialized();

    const cacheKey = CACHE_KEYS.QUOTE('random', 'general');

    return this.execute(
      'getRandomQuote',
      cacheKey,
      async () => {
        const source = this.selectPrimarySource();
        const fallbackChain = this.getFallbackChain(source);

        // Try primary source
        try {
          const quote = await this.fetchQuoteFromProvider(source);
          if (quote) {
            return quote;
          }
        } catch (error) {
          logWarning(`Primary source ${source} failed`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }

        // Try fallback sources
        for (const fallbackSource of fallbackChain) {
          try {
            const quote = await this.fetchQuoteFromProvider(fallbackSource);
            if (quote) {
              return quote;
            }
          } catch (error) {
            logWarning(`Fallback source ${fallbackSource} failed`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Final fallback
        return getRandomFallbackQuote();
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: true,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch random quote');
    });
  }

  /**
   * Search quotes with improved performance and caching
   */
  async searchQuotes(
    query: string,
    filters: SearchFilters = {},
    limit: number = 10
  ): Promise<QuoteSearchResult> {
    await this.ensureInitialized();

    const cacheKey = CACHE_KEYS.SEARCH(query);

    return this.execute(
      'searchQuotes',
      cacheKey,
      async () => {
        const results: Quote[] = [];
        const sources: Source[] = [
          "ZenQuotes",
          "Quotable",
          "FavQs",
          "They Said So",
        ];

        for (const source of sources) {
          if (results.length >= limit) break;

          try {
            const quotes = await this.searchQuotesFromProvider(source, query, filters);
            results.push(...quotes);
            this.updateHealthStatus(source as Source, { source: source as Source, status: "healthy", responseTime: 0, successRate: 1, lastCheck: Date.now(), errorCount: 0 });
          } catch (error) {
            this.updateHealthStatus(source as Source, { source: source as Source, status: "down", responseTime: 0, successRate: 0, lastCheck: Date.now(), errorCount: 1 });
            logError(
              error instanceof Error ? error : new Error(String(error)),
              { source, query, operation: "searchQuotes" },
              "QuoteService"
            );
          }
        }

        // Add local search results
        const localResults = this.searchLocalQuotes(query, filters);
        results.push(...localResults);

        return {
          quotes: results.slice(0, limit),
          total: results.length,
          query,
          filters,
          sources: sources.filter(s => this.healthStatus.get(s)?.status === "healthy"),
          page: 1,
          limit,
          hasMore: results.length > limit,
          searchTime: 0,
        };
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: false,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to search quotes');
    });
  }

  /**
   * Get quotes by category with improved caching
   */
  async getQuotesByCategory(
    category: string,
    limit: number = 10
  ): Promise<Quote[]> {
    await this.ensureInitialized();

    const cacheKey = CACHE_KEYS.QUOTE('category', category);

    return this.execute(
      'getQuotesByCategory',
      cacheKey,
      async () => {
        const results: Quote[] = [];
        const sources: Source[] = [
          "ZenQuotes",
          "Quotable",
          "FavQs",
          "They Said So",
        ];

        for (const source of sources) {
          if (results.length >= limit) break;

          try {
            const quotes = await this.getQuotesByCategoryFromProvider(source, category);
            const categoryQuotes = quotes.filter(q =>
              (q.category?.toLowerCase() ?? "").includes(category.toLowerCase())
            );
            results.push(...categoryQuotes);
            this.updateHealthStatus(source as Source, { source: source as Source, status: "healthy", responseTime: 0, successRate: 1, lastCheck: Date.now(), errorCount: 0 });
          } catch (error) {
            this.updateHealthStatus(source as Source, { source: source as Source, status: "down", responseTime: 0, successRate: 0, lastCheck: Date.now(), errorCount: 1 });
            logError(
              error instanceof Error ? error : new Error(String(error)),
              { source, category, operation: "getQuotesByCategory" },
              "QuoteService"
            );
          }
        }

        // Add local category quotes
        const localCategoryQuotes = this.quotes.filter(q =>
          (q.category?.toLowerCase() ?? "").includes(category.toLowerCase())
        );
        results.push(...localCategoryQuotes);

        return results.slice(0, limit);
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: false,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get quotes by category');
    });
  }

  /**
   * Get quotes by author with improved caching
   */
  async getQuotesByAuthor(
    author: string,
    limit: number = 10
  ): Promise<Quote[]> {
    await this.ensureInitialized();

    const cacheKey = CACHE_KEYS.QUOTE('author', author);

    return this.execute(
      'getQuotesByAuthor',
      cacheKey,
      async () => {
        const results: Quote[] = [];
        const sources: Source[] = [
          "ZenQuotes",
          "Quotable",
          "FavQs",
          "They Said So",
        ];

        for (const source of sources) {
          if (results.length >= limit) break;

          try {
            const quotes = await this.searchQuotesFromProvider(source, author, {});
            const authorQuotes = quotes.filter(q =>
              (q.author?.toLowerCase() ?? "").includes(author.toLowerCase())
            );
            results.push(...authorQuotes);
            this.updateHealthStatus(source as Source, { source: source as Source, status: "healthy", responseTime: 0, successRate: 1, lastCheck: Date.now(), errorCount: 0 });
          } catch (error) {
            this.updateHealthStatus(source as Source, { source: source as Source, status: "down", responseTime: 0, successRate: 0, lastCheck: Date.now(), errorCount: 1 });
            logError(
              error instanceof Error ? error : new Error(String(error)),
              { source, author, operation: "getQuotesByAuthor" },
              "QuoteService"
            );
          }
        }

        // Add local author quotes
        const localAuthorQuotes = this.quotes.filter(q =>
          (q.author?.toLowerCase() ?? "").includes(author.toLowerCase())
        );
        results.push(...localAuthorQuotes);

        return results.slice(0, limit);
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: false,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get quotes by author');
    });
  }

  /**
   * Get bulk quotes with improved performance
   */
  async getBulkQuotes(options: BulkQuoteOptions): Promise<Quote[]> {
    await this.ensureInitialized();

    const cacheKey = CACHE_KEYS.QUOTE('bulk', JSON.stringify(options));

    return this.execute(
      'getBulkQuotes',
      cacheKey,
      async () => {
        const results: Quote[] = [];
        const { count = 10, categories = [], sources = [] } = options;

        // Use specified sources or all available
        const targetSources = sources.length > 0 ? sources : [
          "ZenQuotes",
          "Quotable",
          "FavQs",
          "They Said So",
        ];

        for (const source of targetSources) {
          if (results.length >= count) break;

          try {
            const quotes = await this.fetchBulkQuotesFromProvider(source as Source, {
              count: Math.min(count - results.length, 5),
              categories,
            });
            results.push(...quotes);
            this.updateHealthStatus(source as Source, { source: source as Source, status: "healthy", responseTime: 0, successRate: 1, lastCheck: Date.now(), errorCount: 0 });
          } catch (error) {
            this.updateHealthStatus(source as Source, { source: source as Source, status: "down", responseTime: 0, successRate: 0, lastCheck: Date.now(), errorCount: 1 });
            logError(
              error instanceof Error ? error : new Error(String(error)),
              { source, options, operation: "getBulkQuotes" },
              "QuoteService"
            );
          }
        }

        return results.slice(0, count);
      },
      {
        useCache: this.quoteConfig.cacheEnabled,
        ttl: TIME_CONSTANTS.CACHE_24_HOURS,
        retryOnError: false,
      }
    ).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get bulk quotes');
    });
  }

  /**
   * Get service analytics
   */
  getAnalytics(): QuoteAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus(): Map<Source, APIHealthStatus> {
    return new Map(this.healthStatus);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Map<Source, { totalCalls: number; successCalls: number; avgResponseTime: number }> {
    return new Map(this.performanceMetrics);
  }

  // Private helper methods

  private async ensureInitialized(): Promise<void> {
    if (this.quotes.length === 0) {
      await this.loadQuotes();
    }
  }

  private async loadQuotes(): Promise<void> {
    try {
      const cachedQuotes = await this.storage.get<Quote[]>("quotes");
      if (cachedQuotes && Array.isArray(cachedQuotes)) {
        this.quotes = cachedQuotes;
      } else {
        this.quotes = [getRandomFallbackQuote()];
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadQuotes" },
        "QuoteService"
      );
      this.quotes = [getRandomFallbackQuote()];
    }
  }

  private selectPrimarySource(): Source {
    const apiSources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "QuoteGarden",
      "Stoic Quotes",
      "Programming Quotes",
    ];
    const weights = apiSources.map(source => this.sourceWeights[source]);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < apiSources.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return apiSources[i];
      }
    }

    return apiSources[0];
  }

  private getFallbackChain(primarySource: Source): Source[] {
    const fallbackOrder: Source[] = [
      "DummyJSON",
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "QuoteGarden",
      "Stoic Quotes",
      "Programming Quotes",
      "They Said So",
    ];
    const primaryIndex = fallbackOrder.indexOf(primarySource);
    return fallbackOrder.slice(primaryIndex + 1);
  }

  private async fetchQuoteFromProvider(source: Source): Promise<Quote> {
    const provider = this.providers.find(p => p.name === source);
    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    const startTime = Date.now();
    try {
      const quote = await provider.random();
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, true, responseTime);
      return quote;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, false, responseTime);
      throw error;
    }
  }

  private async searchQuotesFromProvider(
    source: Source,
    query: string,
    filters: SearchFilters
  ): Promise<Quote[]> {
    const provider = this.providers.find(p => p.name === source);
    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    const startTime = Date.now();
    try {
      const quotes = await provider.search(query);
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, true, responseTime);
      return quotes;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, false, responseTime);
      throw error;
    }
  }

  private async getQuotesByCategoryFromProvider(
    source: Source,
    category: string
  ): Promise<Quote[]> {
    const provider = this.providers.find(p => p.name === source);
    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    const startTime = Date.now();
    try {
      const quotes = await provider.getByCategory?.(category) || [];
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, true, responseTime);
      return quotes;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, false, responseTime);
      throw error;
    }
  }

  private async fetchBulkQuotesFromProvider(
    source: Source,
    options: BulkQuoteOptions
  ): Promise<Quote[]> {
    const provider = this.providers.find(p => p.name === source);
    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    const startTime = Date.now();
    try {
      // For bulk quotes, we'll fetch multiple random quotes
      const quotes: Quote[] = [];
      const count = Math.min(options.count || 5, 10); // Limit to 10 for performance
      
      for (let i = 0; i < count; i++) {
        try {
          const quote = await provider.random();
          quotes.push(quote);
        } catch (error) {
          // If individual quote fails, continue with others
          console.warn(`Failed to fetch quote ${i + 1} from ${source}:`, error);
        }
      }
      
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, true, responseTime);
      return quotes;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(source, false, responseTime);
      throw error;
    }
  }

  private searchLocalQuotes(query: string, filters: SearchFilters): Quote[] {
    return this.quotes.filter(quote => {
      const matchesQuery = !query || 
        quote.text.toLowerCase().includes(query.toLowerCase()) ||
        quote.author?.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !filters.category || 
        quote.category?.toLowerCase().includes(filters.category.toLowerCase());
      
      const matchesTags = !filters.tags || filters.tags.length === 0 ||
        filters.tags.some(tag => quote.tags?.includes(tag));

      return matchesQuery && matchesCategory && matchesTags;
    });
  }

  private updateHealthStatus(source: Source, status: APIHealthStatus): void {
    this.healthStatus.set(source, status);
  }

  private updatePerformanceMetrics(
    source: Source,
    success: boolean,
    responseTime: number
  ): void {
    const current = this.performanceMetrics.get(source) || {
      totalCalls: 0,
      successCalls: 0,
      avgResponseTime: 0,
    };

    current.totalCalls++;
    if (success) {
      current.successCalls++;
    }

    // Update average response time
    const totalTime = current.avgResponseTime * (current.totalCalls - 1);
    current.avgResponseTime = (totalTime + responseTime) / current.totalCalls;

    this.performanceMetrics.set(source, current);
  }

  private loadSourceWeights(): SourceWeights {
    try {
      const stored = this.storage.getSync("sourceWeights");
      if (stored && typeof stored === "object") {
        return { ...SOURCE_WEIGHTS, ...stored };
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadSourceWeights" },
        "QuoteService"
      );
    }
    return { ...SOURCE_WEIGHTS };
  }

  private loadAnalytics(): QuoteAnalytics {
    try {
      const stored = this.storage.getSync("analytics");
      if (stored && typeof stored === "object") {
        return stored as QuoteAnalytics;
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadAnalytics" },
        "QuoteService"
      );
    }
    return {
      totalQuotes: 0,
      sourceDistribution: {} as Record<Source, number>,
      categoryDistribution: {},
      averageRating: 0,
      mostLikedQuotes: [],
      recentlyViewed: [],
      searchHistory: [],
    };
  }

  private initializeHealthStatus(): void {
    const sources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
      "QuoteGarden",
      "Stoic Quotes",
      "Programming Quotes",
      "DummyJSON",
    ];

    sources.forEach(source => {
      this.healthStatus.set(source, { source, status: "down", responseTime: 0, successRate: 0, lastCheck: Date.now(), errorCount: 0 });
    });
  }
}
