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
  getFallbackChain as getDayBasedFallbackChain,
  getProviderDisplayName,
} from "../utils/day-based-quotes";
import { getRandomFallbackQuote } from "../utils/Boostlly";
import { getDateKey, type TimezoneMode } from "../utils/date-utils";
import { SOURCE_WEIGHTS, TIME_CONSTANTS } from "../constants";
import { BaseService, ServiceResponse } from "./base-service";
import { errorHandler, ErrorUtils } from "../utils/error-handler";
import { getAPIConfig, getEnabledProviders } from "../utils/api-config";
import { createCacheConfig, CACHE_KEYS } from "../utils/cache-utils";
import { createLimiter, type RateLimiterOptions } from "../utils/rateLimiter";
import { QuoteCircuitBreaker } from "./quote-circuit-breaker";
import { QuoteRateLimiter } from "./quote-rate-limiter";
import { QuoteAnalyticsManager } from "./quote-analytics";
import { QuoteFetcher } from "./quote-fetcher";
import { QuoteCacheManager } from "./quote-cache-manager";

/**
 * QuoteService - Central service for managing quotes from multiple providers
 *
 * This service handles quote fetching, caching, provider management, and analytics.
 * It supports multiple quote providers with intelligent fallback mechanisms and
 * provides comprehensive search and recommendation capabilities.
 *
 * @example
 * ```typescript
 * const storage = new StorageService();
 * const quoteService = new QuoteService(storage, {
 *   cacheEnabled: true,
 *   maxCacheAge: TIME_CONSTANTS.CACHE_24_HOURS,
 *   categories: ["motivation", "success"]
 * });
 *
 * const todayQuote = await quoteService.getTodayQuote();
 * const randomQuote = await quoteService.getRandomQuote();
 * ```
 */
export class QuoteService extends BaseService {
  private storage: StorageService;
  private quoteConfig: QuoteServiceConfig;
  private quotes: Quote[] = [];
  private providers: QuoteProvider[] = [];

  // Default source weights (sum = 1, DummyJSON stays fallback-only)
  // Updated based on API reliability and quality analysis
  private defaultSourceWeights: SourceWeights = SOURCE_WEIGHTS;

  private sourceWeights: SourceWeights;
  
  // Configuration constants - centralized for maintainability
  private static readonly CONFIG = {
    HEALTH_CHECK_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
    HEALTH_DEGRADED_THRESHOLD: 0.7, // 70% success rate
    HEALTH_DOWN_THRESHOLD: 0.3, // 30% success rate
    PREFETCH_COUNT: 3, // Prefetch 3 quotes ahead
    PREFETCH_DELAY_MS: 2000, // Wait 2s after quote load before prefetching
    PREFETCH_TIMEOUT_MS: 5000, // 5 second timeout for prefetch requests
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5, // Open circuit after 5 failures
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: 60 * 1000, // Reset after 1 minute
    MAX_PREFETCH_QUEUE_SIZE: 6, // Max 2x prefetch count
    MAX_CACHE_SIZE: 1000, // Max cached quotes
    CLEANUP_INTERVAL_MS: 10 * 60 * 1000, // Cleanup every 10 minutes
  } as const;
  
  // Rate limiting per provider
  private readonly RATE_LIMIT_CONFIG: Record<Source, RateLimiterOptions> = {
    "ZenQuotes": { capacity: 3, refillPerMin: 6 },
    "Quotable": { capacity: 5, refillPerMin: 10 },
    "FavQs": { capacity: 3, refillPerMin: 6 },
    "They Said So": { capacity: 2, refillPerMin: 4 },
    "QuoteGarden": { capacity: 3, refillPerMin: 6 },
    "Stoic Quotes": { capacity: 4, refillPerMin: 8 },
    "Programming Quotes": { capacity: 4, refillPerMin: 8 },
    "DummyJSON": { capacity: 10, refillPerMin: 20 }, // Local fallback, more lenient
  };
  
  // Quote prefetching
  private prefetchQueue: Quote[] = [];
  private prefetchInProgress: boolean = false;
  private enrichmentInProgress: boolean = false;
  
  // Modular components
  private circuitBreaker: QuoteCircuitBreaker;
  private rateLimiter: QuoteRateLimiter;
  private analyticsManager: QuoteAnalyticsManager;
  private quoteFetcher: QuoteFetcher;
  private cacheManager: QuoteCacheManager;

