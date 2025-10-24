// Search components exports
export { SearchContainer } from './SearchContainer';
export { SearchInput } from './SearchInput';
export { SearchFilters } from './SearchFilters';
export { SearchResults } from './SearchResults';
export { SearchHistory } from './SearchHistory';
export { SearchAnalytics } from './SearchAnalytics';

// Re-export the hook for external use
export { useSearchState } from '../../hooks/useSearchState';
export type {
  SearchFilters as SearchFiltersType,
  SearchHistoryItem,
  SavedSearch,
  SearchAnalytics as SearchAnalyticsType,
  SearchInsights,
  SmartRecommendation,
  RelatedContent,
} from '../../hooks/useSearchState';