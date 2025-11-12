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
  private apiCache: Map<string, { data: any; ts: number }> = new Map();
  private lastCallAt: Map<string, number> = new Map();
  // Cache of API-enriched quotes accumulated over days
  private cachedApiQuotes: Quote[] = [];

  // Default source weights (sum = 1, DummyJSON stays fallback-only)
  // Updated based on API reliability and quality analysis
  private defaultSourceWeights: SourceWeights = SOURCE_WEIGHTS;

  private sourceWeights: SourceWeights;
  private analytics: QuoteAnalytics;
  private healthStatus: Map<Source, APIHealthStatus> = new Map();
  private performanceMetrics: Map<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  > = new Map();
  private healthCheckInterval: number | null = null;
  
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
  private rateLimiters: Map<Source, () => boolean> = new Map();
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
  
  // Circuit breaker for providers (prevents cascading failures)
  private circuitBreakers: Map<Source, {
    failures: number;
    lastFailureTime: number;
    state: 'closed' | 'open' | 'half-open';
  }> = new Map();
  
  // Cleanup interval for resource management
  private cleanupInterval: number | null = null;

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

    // Initialize analytics
    this.analytics = this.loadAnalytics();

    // Initialize health status
    this.initializeHealthStatus();
    
    // Initialize rate limiters for each provider
    this.initializeRateLimiters();

    // Load API cache from storage (best-effort)
    try {
      const persisted: Record<string, { data: any; ts: number }> | null = (
        this.storage.getSync as any
      )?.("apiCache");
      if (persisted && typeof persisted === "object") {
        for (const [k, v] of Object.entries(persisted)) {
          if (v && typeof v.ts === "number") this.apiCache.set(k, v);
        }
      }
      const lastCalls: Record<string, number> | null = (
        this.storage.getSync as any
      )?.("apiLastCall");
      if (lastCalls && typeof lastCalls === "object") {
        for (const [k, v] of Object.entries(lastCalls)) {
          if (typeof v === "number") this.lastCallAt.set(k, v);
        }
      }
      // Load previously cached API quotes (daily enrichment pool)
      const persistedApiQuotes = (
        this.storage.getSync as any
      )?.("quotes-cache");
      if (Array.isArray(persistedApiQuotes)) {
        this.cachedApiQuotes = persistedApiQuotes as Quote[];
      }
    } catch {}

    // Migrate old cache keys to unified cache keys
    this.migrateCacheKeys();

    // Start health monitoring (enabled by default in BaseService config)
    // Health monitoring runs in browser environments only
    if (typeof window !== "undefined") {
      this.startHealthMonitoring();
      this.startResourceCleanup();
    }

    // Initialize circuit breakers
    this.initializeCircuitBreakers();

    // Note: loadQuotes() is now called lazily when needed, not during constructor
  }
  
  /**
   * Initialize circuit breakers for all providers
   */
  private initializeCircuitBreakers(): void {
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
    
    sources.forEach((source) => {
      this.circuitBreakers.set(source, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      });
    });
  }
  
  /**
   * Check if circuit breaker is open for a provider
   */
  private isCircuitOpen(source: Source): boolean {
    const breaker = this.circuitBreakers.get(source);
    if (!breaker) return false;
    
    if (breaker.state === 'open') {
      // Check if we should transition to half-open
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      if (timeSinceLastFailure >= QuoteService.CONFIG.CIRCUIT_BREAKER_RESET_TIMEOUT_MS) {
        breaker.state = 'half-open';
        return false; // Allow one attempt
      }
      return true; // Circuit is open, block requests
    }
    
    return false; // Circuit is closed or half-open, allow requests
  }
  
  /**
   * Record a successful request (reset circuit breaker)
   */
  private recordSuccess(source: Source): void {
    const breaker = this.circuitBreakers.get(source);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }
  
  /**
   * Record a failure (may open circuit breaker)
   */
  private recordFailure(source: Source): void {
    const breaker = this.circuitBreakers.get(source);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failures >= QuoteService.CONFIG.CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
        breaker.state = 'open';
        logWarning(
          `Circuit breaker opened for ${source} after ${breaker.failures} failures`,
          { source, failures: breaker.failures },
          "QuoteService",
        );
      }
    }
  }
  
  /**
   * Start periodic resource cleanup
   */
  private startResourceCleanup(): void {
    if (typeof window === "undefined") return;
    
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = window.setInterval(() => {
      this.performResourceCleanup();
    }, QuoteService.CONFIG.CLEANUP_INTERVAL_MS);
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
      
      // Limit cached API quotes
      if (this.cachedApiQuotes.length > QuoteService.CONFIG.MAX_CACHE_SIZE) {
        this.cachedApiQuotes = this.cachedApiQuotes.slice(0, QuoteService.CONFIG.MAX_CACHE_SIZE);
        logDebug("Cleaned up cached API quotes", { 
          previousSize: this.cachedApiQuotes.length + QuoteService.CONFIG.MAX_CACHE_SIZE,
          newSize: this.cachedApiQuotes.length 
        });
      }
      
      // Clean up old API cache entries
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      for (const [key, value] of this.apiCache.entries()) {
        if (now - value.ts > maxAge) {
          this.apiCache.delete(key);
        }
      }
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

  private selectPrimarySource(): Source {
    // Weighted random selection from APIs
    // Updated order based on new priority distribution
    const apiSources: Source[] = [
      "ZenQuotes", // 25% - Very reliable, daily + random endpoints, diverse
      "Quotable", // 20% - Large free database, no API key, inspirational tags
      "FavQs", // 15% - Daily curated QOTD, decent fallback
      "QuoteGarden", // 15% - Curated collection
      "Stoic Quotes", // 15% - Stoic philosophy quotes
      "Programming Quotes", // 10% - Programming and tech quotes
    ];
    const weights = apiSources.map((source) => this.sourceWeights[source]);

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < apiSources.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return apiSources[i];
      }
    }

    return apiSources[0]; // Fallback
  }

  private getFallbackChain(primarySource: Source): Source[] {
    // Updated fallback chain based on new priority
    const fallbackOrder: Source[] = [
      "DummyJSON", // PRIMARY FALLBACK for all Mon-Sat API failures
      "ZenQuotes", // 25% - Very reliable, daily + random endpoints, diverse
      "Quotable", // 20% - Large free database, no API key, inspirational tags
      "FavQs", // 15% - Daily curated QOTD, decent fallback
      "QuoteGarden", // 15% - Curated collection
      "Stoic Quotes", // 15% - Stoic philosophy quotes
      "Programming Quotes", // 10% - Programming and tech quotes
      "They Said So", // Additional fallback option
    ];
    const primaryIndex = fallbackOrder.indexOf(primarySource);

    // Return fallback chain starting after primary source
    return fallbackOrder.slice(primaryIndex + 1);
  }

  private async ensureInitialized(): Promise<void> {
    // Check if we're in a build environment (no internet access)
    if (
      typeof window === "undefined" &&
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      // In build environment, just use Boostlly fallback quotes
      this.quotes = [getRandomFallbackQuote()];
      return;
    }

    try {
      await this.loadQuotes();
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "ensureInitialized" },
        "QuoteService",
      );
      // Keep Boostlly fallback quotes if initialization fails
      this.quotes = [getRandomFallbackQuote()];
    }
  }

  /**
   * Loads quotes from storage and initializes the service
   *
   * This method loads cached quotes from storage and attempts to fetch fresh quotes
   * from providers. If no cached quotes exist, it will try to fetch from the primary
   * provider with fallback to other providers.
   *
   * @returns Promise that resolves when quotes are loaded
   *
   * @example
   * ```typescript
   * await quoteService.loadQuotes();
   * ```
   */
  async loadQuotes(): Promise<void> {
    try {
      const cached = await this.storage.get("quotes");
      if (
        cached &&
        this.quoteConfig.cacheEnabled &&
        Array.isArray(cached) &&
        cached.length > 0
      ) {
        this.quotes = cached;
      } else {
        await this.fetchQuotes();
      }
      // Perform once-per-day enrichment in the background (non-blocking)
      this.maybeFetchOneDaily().catch(() => {});
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadQuotes" },
        "QuoteService",
      );
      // Keep Boostlly fallback quotes if loading fails
      this.quotes = [getRandomFallbackQuote()];
    }
  }

  private async fetchQuotes(): Promise<void> {
    // Try external provider, fallback to local
    try {
      const primarySource = this.selectPrimarySource();
      const primaryProvider = this.providers.find(
        (p) => p.name === primarySource,
      );

      if (primaryProvider) {
        const q = await primaryProvider.random();
        this.quotes = [q, getRandomFallbackQuote()];
      } else {
        logWarning(
          "Primary provider not found, using local fallback",
          { primarySource },
          "QuoteService",
        );
        this.quotes = [getRandomFallbackQuote()];
      }
    } catch (error) {
      logWarning(
        "Failed to fetch remote quotes, using local fallback",
        { error: error instanceof Error ? error.message : String(error) },
        "QuoteService",
      );
      this.quotes = [getRandomFallbackQuote()];
    }
    await this.storage.set("quotes", this.quotes);
  }

  /**
   * Fetch one quote per day from API providers and cache locally (enrichment)
   * - Dedupes against existing cached API quotes by stable id/text+author
   * - Stores in storage key `quotes-cache` and marks `quotes-last-fetch` as YYYY-MM-DD
   */
  private async maybeFetchOneDaily(): Promise<void> {
    try {
      // Only run in browser/runtime environments with storage
      const timezone = this.getTimezonePreference();
      const today = getDateKey(new Date(), timezone);
      const lastFetched = (this.storage.getSync as any)?.("quotes-last-fetch");
      if (lastFetched === today) return;

      // Try primary providers quickly; fall back to local if needed, but only cache API ones
      const primarySource = this.selectPrimarySource();
      const tryOrder: Source[] = [primarySource, ...this.getFallbackChain(primarySource)];
      let fetched: Quote | null = null;
      for (const source of tryOrder) {
        if (source === "DummyJSON") continue; // skip local fallback for enrichment
        const provider = this.providers.find((p) => p.name === source);
        if (!provider) continue;
        try {
          const q = await provider.random();
          if (q) {
            fetched = q;
            break;
          }
        } catch {}
      }

      if (!fetched) {
        // Nothing to cache today
        (this.storage.setSync as any)?.("quotes-last-fetch", today);
        return;
      }

      // Deduplicate by id if present, else by text|author signature
      const signature = (q: Quote) => `${q.id ?? ""}|${(q.text || "").trim()}|${(q.author || "").trim()}`;

      const current: Quote[] = Array.isArray(this.cachedApiQuotes)
        ? this.cachedApiQuotes
        : [];
      const exists = current.some((q) => signature(q) === signature(fetched!));
      if (!exists) {
        current.push(fetched);
        this.cachedApiQuotes = current;
        await this.storage.set("quotes-cache", current);
      }

      (this.storage.setSync as any)?.("quotes-last-fetch", today);
    } catch {}
  }

  /**
   * Get timezone preference from storage
   * Supports "local", "utc", or IANA timezone string
   */
  private getTimezonePreference(): TimezoneMode {
    try {
      // Try to get from settings
      const settings = this.storage.getSync("settings") as any;
      if (settings?.timezone) {
        const tz = settings.timezone;
        // Convert IANA timezone to our format, or use as-is if it's "utc" or "local"
        if (tz === "UTC" || tz.toLowerCase() === "utc") {
          return "utc";
        }
        // If it's a valid IANA timezone string, use it
        if (typeof tz === "string" && tz.length > 0) {
          return tz;
        }
      }
      // Check for explicit timezone preference
      const timezonePref = this.storage.getSync("quoteTimezone") as TimezoneMode | null;
      if (timezonePref) {
        return timezonePref;
      }
    } catch (error) {
      logDebug("Could not get timezone preference, using local", { error });
    }
    // Default to local timezone for backward compatibility
    return "local";
  }

  /**
   * Migrate old cache keys to unified cache keys
   * This ensures backward compatibility while using the new unified system
   */
  private migrateCacheKeys(): void {
    try {
      // Check if we have old dayBasedQuote cache
      const oldDayBasedQuote = this.storage.getSync("dayBasedQuote");
      const oldDayBasedQuoteDate = this.storage.getSync("dayBasedQuoteDate");
      
      // If we have old cache but no new cache, migrate it
      const unifiedQuote = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE);
      const unifiedDate = this.storage.getSync(CACHE_KEYS.DAILY_QUOTE_DATE);
      
      if (oldDayBasedQuote && oldDayBasedQuoteDate && !unifiedQuote) {
        // Migrate old cache to new unified cache
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE, oldDayBasedQuote);
        this.storage.setSync(CACHE_KEYS.DAILY_QUOTE_DATE, oldDayBasedQuoteDate);
        logDebug("Migrated dayBasedQuote cache to unified dailyQuote cache");
      }
      
      // Clean up old cache keys after migration (optional, can be done later)
      // this.storage.setSync("dayBasedQuote", null);
      // this.storage.setSync("dayBasedQuoteDate", null);
    } catch (error) {
      logDebug("Error during cache key migration", { error });
    }
  }

  getDailyQuote(): Quote {
    // Always ensure we have at least one quote
    if (this.quotes.length === 0) {
      this.quotes = [getRandomFallbackQuote()];
    }

    // Include custom saved quotes from storage
    // Merge shipped/local quotes with cached API enrichment pool
    let allQuotes = [...this.quotes, ...this.cachedApiQuotes];
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

    // Get timezone preference and today's date key
    const timezone = this.getTimezonePreference();
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

    // Otherwise, select a new daily quote based on today's date
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
    const timezone = this.getTimezonePreference();
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
      const source = this.selectPrimarySource();
      const fallbackChain = [
        source,
        ...this.getFallbackChain(source),
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
    const timezone = this.getTimezonePreference();
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
      const providersToTry = this.prioritizeProvidersByHealth([primaryProvider, ...fallbackChain]);

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
    const timezone = this.getTimezonePreference();
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
    const fallbackChain = this.getFallbackChain(source);
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
      const health = this.healthStatus.get(provider.name as Source);
      return !health || health.status !== "down";
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
        this.updateAnalytics(quote, "view");
        
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
    const fallbackChain = this.getFallbackChain(source);
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
            this.updateAnalytics(quote, "view");
            // Update performance metrics (health status is auto-updated)
            this.updatePerformanceMetrics(source, true, responseTime);
          }
        }
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.updatePerformanceMetrics(source, false, responseTime);
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
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.updatePerformanceMetrics(source, false, responseTime);
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
      this.analytics.searchHistory.unshift(normalizedQuery);
      this.analytics.searchHistory = this.analytics.searchHistory.slice(0, 20); // Keep last 20 searches
      this.storage.setSync("quoteAnalytics", this.analytics);
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
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.updatePerformanceMetrics(source, false, responseTime);
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
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        // Update performance metrics (health status is auto-updated)
        this.updatePerformanceMetrics(source, false, responseTime);
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
    return { ...this.analytics };
  }

  getHealthStatus(): APIHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  getPerformanceMetrics(): Record<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  > {
    const result: Record<
      Source,
      { totalCalls: number; successCalls: number; avgResponseTime: number }
    > = {} as any;
    this.performanceMetrics.forEach((metrics, source) => {
      result[source] = { ...metrics };
    });
    return result;
  }

  async likeQuote(quoteId: string): Promise<boolean> {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (quote) {
      quote.isLiked = !quote.isLiked;
      await this.storage.set("quotes", this.quotes);
      this.updateAnalytics(quote, "like");
      return true;
    }
    return false;
  }

  async clearCache(): Promise<void> {
    this.apiCache.clear();
    this.lastCallAt.clear();
    try {
      await this.storage.set("apiCache", {});
      await this.storage.set("apiLastCall", {});
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "clearCache" },
        "QuoteService",
      );
    }
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
   */
  private getRecentQuoteHistory(days: number): Quote[] {
    try {
      const history = this.storage.getSync("quoteHistory") || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return history.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      }).map((entry: any) => entry.quote);
    } catch (error) {
      logDebug("Could not load quote history", { error });
      return [];
    }
  }

  /**
   * Update quote history to track shown quotes
   */
  private updateQuoteHistory(quote: Quote, date: string): void {
    try {
      const history = this.storage.getSync("quoteHistory") || [];
      
      // Add new entry
      history.push({
        quote: quote,
        date: date,
        timestamp: Date.now()
      });
      
      // Keep only last 30 days of history
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      const filteredHistory = history.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
      
      this.storage.setSync("quoteHistory", filteredHistory);
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
    try {
      const stored = this.storage.getSync(
        "quoteAnalytics",
      ) as QuoteAnalytics | null;
      if (stored && typeof stored === "object") {
        return stored;
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadAnalytics" },
        "QuoteService",
      );
    }

    return {
      totalQuotes: 0,
      sourceDistribution: {
        ZenQuotes: 0,
        Quotable: 0,
        FavQs: 0,
        "They Said So": 0,
        QuoteGarden: 0,
        "Stoic Quotes": 0,
        "Programming Quotes": 0,
        DummyJSON: 0,
      },
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
    sources.forEach((source) => {
      this.healthStatus.set(source, {
        source,
        status: "healthy",
        responseTime: 0,
        successRate: 100,
        lastCheck: Date.now(),
        errorCount: 0,
      });
      this.performanceMetrics.set(source, {
        totalCalls: 0,
        successCalls: 0,
        avgResponseTime: 0,
      });
    });
  }

  /**
   * Initialize rate limiters for each provider
   */
  private initializeRateLimiters(): void {
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
    
    sources.forEach((source) => {
      const config = this.RATE_LIMIT_CONFIG[source] || { capacity: 3, refillPerMin: 6 };
      this.rateLimiters.set(source, createLimiter(config));
    });
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
    const limiter = this.rateLimiters.get(source);
    if (!limiter) return false; // No limiter = allow
    
    return !limiter(); // Return true if rate limited (not allowed)
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
    const health = this.healthStatus.get(source);
    if (health && health.status === "down") {
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
      this.updatePerformanceMetrics(source, true, responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failure
      this.recordFailure(source);
      this.updatePerformanceMetrics(source, false, responseTime);
      
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


  /**
   * Update health status based on performance metrics
   * Automatically determines status based on success rate
   */
  private updateHealthStatus(
    source: Source,
    status?: "healthy" | "degraded" | "down",
  ): void {
    const health = this.healthStatus.get(source);
    const metrics = this.performanceMetrics.get(source);

    if (health && metrics) {
      // Calculate success rate
      const successRate = metrics.totalCalls > 0
        ? metrics.successCalls / metrics.totalCalls
        : 1.0;

      // Auto-determine status if not provided
      if (!status) {
        if (successRate >= QuoteService.CONFIG.HEALTH_DEGRADED_THRESHOLD) {
          status = "healthy";
        } else if (successRate >= QuoteService.CONFIG.HEALTH_DOWN_THRESHOLD) {
          status = "degraded";
        } else {
          status = "down";
        }
      }

      health.status = status;
      health.lastCheck = Date.now();
      health.responseTime = metrics.avgResponseTime;
      health.successRate = successRate;
      
      // Update error count based on failures
      if (status === "down") {
        health.errorCount = metrics.totalCalls - metrics.successCalls;
      } else if (status === "healthy") {
        // Reset error count when healthy
        health.errorCount = 0;
      }
    }
  }

  private updatePerformanceMetrics(
    source: Source,
    success: boolean,
    responseTime: number,
  ): void {
    const metrics = this.performanceMetrics.get(source);
    if (metrics) {
      metrics.totalCalls++;
      if (success) {
        metrics.successCalls++;
      }
      // Calculate weighted average response time
      metrics.avgResponseTime =
        (metrics.avgResponseTime * (metrics.totalCalls - 1) + responseTime) /
        metrics.totalCalls;
      
      // Update health status based on new metrics
      this.updateHealthStatus(source);
    }
  }

  /**
   * Prioritize providers by health status
   * Healthy providers are tried first, then degraded, then down
   */
  private prioritizeProvidersByHealth(providers: Source[]): Source[] {
    return [...providers].sort((a, b) => {
      const healthA = this.healthStatus.get(a);
      const healthB = this.healthStatus.get(b);
      
      if (!healthA && !healthB) return 0;
      if (!healthA) return 1;
      if (!healthB) return -1;
      
      // Priority: healthy > degraded > down
      const statusPriority: Record<string, number> = {
        healthy: 3,
        degraded: 2,
        down: 1,
      };
      
      const priorityA = statusPriority[healthA.status] || 0;
      const priorityB = statusPriority[healthB.status] || 0;
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      
      // If same status, prefer higher success rate
      return healthB.successRate - healthA.successRate;
    });
  }

  /**
   * Start periodic health monitoring
   * Performs health checks on all providers at regular intervals
   */
  private startHealthMonitoring(): void {
    if (typeof window === "undefined") {
      // Skip in non-browser environments
      return;
    }

    // Clear any existing interval
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
    }

    // Perform initial health check
    this.performHealthCheck().catch((error) => {
      logDebug("Initial health check failed", { error });
    });

    // Set up periodic health checks
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck().catch((error) => {
        logDebug("Periodic health check failed", { error });
      });
    }, QuoteService.CONFIG.HEALTH_CHECK_INTERVAL_MS);
  }

  /**
   * Perform health check on all providers
   * Tests each provider with a lightweight request
   */
  private async performHealthCheck(): Promise<void> {
    const providersToCheck = Array.from(this.healthStatus.keys());
    
    // Check providers in parallel with timeout
    const healthCheckPromises = providersToCheck.map(async (source) => {
      const provider = this.providers.find((p) => p.name === source);
      if (!provider) return;

      try {
        const startTime = Date.now();
        // Use a timeout for health checks (shorter than normal requests)
        const healthCheckPromise = provider.random();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), 5000)
        );

        await Promise.race([healthCheckPromise, timeoutPromise]);
        const responseTime = Date.now() - startTime;

        // Update metrics for successful health check
        this.updatePerformanceMetrics(source, true, responseTime);
        logDebug(`Health check passed for ${source}`, {
          source,
          responseTime,
        });
      } catch (error) {
        // Update metrics for failed health check
        this.updatePerformanceMetrics(source, false, 0);
        logDebug(`Health check failed for ${source}`, {
          source,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Stop health monitoring and cleanup resources
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval !== null && typeof window !== "undefined") {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Also stop cleanup interval
    if (this.cleanupInterval !== null && typeof window !== "undefined") {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Cleanup resources when service is no longer needed
   * Call this when the service instance is being destroyed
   */
  public cleanup(): void {
    this.stopHealthMonitoring();
    this.prefetchQueue = [];
    this.prefetchInProgress = false;
    this.apiCache.clear();
    this.lastCallAt.clear();
    logDebug("QuoteService resources cleaned up");
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
          const health = this.healthStatus.get(source);
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
              this.updatePerformanceMetrics(source, true, 0);
              return quote;
            })
            .catch((error) => {
              // Update performance metrics on failure
              this.updatePerformanceMetrics(source, false, 0);
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
      this.updateAnalytics(quote, "view");
      // Trigger new prefetch to maintain queue
      this.prefetchQuotesInBackground();
      return quote;
    }
    return null;
  }

  /**
   * Enhanced analytics tracking with more events
   */
  private updateAnalytics(
    quote: Quote,
    operation: "view" | "like" | "search" | "prefetch" | "share" | "save",
  ): void {
    try {
      // Update total quotes (only for views, not prefetches)
      if (operation === "view") {
      this.analytics.totalQuotes++;
      }

      // Update source distribution
      if (quote.source) {
        const source = quote.source as Source;
        this.analytics.sourceDistribution[source] =
          (this.analytics.sourceDistribution[source] || 0) + 1;
      }

      // Update category distribution
      if (quote.category) {
        this.analytics.categoryDistribution[quote.category] =
          (this.analytics.categoryDistribution[quote.category] || 0) + 1;
      }

      // Update recently viewed (only for actual views)
      if (operation === "view") {
        this.analytics.recentlyViewed.unshift(quote);
        this.analytics.recentlyViewed = this.analytics.recentlyViewed.slice(
          0,
          10,
        ); // Keep last 10
      }

      // Update most liked
      if (operation === "like" && quote.isLiked) {
        this.analytics.mostLikedQuotes.push(quote);
        this.analytics.mostLikedQuotes = this.analytics.mostLikedQuotes.slice(
          0,
          10,
        ); // Keep top 10
      }

      // Save analytics
      this.storage.setSync("quoteAnalytics", this.analytics);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "updateAnalytics" },
        "QuoteService",
      );
    }
  }

}
