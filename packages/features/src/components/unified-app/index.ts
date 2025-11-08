/**
 * Unified App Component Exports
 * 
 * This module provides a clean interface to the unified app functionality
 * while maintaining proper separation of concerns.
 * 
 * The main UnifiedApp component has been refactored from a 2395-line file
 * into smaller, maintainable modules:
 * - Hooks: useUnifiedAppState, useVoiceState, useTimeDate, useStorageSync
 * - Components: AppHeader, Navigation, TabContent, SavedTab, modals
 * - Utils: platform-utils, quote-actions, storage-utils
 */

export { UnifiedApp } from './UnifiedAppRefactored';
export type { UnifiedAppProps, Variant, SavedQuote, StorageLike } from './types';
