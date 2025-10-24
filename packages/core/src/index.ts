// Core exports
export * from "./types";
export * from "./services/collection-service";
export * from "./services/social-ecosystem-service";
export * from "./services/quote-service";
export * from "./services/search-service";
export * from "./services/providers/base";
export * from "./services/providers/quotable";
export * from "./services/providers/zenquotes";
export * from "./services/providers/theysaidso";
export * from "./services/providers/favqs";
export * from "./services/providers/quotegarden";
export * from "./services/providers/stoic-quotes";
export * from "./services/providers/programming-quotes";
export * from "./services/providers/dummyjson";
export * from "./services/providers/local";
export * from "./services/providers/bundled";

// Utils
export * from "./utils/date-utils";
export * from "./utils/day-based-quotes";
export * from "./utils/background-theme";
export * from "./utils/bundled-backgrounds";
export * from "./utils/accessibility";
export * from "./utils/storage";
export * from "./utils/logger";
export * from "./utils/retry";
export * from "./utils/rateLimiter";
export * from "./utils/validate";
export * from "./utils/validation";
export * from "./utils/cryptoStore";
export * from "./utils/image-generator";
// Removed color-analysis exports

// Store
export * from "./utils/store";
export * from "./utils/profile.slice";
export * from "./utils/quotes.slice";
export * from "./utils/settings.slice";
export * from "./utils/streaks.slice";
export * from "./utils/useHydrated";

// Advanced Features
export { SmartCache } from "./utils/smart-cache";
export type { CacheItem, CachePrediction, CacheConfig } from "./utils/smart-cache";

// Export/Import features
export * from "./utils/export-import";

// API Integration
export { APIIntegrationManager } from "./services/api-integration";
export type { APIConfig, APIMetrics, APIResponse } from "./services/api-integration";

// Mobile Enhancements
export * from "./utils/mobile-enhancements";

// Hooks
export * from "./hooks/useAutoTheme";
export * from "./hooks/useSoundSettings";

// Sound System
export * from "./utils/sound-manager";

// Constants and Utilities
export * from "./constants";
export * from "./utils/cache-utils";
export * from "./utils/api-config";
export * from "./utils/performance-optimizer";

// Scalability Management
export * from "./utils/scalability-manager";
export * from "./utils/scalable-state-manager";
export * from "./utils/scalable-api-manager";
export * from "./utils/scalability-monitor";

// Refactored Services
export * from "./services/base-service";
export * from "./services/quote-service-refactored";
export * from "./utils/error-handler";