  /**
   * Creates a new QuoteService instance
   *
   * @param storage - The storage service for persistence
   * @param config - Optional configuration overrides
   * @throws {Error} If storage service is not provided
   *
   * @example
   * ```typescript
   * const storage = new StorageService();
   * const quoteService = new QuoteService(storage, {
   *   cacheEnabled: true,
   *   categories: ["motivation", "success"]
   * });
   * ```
   */
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
      maxCacheAge: TIME_CONSTANTS.CACHE_24_HOURS, // 24 hours
      categories: ["motivation", "productivity", "success", "leadership"],
      ...config,
    };
    // Setup providers (order matters for fallback)
    this.providers = [
      new ZenQuotesProvider(), // Monday - Zen wisdom
      new QuotableProvider(), // Tuesday - Inspiring collection
      new FavQsProvider(), // Wednesday - Quote of the day
      new QuoteGardenProvider(), // Thursday - Curated collection
      new StoicQuotesProvider(), // Friday - Stoic philosophy
      new ProgrammingQuotesProvider(), // Saturday - Programming quotes
      new DummyJSONProvider(), // FALLBACK for all Mon-Sat API failures
      new TheySaidSoProvider(), // Additional fallback option
    ];

    // Initialize source weights
    this.sourceWeights = this.loadSourceWeights();

    // Analytics is initialized in analyticsManager

    // Initialize modular components
    this.circuitBreaker = new QuoteCircuitBreaker({
      failureThreshold: QuoteService.CONFIG.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      resetTimeoutMs: QuoteService.CONFIG.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
    });
    
    this.rateLimiter = new QuoteRateLimiter(this.RATE_LIMIT_CONFIG);
    
    this.analyticsManager = new QuoteAnalyticsManager(
      this.storage,
      {
        healthCheckIntervalMs: QuoteService.CONFIG.HEALTH_CHECK_INTERVAL_MS,
        degradedThreshold: QuoteService.CONFIG.HEALTH_DEGRADED_THRESHOLD,
        downThreshold: QuoteService.CONFIG.HEALTH_DOWN_THRESHOLD,
      },
      this.providers
    );
    
    // Initialize circuit breakers and rate limiters
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
    this.circuitBreaker.initialize(sources);
    this.rateLimiter.initialize(sources);

    // Initialize cache manager
    this.cacheManager = new QuoteCacheManager(this.storage, {
      maxCacheSize: QuoteService.CONFIG.MAX_CACHE_SIZE,
      cleanupIntervalMs: QuoteService.CONFIG.CLEANUP_INTERVAL_MS,
    });

    // Initialize quote fetcher
    this.quoteFetcher = new QuoteFetcher(
      this.storage,
      this.providers,
      this.sourceWeights,
      {
        cacheEnabled: this.quoteConfig.cacheEnabled,
        maxCacheSize: QuoteService.CONFIG.MAX_CACHE_SIZE,
      }
    );

    // Start health monitoring (enabled by default in BaseService config)
    // Health monitoring runs in browser environments only
    if (typeof window !== "undefined") {
      this.analyticsManager.startHealthMonitoring();
      this.cacheManager.startCleanup();
    }

    // Circuit breakers already initialized above

    // Note: loadQuotes() is now called lazily when needed, not during constructor
  }
  
  /**
   * Check if circuit breaker is open for a provider
   */
  private isCircuitOpen(source: Source): boolean {
    return this.circuitBreaker.isOpen(source);
  }
  
  /**
   * Record a successful request (reset circuit breaker)
   */
  private recordSuccess(source: Source): void {
    this.circuitBreaker.recordSuccess(source);
  }
  
  /**
   * Record a failure (may open circuit breaker)
   */
  private recordFailure(source: Source): void {
    this.circuitBreaker.recordFailure(source);
  }
  
  /**
   * Perform resource cleanup to prevent memory leaks
   */
  private performResourceCleanup(): void {
    try {
      // Limit prefetch queue size
      if (this.prefetchQueue.length > QuoteService.CONFIG.MAX_PREFETCH_QUEUE_SIZE) {
        this.prefetchQueue = this.prefetchQueue.slice(0, QuoteService.CONFIG.PREFETCH_COUNT);
        logDebug("Cleaned up prefetch queue", { 
          previousSize: QuoteService.CONFIG.MAX_PREFETCH_QUEUE_SIZE,
          newSize: this.prefetchQueue.length 
        });
      }
      
      // Cache cleanup is managed by cacheManager
    } catch (error) {
      logDebug("Error during resource cleanup", { error });
    }
  }

  private loadSourceWeights(): SourceWeights {
    try {
      const stored = this.storage.getSync(
        "sourceWeights",
      ) as SourceWeights | null;
      if (stored && typeof stored === "object") {
        // Remove AI if present and add missing keys with 0
        const cleaned: SourceWeights = {
          ZenQuotes: stored.ZenQuotes || 0,
          Quotable: stored.Quotable || 0,
          FavQs: stored.FavQs || 0,
          "They Said So": stored["They Said So"] || 0,
          QuoteGarden: (stored as any).QuoteGarden || 0,
          "Stoic Quotes": (stored as any)["Stoic Quotes"] || 0,
          "Programming Quotes": (stored as any)["Programming Quotes"] || 0,
          DummyJSON: 0, // DummyJSON always stays fallback-only
        };

        // Re-normalize to the default distribution
        const totalWeight =
          cleaned.ZenQuotes +
          cleaned.Quotable +
          cleaned.FavQs +
          cleaned["They Said So"] +
          cleaned.QuoteGarden +
          cleaned["Stoic Quotes"] +
          cleaned["Programming Quotes"];
        if (totalWeight > 0) {
          const scale =
            (this.defaultSourceWeights.ZenQuotes +
              this.defaultSourceWeights.Quotable +
              this.defaultSourceWeights.FavQs +
              this.defaultSourceWeights["They Said So"] +
              this.defaultSourceWeights.QuoteGarden +
              this.defaultSourceWeights["Stoic Quotes"] +
              this.defaultSourceWeights["Programming Quotes"]) /
            totalWeight;
          cleaned.ZenQuotes *= scale;
          cleaned.Quotable *= scale;
          cleaned.FavQs *= scale;
          cleaned["They Said So"] *= scale;
          cleaned.QuoteGarden *= scale;
          cleaned["Stoic Quotes"] *= scale;
          cleaned["Programming Quotes"] *= scale;
        } else {
          // Use defaults if no valid weights
          return { ...this.defaultSourceWeights };
        }

        return cleaned;
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadSourceWeights" },
        "QuoteService",
      );
    }

    return { ...this.defaultSourceWeights };
  }

  // Provider selection, fetching, and caching are now handled by quoteFetcher and cacheManager

  private async ensureInitialized(): Promise<void> {
    this.quotes = await this.quoteFetcher.ensureInitialized(this.quotes);
  }

  /**
   * Loads quotes from storage and initializes the service
   */
  async loadQuotes(): Promise<void> {
    try {
      this.quotes = await this.quoteFetcher.loadQuotes();
      // Ensure we have a minimum set of fallback quotes even if loading fails
      if (this.quotes.length === 0) {
        const fallbackQuotes = [
          getRandomFallbackQuote("motivation"),
          getRandomFallbackQuote("success"),
          getRandomFallbackQuote("wisdom"),
          getRandomFallbackQuote("inspiration"),
        ].filter((q, i, arr) => arr.findIndex(q2 => q2.id === q.id) === i);
        this.quotes = fallbackQuotes.length > 0 ? fallbackQuotes : [getRandomFallbackQuote()];
      }
    } catch (error) {
      // If loading fails, ensure we have fallback quotes
      if (this.quotes.length === 0) {
        const fallbackQuotes = [
          getRandomFallbackQuote("motivation"),
          getRandomFallbackQuote("success"),
          getRandomFallbackQuote("wisdom"),
          getRandomFallbackQuote("inspiration"),
        ].filter((q, i, arr) => arr.findIndex(q2 => q2.id === q.id) === i);
        this.quotes = fallbackQuotes.length > 0 ? fallbackQuotes : [getRandomFallbackQuote()];
      }
      logDebug("Error loading quotes, using fallback", { error });
    }
  }

  getDailyQuote(): Quote {
    // Always ensure we have at least one quote
    // Use multiple fallback quotes to ensure better variety
    if (this.quotes.length === 0) {
      // Initialize with multiple fallback quotes for better variety
      const fallbackQuotes = [
        getRandomFallbackQuote("motivation"),
        getRandomFallbackQuote("success"),
        getRandomFallbackQuote("wisdom"),
        getRandomFallbackQuote("inspiration"),
      ].filter((q, i, arr) => arr.findIndex(q2 => q2.id === q.id) === i); // Remove duplicates
      this.quotes = fallbackQuotes.length > 0 ? fallbackQuotes : [getRandomFallbackQuote()];
    }

    // Include custom saved quotes from storage
    // Merge shipped/local quotes with cached API enrichment pool
    let allQuotes = [...this.quotes, ...this.cacheManager.getCachedApiQuotes()];
    try {
      const savedQuotes = this.storage.getSync("savedQuotes");
      if (Array.isArray(savedQuotes) && savedQuotes.length > 0) {
        // Add custom quotes to the pool
        allQuotes = [...allQuotes, ...savedQuotes];
      }
    } catch (error) {
      // If we can't get saved quotes, just use default quotes
      logDebug("Could not load saved quotes for daily quote", { error });
    }
    
    // IMPROVED: If pool is very small, try to enrich it asynchronously
    if (allQuotes.length <= 5) {
      logWarning(`Small quote pool detected: ${allQuotes.length} quotes available`, {
        localQuotes: this.quotes.length,
        cachedApiQuotes: this.cacheManager.getCachedApiQuotes().length,
        savedQuotes: (this.storage.getSync("savedQuotes") || []).length,
        suggestion: "Attempting to enrich pool in background...",
      });
      
      // Try to enrich pool in background (non-blocking)
      this.enrichQuotePoolInBackground().catch((error) => {
        logDebug("Background quote enrichment failed", { error });
      });
    }

    // Get timezone preference and today's date key
    const timezone = this.quoteFetcher.getTimezonePreference();
    const today = getDateKey(new Date(), timezone);
    
    // Dev-only diagnostics - allow force refresh via URL parameter
    if (
      typeof window !== "undefined" &&
      (window as any)?.location?.search?.includes("force=1")
    ) {
      console.log("[QuoteService] Force refresh requested via URL parameter");
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
      // Also clear legacy keys
      this.storage.setSync("dayBasedQuote", null);
      this.storage.setSync("dayBasedQuoteDate", null);
    }

    // Try to get the stored daily quote using unified cache keys
    const storedDailyQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
    const storedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);

    // CRITICAL: Only use cached quote if it's from TODAY (same date key)
    // If storedDate is different from today, it's an old quote and must be refreshed
    if (storedDate && storedDate !== today) {
      // Stored quote is from a different date - clear ALL quote caches immediately
      console.log(`[QuoteService] ⚠️ STALE QUOTE DETECTED! Stored date: "${storedDate}", Today: "${today}". Clearing all quote caches...`);
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
      // Also clear legacy keys for backward compatibility
      this.storage.setSync("dayBasedQuote", null);
      this.storage.setSync("dayBasedQuoteDate", null);
      // Also clear any legacy cache keys
      try {
        this.storage.setSync("quotes-last-fetch", null);
      } catch {}
      console.log(`[QuoteService] ✅ All quote caches cleared. Will generate fresh quote for ${today}`);
    } else if (storedDailyQuote && storedDate === today) {
      // Valid cached quote from today - check if it's from AI source (which we treat as expired)
      if (storedDailyQuote.source === "AI") {
        console.log("[QuoteService] Cached quote is from AI source, treating as expired");
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
      } else {
        // Valid cached quote from today - return it
        console.log(`[QuoteService] Using cached quote from ${today} (timezone: ${timezone})`);
        return storedDailyQuote;
      }
    } else if (!storedDate) {
      console.log(`[QuoteService] No cached quote found. Will generate new quote for ${today} (timezone: ${timezone})`);
    }

    // Get recent quote history to avoid repetition
    const recentQuotes = this.getRecentQuoteHistory(7); // Last 7 days
    
    // Filter out recently shown quotes if we have enough quotes
    let availableQuotes = allQuotes;
    if (allQuotes.length > recentQuotes.length + 5) {
      availableQuotes = allQuotes.filter(quote => 
        !recentQuotes.some(recent => recent.id === quote.id)
      );
    }
    
    // If filtering left us with too few quotes, use all quotes
    if (availableQuotes.length < 3) {
      availableQuotes = allQuotes;
    }

    // IMPROVED: Better handling for small quote pools
    // If we have a very small pool (2-3 quotes), use a smarter selection
    if (availableQuotes.length <= 3) {
      // For small pools, prioritize quotes not shown in last 14 days (instead of 7)
      const extendedRecentQuotes = this.getRecentQuoteHistory(14);
      const trulyAvailable = availableQuotes.filter(quote => 
        !extendedRecentQuotes.some(recent => recent.id === quote.id)
      );
      
      // If we still have options after extended filtering, use those
      if (trulyAvailable.length > 0) {
        availableQuotes = trulyAvailable;
      }
      
      // Use a more varied index calculation for small pools
      // Combine date with a time-based component to add more variety
      const timeComponent = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
      const quoteIndex = (this.getQuoteIndexForDate(today) + timeComponent * 17) % availableQuotes.length;
      const dailyQuote = availableQuotes[quoteIndex];
      
      // Log warning if pool is very small
      if (allQuotes.length <= 3) {
        logWarning(`Very small quote pool detected (${allQuotes.length} quotes). Consider checking API status or adding more quotes.`, {
          poolSize: allQuotes.length,
          cachedApiQuotes: this.cacheManager.getCachedApiQuotes().length,
          localQuotes: this.quotes.length,
        });
      }
      
      // Store the new daily quote and update history using unified cache keys
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, dailyQuote);
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
      this.updateQuoteHistory(dailyQuote, today);

      return dailyQuote;
    }

    // For larger pools, use standard date-based selection
    const quoteIndex = this.getQuoteIndexForDate(today);
    const dailyQuote = availableQuotes[quoteIndex % availableQuotes.length];

    // Store the new daily quote and update history using unified cache keys
    this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, dailyQuote);
    this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
    this.updateQuoteHistory(dailyQuote, today);

    return dailyQuote;
  }

  // Async daily quote that actually hits providers and respects force bypass
  /**
   * Gets today's daily quote with caching and provider fallback
   *
   * Returns a deterministic quote for the current date. The quote is cached
   * for the day and will be the same for all users. If no cached quote exists,
   * it will fetch from providers with intelligent fallback.
   *
   * @param force - If true, bypasses cache and fetches fresh quote
   * @returns Promise that resolves to today's quote
   *
   * @example
   * ```typescript
   * const todayQuote = await quoteService.getDailyQuoteAsync();
   * const freshQuote = await quoteService.getDailyQuoteAsync(true);
   * ```
   */
  async getDailyQuoteAsync(force: boolean = false): Promise<Quote> {
    await this.ensureInitialized();
    // Get timezone preference and today's date key
    const timezone = this.quoteFetcher.getTimezonePreference();
    const today = getDateKey(new Date(), timezone);
    try {
      if (!force) {
        const storedDailyQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
        const storedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);
        // CRITICAL: Only use cached quote if date matches exactly (same day)
        if (storedDailyQuote && storedDate === today) {
          return storedDailyQuote;
        } else if (storedDailyQuote && storedDate !== today) {
          // Clear stale cached quote from previous day
          console.log(`[QuoteService] Clearing stale quote from ${storedDate}, today is ${today}`);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
        }
      } else {
        // Force refresh - clear cache
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
      }
      // Choose a primary and use fallback chain
      const source = this.quoteFetcher.selectPrimarySource();
      const fallbackChain = [
        source,
        ...this.quoteFetcher.getFallbackChain(source),
      ] as Source[];
      // Try fallback chain with graceful degradation
      for (const s of fallbackChain) {
        // Skip if not available
        if (!this.isProviderAvailable(s)) {
          logDebug(`Skipping ${s} - not available`);
          continue;
        }
        
        try {
          const q = await this.randomFrom(s);
          
          // Persist using unified cache keys
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, q);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
          
          // Trigger prefetching
          this.prefetchQuotesInBackground();
          
          return q;
        } catch (error) {
          // Continue to next provider - graceful degradation
          logDebug(`Provider ${s} failed, trying next`, {
              source: s,
              error: error instanceof Error ? error.message : String(error),
          });
          continue;
        }
      }
      // Final local fallback
      const local = this.getDailyQuote();
      return local;
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "getDailyQuoteAsync" },
        "QuoteService",
      );
      return this.getDailyQuote();
    }
  }

  /**
   * Gets a quote based on the day of the week
   *
   * This method implements a day-based provider selection system where each
   * day of the week is assigned a specific quote provider. This creates a
   * predictable yet varied experience throughout the week.
   *
   * Weekly Schedule:
   * - Sunday: DummyJSON (fallback quotes)
   * - Monday: ZenQuotes
   * - Tuesday: Quotable
   * - Wednesday: FavQs
   * - Thursday: They Said So
   * - Friday: QuoteGarden
   * - Saturday: Type.fit
   *
   * If the day's provider fails, the method automatically falls back to
   * other providers in order of reliability, and finally to local/bundled
   * quotes.
   *
   * @param force - If true, bypasses cache and fetches a fresh quote
   * @returns Promise that resolves to a quote with source attribution
   *
   * @example
   * ```typescript
   * // Get quote for today's assigned provider
   * const quote = await quoteService.getQuoteByDay();
   * console.log(`Today's quote from ${quote.source}`);
   *
   * // Force fetch a fresh quote
   * const freshQuote = await quoteService.getQuoteByDay(true);
   * ```
   */
  async getQuoteByDay(force: boolean = false): Promise<Quote> {
    await this.ensureInitialized();
    // Get timezone preference and today's date key
    const timezone = this.quoteFetcher.getTimezonePreference();
    const today = getDateKey(new Date(), timezone);

    try {
      // Check cache first (unless force is true) - using unified cache keys
      if (!force) {
        const cachedQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
        const cachedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);

        // CRITICAL: Only use cached quote if date matches exactly (same day)
        if (cachedDate && cachedDate !== today) {
          // Stale cached quote - clear it immediately
          console.log(`[QuoteService.getQuoteByDay] ⚠️ STALE QUOTE! Cached date: "${cachedDate}", Today: "${today}". Clearing cache...`);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
        } else if (cachedQuote && cachedDate === today) {
          // Valid cached quote from today
          logDebug("Day-based quote: Using cached quote", {
            source: cachedQuote.source,
            date: today,
            timezone,
          });
          return cachedQuote;
        }
      } else {
        // Force refresh - clear cache
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, null);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, null);
      }

      // Get today's assigned provider
      const todaysMapping = getTodaysProvider();
      const primaryProvider = todaysMapping.provider;

      logDebug("Day-based quote: Fetching from today's provider", {
        day: todaysMapping.dayName,
        provider: getProviderDisplayName(primaryProvider),
        timezone,
      });

      // Build fallback chain (excluding the primary since we'll try it first)
      const fallbackChain = getDayBasedFallbackChain(primaryProvider);
      // Prioritize healthy providers in fallback chain
      const providersToTry = this.analyticsManager.prioritizeProvidersByHealth([primaryProvider, ...fallbackChain]);

      // Try each provider in order with graceful degradation
      for (const providerSource of providersToTry) {
        // Skip if not available (rate limited, circuit open, or unhealthy)
        if (!this.isProviderAvailable(providerSource)) {
          logDebug(`Day-based quote: Skipping ${providerSource} - not available`);
          continue;
        }
        
        const provider = this.providers.find((p) => p.name === providerSource);

        if (!provider) {
          logDebug(
            `Day-based quote: Provider ${providerSource} not found, skipping`,
          );
          continue;
        }

        try {
          const quote = await this.executeProviderRequest(
            providerSource,
            () => provider.random(),
            "getQuoteByDay"
          );

          // Ensure the quote has proper source attribution
          const attributedQuote: Quote = {
            ...quote,
            source: providerSource,
          };

          // Cache the quote using unified cache keys
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, attributedQuote);
          this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
          
          // Enrich the quote pool by caching this API quote
          this.cacheManager.addCachedApiQuote(attributedQuote).catch(() => {});
          
          // Track analytics
          this.updateAnalytics(attributedQuote, "view");
          
          // Trigger prefetching
          this.prefetchQuotesInBackground();

          logDebug("Day-based quote: Successfully fetched", {
            source: providerSource,
            isPrimary: providerSource === primaryProvider,
            quoteText: attributedQuote.text.substring(0, 50) + "...",
          });

          return attributedQuote;
        } catch (error) {
          // Continue to next provider - graceful degradation
          logDebug(`Day-based quote: Provider ${providerSource} failed, trying next`, {
              provider: providerSource,
              error: error instanceof Error ? error.message : String(error),
          });
          continue;
        }
      }

      // If all providers failed, try prefetched quote first
      const prefetched = this.getPrefetchedQuote();
      if (prefetched) {
        // Cache the prefetched quote
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, prefetched);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
        return prefetched;
      }

      // Final fallback to local quote
      logWarning("Day-based quote: All providers failed, using local fallback");
      const fallbackQuote = this.getDailyQuote();

      // Cache the fallback using unified cache keys
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, fallbackQuote);
      this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, today);
      
      // Try to enrich pool in background for future use
      this.enrichQuotePoolInBackground().catch(() => {});

      return fallbackQuote;
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "getQuoteByDay" },
        "QuoteService",
      );

      // Final fallback to getDailyQuote
      return this.getDailyQuote();
    }
  }

  // Dev helper to log env presence
  logDetectedEnv(): void {
    debugEnv("detected", [
      "NEXT_PUBLIC_ZENQUOTES_KEY",
      "NEXT_PUBLIC_FAVQS_API_KEY",
      "NEXT_PUBLIC_TSS_API_KEY",
      "VITE_FAVQS_API_KEY",
      "VITE_TSS_API_KEY",
    ]);
  }

  getDailyQuoteInfo(): {
    quote: Quote;
    isCached: boolean;
    cachedDate: string | null;
  } {
    const timezone = this.quoteFetcher.getTimezonePreference();
    const today = getDateKey(new Date(), timezone);
    const storedDailyQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
    const storedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);

    const isCached = storedDailyQuote && storedDate === today;

    if (isCached) {
      return {
        quote: storedDailyQuote,
        isCached: true,
        cachedDate: storedDate,
      };
    } else {
      const quote = this.getDailyQuote();
      return { quote, isCached: false, cachedDate: storedDate };
    }
  }

  getRandomQuote(): Quote {
    // Always ensure we have at least one quote
    if (this.quotes.length === 0) {
      this.quotes = [getRandomFallbackQuote()];
    }

    // Include custom saved quotes from storage
    let allQuotes = [...this.quotes];
    try {
      const savedQuotes = this.storage.getSync("savedQuotes");
      if (Array.isArray(savedQuotes) && savedQuotes.length > 0) {
        // Add custom quotes to the pool
        allQuotes = [...allQuotes, ...savedQuotes];
      }
    } catch (error) {
      // If we can't get saved quotes, just use default quotes
      logDebug("Could not load saved quotes for random selection", { error });
    }

    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[randomIndex];
  }

  /**
   * Gets a random quote from a specific provider source
   *
   * Fetches a random quote from the specified provider with fallback to other
   * providers if the primary source fails. Updates performance metrics and
   * health status for the provider.
   *
   * @param source - The provider source to fetch from
   * @returns Promise that resolves to a random quote
   * @throws {Error} If all providers fail to return a quote
   *
   * @example
   * ```typescript
   * const quote = await quoteService.randomFrom('Quotable');
   * ```
   */
  async randomFrom(source: Source): Promise<Quote> {
    await this.ensureInitialized();

    // Try primary source first with comprehensive error handling
    const primaryProvider = this.providers.find((p) => p.name === source);
    if (primaryProvider) {
      try {
        const q = await this.executeProviderRequest(
          source,
          () => primaryProvider.random(),
          "randomFrom"
        );
        
        // Track analytics
        this.updateAnalytics(q, "view");
        return q;
      } catch (error) {
        // Log but continue to fallback chain
        logDebug(`Primary provider ${source} failed, trying fallback chain`, {
          source,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // If primary fails, try fallback chain with graceful degradation
    const fallbackChain = this.quoteFetcher.getFallbackChain(source);
    for (const fallbackSource of fallbackChain) {
      // Skip if not available (rate limited, circuit open, or unhealthy)
      if (!this.isProviderAvailable(fallbackSource)) {
        continue;
      }
      
      const fallbackProvider = this.providers.find(
        (p) => p.name === fallbackSource,
      );
      if (fallbackProvider) {
        try {
          const q = await this.executeProviderRequest(
            fallbackSource,
            () => fallbackProvider.random(),
            "randomFrom"
          );
          
          // Track analytics
          this.updateAnalytics(q, "view");
          return q;
        } catch (error) {
          // Continue to next fallback - graceful degradation
          logDebug(`Fallback provider ${fallbackSource} failed, trying next`, {
            source: fallbackSource,
            error: error instanceof Error ? error.message : String(error),
          });
          continue;
        }
      }
    }

    // Final fallback to local - always succeeds
    const localQuote = this.getRandomQuote();
    this.updateAnalytics(localQuote, "view");
    return localQuote;
  }

  // Main random method that intelligently selects providers and handles failures
  /**
   * Gets a random quote using intelligent provider selection
   *
   * Uses weighted random selection to choose a provider based on performance
   * metrics and reliability. Automatically falls back to other providers if
   * the selected provider fails.
   *
   * @returns Promise that resolves to a random quote
   *
   * @example
   * ```typescript
   * const quote = await quoteService.random();
   * ```
   */
  async random(): Promise<Quote> {
    await this.ensureInitialized();

    // Get working providers based on health status
    const workingProviders = this.providers.filter((provider) => {
      return this.analyticsManager.isProviderHealthy(provider.name as Source);
    });

    // If no working providers, fall back to local
    if (workingProviders.length === 0) {
      return this.getRandomQuote();
    }

    // Try providers in order of reliability (based on source weights)
    const sortedProviders = workingProviders.sort((a, b) => {
      const weightA = this.sourceWeights[a.name as Source] || 0;
      const weightB = this.sourceWeights[b.name as Source] || 0;
      return weightB - weightA;
    });

    // Try each provider until one succeeds with graceful degradation
    for (const provider of sortedProviders) {
      const source = provider.name as Source;

      // Skip if not available
      if (!this.isProviderAvailable(source)) {
        continue;
      }
      
      try {
        const quote = await this.executeProviderRequest(
          source,
          () => provider.random(),
          "random"
        );

        // Track analytics
        this.analyticsManager.updateAnalytics(quote);
        
        // Trigger prefetching in background
        this.prefetchQuotesInBackground();

        return quote;
      } catch (error) {
        // Continue to next provider - graceful degradation
        logDebug(`Provider ${source} failed, trying next`, {
          provider: source,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
    }

    // If all providers fail, try prefetched quote first (graceful degradation)
    const prefetched = this.getPrefetchedQuote();
    if (prefetched) {
      return prefetched;
    }

    // Final fallback to local quote - always succeeds
    const localQuote = this.getRandomQuote();
    this.updateAnalytics(localQuote, "view");
    return localQuote;
  }

  /**
   * Searches for quotes from a specific provider source
   *
   * Searches quotes using the specified provider with fallback to other providers
   * if the primary source fails. Returns quotes that match the search query.
   *
   * @param source - The provider source to search
   * @param query - The search query string
   * @returns Promise that resolves to array of matching quotes
   *
   * @example
   * ```typescript
   * const results = await quoteService.searchQuotes('Quotable', 'motivation');
   * ```
   */
  async searchQuotes(source: Source, query: string): Promise<Quote[]> {
    await this.ensureInitialized();

    const normalizedQuery = (query || "").trim().toLowerCase();

    // Try primary source first
    const primaryProvider = this.providers.find((p) => p.name === source);
    if (primaryProvider) {
      try {
        const list = await primaryProvider.search(normalizedQuery);
        if (list && list.length > 0) {
          return list;
        }
      } catch (error) {
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, query: normalizedQuery, operation: "searchQuotes" },
          "QuoteService",
        );
      }
    }

    // If primary fails or returns no results, try fallback chain
    const fallbackChain = this.quoteFetcher.getFallbackChain(source);
    for (const fallbackSource of fallbackChain) {
      const fallbackProvider = this.providers.find(
        (p) => p.name === fallbackSource,
      );
      if (fallbackProvider) {
        try {
          const list = await fallbackProvider.search(normalizedQuery);
          if (list && list.length > 0) {
            return list;
          }
        } catch (error) {
          logError(
            error instanceof Error ? error : new Error(String(error)),
            {
              source: fallbackSource,
              query: normalizedQuery,
              operation: "searchQuotes",
            },
            "QuoteService",
          );
          continue;
        }
      }
    }

    // Final fallback to local search
    return this.quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(normalizedQuery) ||
        quote.author?.toLowerCase().includes(normalizedQuery) ||
        quote.category?.toLowerCase().includes(normalizedQuery),
    );
  }

  getSourceWeights(): SourceWeights {
    return { ...this.sourceWeights };
  }

  updateSourceWeights(weights: Partial<SourceWeights>): void {
    this.sourceWeights = { ...this.sourceWeights, ...weights };
    this.storage.setSync("sourceWeights", this.sourceWeights);
  }

  // New Advanced API Features

  async getBulkQuotes(options: BulkQuoteOptions): Promise<Quote[]> {
    await this.ensureInitialized();

    const {
      count = 5,
      sources,
      categories,
      filters,
      includeLocal = false,
    } = options;
    const results: Quote[] = [];
    const usedSources = sources || [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
    ];

    if (includeLocal) {
      usedSources.push("DummyJSON");
    }

    // Get quotes from each source
    for (const source of usedSources) {
      if (results.length >= count) break;

      try {
        const startTime = Date.now();
        const quote = await this.randomFrom(source);
        const responseTime = Date.now() - startTime;

        // Apply filters
        if (this.matchesFilters(quote, filters)) {
          if (
            !categories ||
            (quote.category && categories.includes(quote.category))
          ) {
            results.push(quote);
            this.analyticsManager.updateAnalytics(quote);
            // Update performance metrics (health status is auto-updated)
            this.analyticsManager.updatePerformanceMetrics(source, true, responseTime);
          }
        }
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, false, responseTime);
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, operation: "getBulkQuotes" },
          "QuoteService",
        );
      }
    }

    // Fill remaining slots with local quotes if needed
    while (results.length < count && includeLocal) {
      const localQuote = this.getRandomQuote();
      if (this.matchesFilters(localQuote, filters)) {
        if (
          !categories ||
          (localQuote.category && categories.includes(localQuote.category))
        ) {
          results.push(localQuote);
          this.updateAnalytics(localQuote, "view");
        }
      }
    }

    return results.slice(0, count);
  }

  async advancedSearch(
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<QuoteSearchResult> {
    await this.ensureInitialized();

    const startTime = Date.now();
    const normalizedQuery = (query || "").trim().toLowerCase();
    const allResults: Quote[] = [];
    const usedSources: Source[] = [];

    // Search across all sources
    const sources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
    ];

    for (const source of sources) {
      try {
        const sourceStartTime = Date.now();
        const results = await this.searchQuotes(source, normalizedQuery);
        const responseTime = Date.now() - sourceStartTime;

        // Apply filters
        const filteredResults = results.filter((quote) =>
          this.matchesFilters(quote, filters),
        );
        allResults.push(...filteredResults);
        usedSources.push(source);

        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, false, responseTime);
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, operation: "advancedSearch" },
          "QuoteService",
        );
      }
    }

    // Add fallback search if no filters or filters allow fallback
    if (!filters?.source || filters.source === "DummyJSON") {
      const fallbackResults = this.quotes
        .filter(
          (quote) =>
            quote.text.toLowerCase().includes(normalizedQuery) ||
            (quote.author?.toLowerCase() ?? "").includes(normalizedQuery) ||
            (quote.category?.toLowerCase() ?? "").includes(normalizedQuery),
        )
        .filter((quote) => this.matchesFilters(quote, filters));

      allResults.push(...fallbackResults);
      usedSources.push("DummyJSON");
    }

    // Update search history
    if (normalizedQuery) {
      this.analyticsManager.updateSearchHistory(normalizedQuery);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return {
      quotes: paginatedResults,
      total: allResults.length,
      page,
      limit,
      hasMore: endIndex < allResults.length,
      sources: usedSources,
      searchTime: Date.now() - startTime,
    };
  }

  async getQuotesByCategory(
    category: string,
    limit: number = 10,
  ): Promise<Quote[]> {
    await this.ensureInitialized();

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
        const startTime = Date.now();
        const quotes = await this.searchQuotes(source, category);
        const responseTime = Date.now() - startTime;

        const categoryQuotes = quotes.filter((q) =>
          (q.category?.toLowerCase() ?? "").includes(category.toLowerCase()),
        );

        results.push(...categoryQuotes);
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, false, responseTime);
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, operation: "getQuotesByCategory" },
          "QuoteService",
        );
      }
    }

    // Add local category quotes
    const localCategoryQuotes = this.quotes.filter((q) =>
      (q.category?.toLowerCase() ?? "").includes(category.toLowerCase()),
    );
    results.push(...localCategoryQuotes);

    return results.slice(0, limit);
  }

  async getQuotesByAuthor(
    author: string,
    limit: number = 10,
  ): Promise<Quote[]> {
    await this.ensureInitialized();

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
        const startTime = Date.now();
        const quotes = await this.searchQuotes(source, author);
        const responseTime = Date.now() - startTime;

        const authorQuotes = quotes.filter((q) =>
          (q.author?.toLowerCase() ?? "").includes(author.toLowerCase()),
        );

        results.push(...authorQuotes);
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.analyticsManager.updatePerformanceMetrics(source, false, responseTime);
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, operation: "getQuotesByAuthor" },
          "QuoteService",
        );
      }
    }

    // Add local author quotes
    const localAuthorQuotes = this.quotes.filter((q) =>
      (q.author?.toLowerCase() ?? "").includes(author.toLowerCase()),
    );
    results.push(...localAuthorQuotes);

    return results.slice(0, limit);
  }

  async getQuoteRecommendations(
    quote: Quote,
    limit: number = 5,
  ): Promise<QuoteRecommendation[]> {
    await this.ensureInitialized();

    const recommendations: QuoteRecommendation[] = [];
    const allQuotes = [...this.quotes];

    // Get additional quotes from external sources
    const sources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
    ];
    for (const source of sources) {
      try {
        const externalQuote = await this.randomFrom(source);
        allQuotes.push(externalQuote);
      } catch (error) {
        // Continue with other sources
      }
    }

    // Find similar quotes based on category and author
    const similarQuotes = allQuotes.filter(
      (q) =>
        q.id !== quote.id &&
        (q.category === quote.category ||
          q.author === quote.author ||
          q.text.toLowerCase().includes(quote.category?.toLowerCase() ?? "") ||
          q.text.toLowerCase().includes(quote.author?.toLowerCase() ?? "")),
    );

    // Score and rank recommendations
    for (const similarQuote of similarQuotes.slice(0, limit * 2)) {
      let score = 0;
      let reason = "";

      if (similarQuote.category === quote.category) {
        score += 3;
        reason = "Same category";
      }
      if (similarQuote.author === quote.author) {
        score += 2;
        reason = "Same author";
      }
      if (similarQuote.source === quote.source) {
        score += 1;
        reason = "Same source";
      }

      if (score > 0) {
        recommendations.push({
          quote: similarQuote,
          score,
          reason,
          similarQuotes: similarQuotes
            .filter((q) => q.id !== similarQuote.id)
            .slice(0, 3),
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  getAnalytics(): QuoteAnalytics {
    return this.analyticsManager.getAnalytics();
  }

  getHealthStatus(): APIHealthStatus[] {
    return this.analyticsManager.getHealthStatus();
  }

  getPerformanceMetrics(): Record<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  > {
    return this.analyticsManager.getPerformanceMetrics();
  }

  async likeQuote(quoteId: string): Promise<boolean> {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (quote) {
      quote.isLiked = !quote.isLiked;
      await this.storage.set("quotes", this.quotes);
      this.analyticsManager.updateAnalytics(quote);
      return true;
    }
    return false;
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.clearAll();
  }

  private matchesFilters(quote: Quote, filters?: SearchFilters): boolean {
    if (!filters) return true;

    if (
      filters.category &&
      !(quote.category?.toLowerCase() ?? "").includes(
        filters.category.toLowerCase(),
      )
    ) {
      return false;
    }

    if (
      filters.author &&
      !(quote.author?.toLowerCase() ?? "").includes(
        filters.author.toLowerCase(),
      )
    ) {
      return false;
    }

    if (filters.minLength && quote.text.length < filters.minLength) {
      return false;
    }

    if (filters.maxLength && quote.text.length > filters.maxLength) {
      return false;
    }

    if (filters.source && quote.source !== filters.source) {
      return false;
    }

    if (filters.dateRange && quote.createdAt) {
      const quoteDate = new Date(quote.createdAt);
      if (
        quoteDate < filters.dateRange.start ||
        quoteDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  }

  private getQuoteIndexForDate(dateString: string): number {
    // Convert date string to a number for consistent quote selection
    const date = new Date(dateString);
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Use multiple factors to create more variety
    // Combine day of year, year, month, and day for better distribution
    // Added more factors to reduce cycling in small quote pools
    const combined = (dayOfYear * 7 + year * 3 + month * 5 + day * 11 + 
                     Math.floor(date.getTime() / (1000 * 60 * 60 * 24)) * 13) % 1000;
    return combined;
  }

  /**
   * Get recent quote history to avoid repetition
   * Improved to handle edge cases and ensure accurate filtering
   */
  private getRecentQuoteHistory(days: number): Quote[] {
    try {
      const history = this.storage.getSync("quoteHistory") || [];
      if (!Array.isArray(history) || history.length === 0) {
        return [];
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentEntries = history.filter((entry: any) => {
        if (!entry || !entry.date || !entry.quote) {
          return false;
        }
        try {
          const entryDate = new Date(entry.date);
          return entryDate >= cutoffDate && !isNaN(entryDate.getTime());
        } catch {
          return false;
        }
      });
      
      // Extract unique quotes (by ID) to avoid duplicates
      const quoteMap = new Map<string, Quote>();
      recentEntries.forEach((entry: any) => {
        if (entry.quote && entry.quote.id) {
          quoteMap.set(entry.quote.id, entry.quote);
        }
      });
      
      const uniqueQuotes = Array.from(quoteMap.values());
      logDebug(`Retrieved ${uniqueQuotes.length} unique quotes from last ${days} days`);
      
      return uniqueQuotes;
    } catch (error) {
      logDebug("Could not load quote history", { error });
      return [];
    }
  }

  /**
   * Update quote history to track shown quotes
   * Improved to prevent duplicates and better track repetition
   */
  private updateQuoteHistory(quote: Quote, date: string): void {
    try {
      const history = this.storage.getSync("quoteHistory") || [];
      
      // Remove any existing entry for this quote on this date (prevent duplicates)
      const filteredHistory = history.filter((entry: any) => {
        return !(entry.quote?.id === quote.id && entry.date === date);
      });
      
      // Add new entry
      filteredHistory.push({
        quote: quote,
        date: date,
        timestamp: Date.now()
      });
      
      // Keep only last 30 days of history
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      const finalHistory = filteredHistory.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
      
      this.storage.setSync("quoteHistory", finalHistory);
      
      logDebug(`Updated quote history: ${finalHistory.length} entries`, {
        quoteId: quote.id,
        date,
      });
    } catch (error) {
      logDebug("Could not update quote history", { error });
    }
  }

  getQuoteByCategory(category: string): Quote[] {
    return this.quotes.filter(
      (quote) => quote.category?.toLowerCase() === category.toLowerCase(),
    );
  }

  async saveQuote(quote: Omit<Quote, "id" | "createdAt">): Promise<Quote> {
    const newQuote: Quote = {
      ...quote,
      id: this.generateId(),
      createdAt: new Date(),
      isUserAdded: true,
    };

    this.quotes.push(newQuote);
    await this.storage.set("quotes", this.quotes);
    return newQuote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    const index = this.quotes.findIndex((q) => q.id === id);
    if (index !== -1) {
      this.quotes.splice(index, 1);
      await this.storage.set("quotes", this.quotes);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Analytics and Health Monitoring
  private loadAnalytics(): QuoteAnalytics {
    // Analytics is now managed by analyticsManager
    // This method is kept for backward compatibility
    return this.analyticsManager.getAnalytics();
  }

  /**
   * Check if a provider request is allowed (rate limiting + circuit breaker)
   */
  private isRateLimited(source: Source): boolean {
    // Check circuit breaker first
    if (this.isCircuitOpen(source)) {
      return true; // Circuit is open, treat as rate limited
    }
    
    // Check rate limiter
    return this.rateLimiter.isRateLimited(source);
  }
  
  /**
   * Check if provider is available (not rate limited, circuit not open, and healthy)
   */
  private isProviderAvailable(source: Source): boolean {
    // Check circuit breaker
    if (this.isCircuitOpen(source)) {
      return false;
    }
    
    // Check rate limiting
    if (this.isRateLimited(source)) {
      return false;
    }
    
    // Check health status
    if (!this.analyticsManager.isProviderHealthy(source)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Execute provider request with comprehensive error handling and metrics
   */
  private async executeProviderRequest<T>(
    source: Source,
    operation: () => Promise<T>,
    operationName: string = "request"
  ): Promise<T> {
    // Check availability before attempting
    if (!this.isProviderAvailable(source)) {
      if (this.isCircuitOpen(source)) {
        throw ErrorUtils.createNetworkError(
          `Circuit breaker is open for ${getProviderDisplayName(source)}. Please try again later.`,
          { source, operation: operationName }
        );
      }
      throw ErrorUtils.createRateLimitError(
        `Rate limit exceeded for ${getProviderDisplayName(source)}`,
        { source, operation: operationName }
      );
    }
    
    const startTime = Date.now();
    try {
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      // Record success
      this.recordSuccess(source);
      this.analyticsManager.updatePerformanceMetrics(source, true, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failure
      this.recordFailure(source);
      this.analyticsManager.updatePerformanceMetrics(source, false, responseTime);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === "rate_limited" || error.message.includes("rate")) {
          throw ErrorUtils.createRateLimitError(
            this.getRateLimitErrorMessage(source),
            { source, operation: operationName, originalError: error.message }
          );
        }
        
        if (error.message.includes("timeout") || error.message.includes("network") || error.message.includes("fetch")) {
          throw ErrorUtils.createNetworkError(
            `Network error fetching from ${getProviderDisplayName(source)}`,
            { source, operation: operationName, originalError: error.message }
          );
        }
      }
      
      // Re-throw with context
      throw errorHandler.createError(
        `Failed to ${operationName} from ${getProviderDisplayName(source)}`,
        "PROVIDER_ERROR",
        "api" as any,
        "medium" as any,
        { source, operation: operationName, originalError: error instanceof Error ? error.message : String(error) },
        true,
        `Unable to get quote from ${getProviderDisplayName(source)}. Trying another source...`
      );
    }
  }

  /**
   * Get user-friendly error message for rate limiting
   */
  private getRateLimitErrorMessage(source: Source): string {
    const providerName = getProviderDisplayName(source);
    return `Too many requests to ${providerName}. Please wait a moment and try again.`;
  }


  // Health monitoring, performance metrics, and provider prioritization
  // are now handled by analyticsManager
  
  /**
   * Cleanup resources when service is no longer needed
   * Call this when the service instance is being destroyed
   */
  public cleanup(): void {
    this.analyticsManager.stopHealthMonitoring();
    this.cacheManager.stopCleanup();
    this.prefetchQueue = [];
    this.prefetchInProgress = false;
    this.enrichmentInProgress = false;
    logDebug("QuoteService resources cleaned up");
  }

  /**
   * Enrich quote pool in background when pool is small
   * Tries to fetch quotes from APIs and cache them to expand the pool
   */
  private async enrichQuotePoolInBackground(): Promise<void> {
    // Don't enrich if already in progress
    if (this.enrichmentInProgress || this.prefetchInProgress) {
      return;
    }

    this.enrichmentInProgress = true;

    try {
      // Try to fetch quotes from multiple providers to enrich cache
      const providersToTry = this.providers.slice(0, 3); // Try first 3 providers
      const enrichmentPromises: Promise<Quote | null>[] = [];

      for (const provider of providersToTry) {
        const source = provider.name as Source;
        
        // Skip if not available
        if (!this.isProviderAvailable(source)) {
          continue;
        }

        const enrichmentPromise = provider.random()
          .then(async (quote) => {
            // Cache the quote to enrich the pool
            await this.cacheManager.addCachedApiQuote(quote);
            this.analyticsManager.updatePerformanceMetrics(source, true, 0);
            logDebug(`Enriched pool with quote from ${source}`);
            return quote;
          })
          .catch((error) => {
            this.analyticsManager.updatePerformanceMetrics(source, false, 0);
            logDebug(`Failed to enrich from ${source}`, { error });
            return null;
          });

        enrichmentPromises.push(enrichmentPromise);
      }

      // Wait for enrichment (with timeout)
      await Promise.race([
        Promise.allSettled(enrichmentPromises),
        new Promise((resolve) => setTimeout(resolve, 5000)) // 5 second timeout
      ]);

      logDebug("Quote pool enrichment completed");
    } catch (error) {
      logDebug("Error during quote pool enrichment", { error });
    } finally {
      this.enrichmentInProgress = false;
    }
  }

  /**
   * Prefetch quotes in background for faster subsequent loads
   * This runs asynchronously and doesn't block the main request
   */
  private async prefetchQuotesInBackground(): Promise<void> {
    // Prevent multiple prefetch operations
    if (this.prefetchInProgress) {
      return;
    }

    // Check if we need more quotes in the prefetch queue
    if (this.prefetchQueue.length >= QuoteService.CONFIG.PREFETCH_COUNT) {
      return;
    }

    // Wait a bit before prefetching to not interfere with current request
    setTimeout(async () => {
      if (this.prefetchInProgress) return;
      
      this.prefetchInProgress = true;
      
      try {
        const quotesNeeded = QuoteService.CONFIG.PREFETCH_COUNT - this.prefetchQueue.length;
        
        // Get working providers (not rate limited, not down)
        const workingProviders = this.providers.filter((provider) => {
          const source = provider.name as Source;
          const health = this.analyticsManager.getSourceHealthStatus(source);
          return (
            !this.isRateLimited(source) &&
            (!health || health.status !== "down")
          );
        });

        if (workingProviders.length === 0) {
          return;
        }

        // Prefetch quotes from different providers
        const prefetchPromises: Promise<Quote | null>[] = [];
        
        for (let i = 0; i < quotesNeeded && i < workingProviders.length; i++) {
          const provider = workingProviders[i % workingProviders.length];
          const source = provider.name as Source;

          // Prefetch with error handling (already filtered for availability)
          const prefetchPromise = provider.random()
            .then((quote) => {
              // Update performance metrics
              this.analyticsManager.updatePerformanceMetrics(source, true, 0);
              return quote;
            })
            .catch((error) => {
              // Update performance metrics on failure
              this.analyticsManager.updatePerformanceMetrics(source, false, 0);
              logDebug(`Prefetch failed for ${source}`, { error });
              return null;
            });

          prefetchPromises.push(prefetchPromise);
        }

        // Wait for all prefetch requests (with timeout)
        const results = await Promise.allSettled(
          prefetchPromises.map(p => 
            Promise.race([
              p,
              new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), QuoteService.CONFIG.PREFETCH_TIMEOUT_MS)
              )
            ])
          )
        );

        // Add successful prefetches to queue
        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            this.prefetchQueue.push(result.value);
          }
        }

        // Limit queue size
        if (this.prefetchQueue.length > QuoteService.CONFIG.MAX_PREFETCH_QUEUE_SIZE) {
          this.prefetchQueue = this.prefetchQueue.slice(0, QuoteService.CONFIG.PREFETCH_COUNT);
        }

        logDebug(`Prefetched ${this.prefetchQueue.length} quotes`);
      } catch (error) {
        logDebug("Error during prefetching", { error });
      } finally {
        this.prefetchInProgress = false;
      }
    }, QuoteService.CONFIG.PREFETCH_DELAY_MS);
  }

  /**
   * Get a prefetched quote if available
   */
  private getPrefetchedQuote(): Quote | null {
    if (this.prefetchQueue.length > 0) {
      const quote = this.prefetchQueue.shift()!;
      // Track analytics
      this.analyticsManager.updateAnalytics(quote);
      // Trigger new prefetch to maintain queue
      this.prefetchQuotesInBackground();
      return quote;
    }
    return null;
  }

  /**
   * Enhanced analytics tracking with more events
   * Now delegates to analyticsManager
   */
  private updateAnalytics(
    quote: Quote,
    operation: "view" | "like" | "search" | "prefetch" | "share" | "save",
  ): void {
    // Analytics is now managed by analyticsManager
    // For view operations, update analytics
    if (operation === "view" || operation === "like") {
      this.analyticsManager.updateAnalytics(quote);
    }
    
    // For search operations, update search history
    if (operation === "search") {
      const analytics = this.analyticsManager.getAnalytics();
      // Search history is handled separately in searchQuotes method
    }
  }

}
