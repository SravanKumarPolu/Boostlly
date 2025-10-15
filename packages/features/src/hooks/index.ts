/**
 * Custom hooks for Boostlly features
 *
 * This module exports reusable custom hooks that provide common functionality
 * for components across the application.
 */

export { useSearchState } from "./useSearchState";
export { useVoiceCommands } from "./useVoiceCommands";
export { useQuoteActions } from "./useQuoteActions";
export {
  useLocalStorage,
  useLocalStorageArray,
  useLocalStorageObject,
} from "./useLocalStorage";

// Re-export types for convenience
export type {
  // Search types
  SearchHistoryItem,
  SavedSearch,
  SearchAnalytics,
  SearchFilters,
} from "./useSearchState";

export type {
  // Voice command types
  VoiceCommandConfig,
  VoiceCommandResult,
  VoiceCommandHandler,
  VoiceStatus,
} from "./useVoiceCommands";

export type {
  // Quote action types
  QuoteActionCallbacks,
  QuoteActionState,
} from "./useQuoteActions";
