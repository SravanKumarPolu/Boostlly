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
 *   maxCacheAge: 24 * 60 * 60 * 1000,
 *   categories: ["motivation", "success"]
 * });
 *
 * const todayQuote = await quoteService.getTodayQuote();
 * const randomQuote = await quoteService.getRandomQuote();
 * ```
 */
export class QuoteService {
  private storage: StorageService;
  private config: QuoteServiceConfig;
  private quotes: Quote[] = [];
  private providers: QuoteProvider[] = [];
  private apiCache: Map<string, { data: any; ts: number }> = new Map();
  private lastCallAt: Map<string, number> = new Map();
  // Cache of API-enriched quotes accumulated over days
  private cachedApiQuotes: Quote[] = [];

  // Default source weights (sum = 1, DummyJSON stays fallback-only)
  // Updated based on API reliability and quality analysis
  private defaultSourceWeights: SourceWeights = {
    ZenQuotes: 0.25, // Very reliable, daily + random endpoints, diverse
    Quotable: 0.2, // Large free database, no API key, inspirational tags
    FavQs: 0.15, // Daily curated QOTD, decent fallback
    QuoteGarden: 0.15, // Curated collection
    "Stoic Quotes": 0.15, // Stoic philosophy quotes
    "Programming Quotes": 0.1, // Programming and tech quotes
    "They Said So": 0.0, // Removed from rotation (can still be used as fallback)
    DummyJSON: 0.0, // Keep as FALLBACK ONLY for Mon-Sat API failures
  };

  private sourceWeights: SourceWeights;
  private analytics: QuoteAnalytics;
  private healthStatus: Map<Source, APIHealthStatus> = new Map();
  private performanceMetrics: Map<
    Source,
    { totalCalls: number; successCalls: number; avgResponseTime: number }
  > = new Map();

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
    if (!storage) {
      throw new Error("StorageService must be provided to QuoteService");
    }
    this.storage = storage;
    this.config = {
      cacheEnabled: true,
      maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
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

    // Note: loadQuotes() is now called lazily when needed, not during constructor
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
        this.config.cacheEnabled &&
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
      const today = new Date().toISOString().split("T")[0];
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

    // Get today's date as a string (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    // Dev-only diagnostics
    if (
      typeof window !== "undefined" &&
      (window as any)?.location?.search?.includes("force=1")
    ) {
      this.storage.setSync("dailyQuote", null);
      this.storage.setSync("dailyQuoteDate", null);
    }

    // Try to get the stored daily quote
    const storedDailyQuote = this.storage.getSync("dailyQuote");
    const storedDate = this.storage.getSync("dailyQuoteDate");

    // If we have a stored quote from today, check if it's from AI source
    if (storedDailyQuote && storedDate === today) {
      // If the cached quote has source "AI", treat as expired and fetch new
      if (storedDailyQuote.source === "AI") {
        this.storage.setSync("dailyQuote", null);
        this.storage.setSync("dailyQuoteDate", null);
      } else {
        return storedDailyQuote;
      }
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

    // Store the new daily quote and update history
    this.storage.setSync("dailyQuote", dailyQuote);
    this.storage.setSync("dailyQuoteDate", today);
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
    const today = new Date().toISOString().split("T")[0];
    try {
      if (!force) {
        const storedDailyQuote = this.storage.getSync("dailyQuote");
        const storedDate = this.storage.getSync("dailyQuoteDate");
        if (storedDailyQuote && storedDate === today) {
          return storedDailyQuote;
        }
      }
      // Choose a primary and use fallback chain
      const source = this.selectPrimarySource();
      const fallbackChain = [
        source,
        ...this.getFallbackChain(source),
      ] as Source[];
      for (const s of fallbackChain) {
        try {
          const q = await this.randomFrom(s);
          // Persist
          this.storage.setSync("dailyQuote", q);
          this.storage.setSync("dailyQuoteDate", today);
          return q;
        } catch (error) {
          logWarning(
            "Daily quote fetch failed for source, trying next",
            {
              source: s,
              error: error instanceof Error ? error.message : String(error),
            },
            "QuoteService",
          );
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
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = "dayBasedQuote";
    const cacheDateKey = "dayBasedQuoteDate";

    try {
      // Check cache first (unless force is true)
      if (!force) {
        const cachedQuote = this.storage.getSync(cacheKey);
        const cachedDate = this.storage.getSync(cacheDateKey);

        if (cachedQuote && cachedDate === today) {
          logDebug("Day-based quote: Using cached quote", {
            source: cachedQuote.source,
            date: today,
          });
          return cachedQuote;
        }
      }

      // Get today's assigned provider
      const todaysMapping = getTodaysProvider();
      const primaryProvider = todaysMapping.provider;

      logDebug("Day-based quote: Fetching from today's provider", {
        day: todaysMapping.dayName,
        provider: getProviderDisplayName(primaryProvider),
      });

      // Build fallback chain (excluding the primary since we'll try it first)
      const fallbackChain = getDayBasedFallbackChain(primaryProvider);
      const providersToTry = [primaryProvider, ...fallbackChain];

      // Try each provider in order
      for (const providerSource of providersToTry) {
        const provider = this.providers.find((p) => p.name === providerSource);

        if (!provider) {
          logDebug(
            `Day-based quote: Provider ${providerSource} not found, skipping`,
          );
          continue;
        }

        try {
          const quote = await provider.random();

          // Ensure the quote has proper source attribution
          const attributedQuote: Quote = {
            ...quote,
            source: providerSource,
          };

          // Cache the quote
          this.storage.setSync(cacheKey, attributedQuote);
          this.storage.setSync(cacheDateKey, today);

          logDebug("Day-based quote: Successfully fetched", {
            source: providerSource,
            isPrimary: providerSource === primaryProvider,
            quoteText: attributedQuote.text.substring(0, 50) + "...",
          });

          return attributedQuote;
        } catch (error) {
          logWarning(
            `Day-based quote: Provider ${providerSource} failed, trying next`,
            {
              provider: providerSource,
              error: error instanceof Error ? error.message : String(error),
            },
          );
          continue;
        }
      }

      // If all providers failed, fall back to local quote
      logWarning("Day-based quote: All providers failed, using local fallback");
      const fallbackQuote = this.getDailyQuote();

      // Cache the fallback
      this.storage.setSync(cacheKey, fallbackQuote);
      this.storage.setSync(cacheDateKey, today);

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
    const today = new Date().toISOString().split("T")[0];
    const storedDailyQuote = this.storage.getSync("dailyQuote");
    const storedDate = this.storage.getSync("dailyQuoteDate");

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

    // Try primary source first
    const primaryProvider = this.providers.find((p) => p.name === source);
    if (primaryProvider) {
      try {
        const q = await primaryProvider.random();
        return q;
      } catch (error) {
        logError(
          error instanceof Error ? error : new Error(String(error)),
          { source, operation: "randomFrom" },
          "QuoteService",
        );
      }
    }

    // If primary fails, try fallback chain
    const fallbackChain = this.getFallbackChain(source);
    for (const fallbackSource of fallbackChain) {
      const fallbackProvider = this.providers.find(
        (p) => p.name === fallbackSource,
      );
      if (fallbackProvider) {
        try {
          const q = await fallbackProvider.random();
          return q;
        } catch (error) {
          logError(
            error instanceof Error ? error : new Error(String(error)),
            { source: fallbackSource, operation: "randomFrom" },
            "QuoteService",
          );
          continue;
        }
      }
    }

    // Final fallback to local
    return this.getRandomQuote();
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

    // Try each provider until one succeeds
    for (const provider of sortedProviders) {
      try {
        const quote = await provider.random();

        // Update health status on success
        this.updateHealthStatus(provider.name as Source, "healthy");

        // Update performance metrics
        this.updatePerformanceMetrics(provider.name as Source, true, 0);

        return quote;
      } catch (error) {
        // Log error but continue to next provider
        logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            provider: provider.name,
            operation: "random",
          },
          "QuoteService",
        );

        // Update health status on failure
        this.updateHealthStatus(provider.name as Source, "down");

        // Update performance metrics
        this.updatePerformanceMetrics(provider.name as Source, false, 0);

        continue;
      }
    }

    // If all providers fail, return local quote
    return this.getRandomQuote();
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
            this.updateHealthStatus(source, "healthy");
            this.updatePerformanceMetrics(source, true, responseTime);
          }
        }
      } catch (error) {
        const responseTime = Date.now();
        this.updateHealthStatus(source, "down");
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

        this.updateHealthStatus(source, "healthy");
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        this.updateHealthStatus(source, "down");
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
        this.updateHealthStatus(source, "healthy");
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        this.updateHealthStatus(source, "down");
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
        this.updateHealthStatus(source, "healthy");
        this.updatePerformanceMetrics(source, true, responseTime);
      } catch (error) {
        const responseTime = Date.now();
        this.updateHealthStatus(source, "down");
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

  clearCache(): void {
    this.apiCache.clear();
    this.lastCallAt.clear();
    try {
      this.storage.setSync("apiCache", {});
      this.storage.setSync("apiLastCall", {});
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

  private updateAnalytics(
    quote: Quote,
    operation: "view" | "like" | "search",
  ): void {
    try {
      // Update total quotes
      this.analytics.totalQuotes++;

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

      // Update recently viewed
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

  private updateHealthStatus(
    source: Source,
    status: "healthy" | "degraded" | "down",
  ): void {
    const health = this.healthStatus.get(source);
    const metrics = this.performanceMetrics.get(source);

    if (health && metrics) {
      health.status = status;
      health.lastCheck = Date.now();
      health.errorCount = 0; // Reset error count on successful status
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
      metrics.avgResponseTime =
        (metrics.avgResponseTime * (metrics.totalCalls - 1) + responseTime) /
        metrics.totalCalls;
    }
  }

}
