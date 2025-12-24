// Custom hooks exports
export { useSearchState } from './useSearchState';
export { useAppState } from './useAppState';
export { useOnboarding } from './useOnboarding';
export { useTheme } from './useTheme';
export type { Theme } from './useTheme';

// Re-export types
export type {
  SearchFilters,
  SearchHistoryItem,
  SavedSearch,
  SearchAnalytics,
  SearchInsights,
  SmartRecommendation,
  RelatedContent,
} from './useSearchState';