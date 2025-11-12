/**
 * Quote Fetcher Module
 * 
 * Handles quote fetching from providers, including:
 * - Provider selection and fallback chains
 * - Daily quote enrichment
 * - Quote loading and initialization
 * - Timezone handling
 */

import type { Quote, Source, SourceWeights, QuoteServiceConfig } from "../types";
import type { QuoteProvider } from "./providers/base";
import { StorageService } from "@boostlly/platform";
import { logError, logWarning, logDebug } from "../utils/logger";
import { getRandomFallbackQuote } from "../utils/Boostlly";
import { getDateKey, type TimezoneMode } from "../utils/date-utils";
import {
  getTodaysProvider,
  getFallbackChain as getDayBasedFallbackChain,
} from "../utils/day-based-quotes";
import { SOURCE_WEIGHTS } from "../constants";

export interface QuoteFetcherConfig {
  cacheEnabled: boolean;
  maxCacheSize: number;
}

export class QuoteFetcher {
  private storage: StorageService;
  private providers: QuoteProvider[];
  private sourceWeights: SourceWeights;
  private config: QuoteFetcherConfig;
  private cachedApiQuotes: Quote[] = [];

  constructor(
    storage: StorageService,
    providers: QuoteProvider[],
    sourceWeights: SourceWeights,
    config: QuoteFetcherConfig
  ) {
    this.storage = storage;
    this.providers = providers;
    this.sourceWeights = sourceWeights;
    this.config = config;
    this.loadCachedApiQuotes();
  }

  /**
   * Load cached API quotes from storage
   */
  private loadCachedApiQuotes(): void {
    try {
      const persistedApiQuotes = this.storage.getSync<Quote[]>("quotes-cache");
      if (Array.isArray(persistedApiQuotes)) {
        this.cachedApiQuotes = persistedApiQuotes;
      }
    } catch (error) {
      logDebug("Could not load cached API quotes", { error });
    }
  }

  /**
   * Get cached API quotes
   */
  getCachedApiQuotes(): Quote[] {
    return [...this.cachedApiQuotes];
  }

  /**
   * Load quotes from storage or fetch new ones
   */
  async loadQuotes(): Promise<Quote[]> {
    try {
      const cached = await this.storage.get<Quote[]>("quotes");
      if (
        cached &&
        this.config.cacheEnabled &&
        Array.isArray(cached) &&
        cached.length > 0
      ) {
        return cached;
      } else {
        const fetched = await this.fetchQuotes();
        await this.storage.set("quotes", fetched);
        // Perform once-per-day enrichment in the background (non-blocking)
        this.maybeFetchOneDaily().catch(() => {});
        return fetched;
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "loadQuotes" },
        "QuoteFetcher",
      );
      // Keep Boostlly fallback quotes if loading fails
      return [getRandomFallbackQuote()];
    }
  }

  /**
   * Fetch quotes from providers
   */
  async fetchQuotes(): Promise<Quote[]> {
    // Try external provider, fallback to local
    try {
      const primarySource = this.selectPrimarySource();
      const primaryProvider = this.providers.find(
        (p) => p.name === primarySource,
      );

      if (primaryProvider) {
        const q = await primaryProvider.random();
        return [q, getRandomFallbackQuote()];
      } else {
        logWarning(
          "Primary provider not found, using local fallback",
          { primarySource },
          "QuoteFetcher",
        );
        return [getRandomFallbackQuote()];
      }
    } catch (error) {
      logWarning(
        "Failed to fetch remote quotes, using local fallback",
        { error: error instanceof Error ? error.message : String(error) },
        "QuoteFetcher",
      );
      return [getRandomFallbackQuote()];
    }
  }

  /**
   * Fetch one quote per day from API providers and cache locally (enrichment)
   */
  async maybeFetchOneDaily(): Promise<void> {
    try {
      // Only run in browser/runtime environments with storage
      const timezone = this.getTimezonePreference();
      const today = getDateKey(new Date(), timezone);
      const lastFetched = this.storage.getSync<string>("quotes-last-fetch");
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
        this.storage.setSync("quotes-last-fetch", today);
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
        
        // Limit cache size
        if (this.cachedApiQuotes.length > this.config.maxCacheSize) {
          this.cachedApiQuotes = this.cachedApiQuotes.slice(0, this.config.maxCacheSize);
        }
        
        await this.storage.set("quotes-cache", this.cachedApiQuotes);
      }

      this.storage.setSync("quotes-last-fetch", today);
    } catch (error) {
      logDebug("Error in daily quote enrichment", { error });
    }
  }

  /**
   * Select primary source based on source weights
   */
  selectPrimarySource(): Source {
    const weights = this.sourceWeights;
    const random = Math.random();
    let cumulative = 0;

    // Exclude DummyJSON from weighted selection (it's fallback-only)
    const sources: Source[] = [
      "ZenQuotes",
      "Quotable",
      "FavQs",
      "They Said So",
      "QuoteGarden",
      "Stoic Quotes",
      "Programming Quotes",
    ];

    for (const source of sources) {
      cumulative += weights[source] || 0;
      if (random <= cumulative) {
        return source;
      }
    }

    // Fallback to first source if weights don't sum correctly
    return sources[0] || "ZenQuotes";
  }

  /**
   * Get fallback chain for a primary source
   */
  getFallbackChain(primarySource: Source): Source[] {
    // Use day-based fallback chain, but exclude the primary source
    const dayBasedChain = getDayBasedFallbackChain(primarySource);
    return dayBasedChain.filter((source) => source !== primarySource);
  }

  /**
   * Get timezone preference from storage
   */
  getTimezonePreference(): TimezoneMode {
    try {
      // Try to get from settings
      interface SettingsWithTimezone {
        timezone?: string;
        [key: string]: unknown;
      }
      const settings = this.storage.getSync<SettingsWithTimezone>("settings");
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
      const timezonePref = this.storage.getSync<TimezoneMode>("quoteTimezone");
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
   * Ensure quotes are initialized
   */
  async ensureInitialized(quotes: Quote[]): Promise<Quote[]> {
    // Check if we're in a build environment (no internet access)
    if (
      typeof window === "undefined" &&
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      // In build environment, just use Boostlly fallback quotes
      return [getRandomFallbackQuote()];
    }

    try {
      if (quotes.length === 0) {
        return await this.loadQuotes();
      }
      return quotes;
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: "ensureInitialized" },
        "QuoteFetcher",
      );
      // Keep Boostlly fallback quotes if initialization fails
      return [getRandomFallbackQuote()];
    }
  }
}

