/**
 * Search components for Boostlly
 *
 * This module exports search-related components that provide
 * advanced search functionality with filtering, suggestions,
 * and voice commands.
 */

export { SearchInput } from "./SearchInput";
export { SearchFilters } from "./SearchFilters";
export { SearchResults } from "./SearchResults";
export { AdvancedSearchRefactored } from "./AdvancedSearchRefactored";

// Re-export types
export type {
  SearchFilters as SearchFiltersType,
  SearchFiltersProps,
} from "./SearchFilters";

export type { Quote as SearchQuote, SearchResultsProps } from "./SearchResults";
