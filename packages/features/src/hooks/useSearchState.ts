import { useState, useEffect, useCallback, useMemo } from "react";
import { SearchService, logError, logDebug, logWarning } from "@boostlly/core";

/**
 * Interface for search history items
 */
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

/**
 * Interface for saved searches
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    author: string;
    category: string;
    collection: string;
    isLiked: boolean | undefined;
  };
  createdAt: number;
  useCount: number;
}

/**
 * Interface for search analytics
 */
export interface SearchAnalytics {
  popularSearches: { query: string; count: number }[];
  popularAuthors: { author: string; count: number }[];
  popularCategories: { category: string; count: number }[];
  totalSearches: number;
  averageResults: number;
}

/**
 * Interface for search filters
 */
export interface SearchFilters {
  author: string;
  category: string;
  collection: string;
  isLiked: boolean | undefined;
}

/**
 * Custom hook for managing search state and functionality
 *
 * @param savedQuotes - Array of saved quotes to search through
 * @param collections - Array of collections to search through
 * @returns Object containing search state and methods
 *
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   suggestions,
 *   searchHistory,
 *   performSearch,
 *   saveSearch,
 *   clearHistory
 * } = useSearchState(savedQuotes, collections);
 * ```
 */
export function useSearchState(savedQuotes: any[], collections: any[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics>({
    popularSearches: [],
    popularAuthors: [],
    popularCategories: [],
    totalSearches: 0,
    averageResults: 0,
  });
  const [filters, setFilters] = useState<SearchFilters>({
    author: "",
    category: "",
    collection: "",
    isLiked: undefined,
  });

  // Initialize search service
  const searchService = useMemo(
    () => new SearchService(collections),
    [collections],
  );

  // Update search service data when quotes or collections change
  useEffect(() => {
    searchService.updateData(savedQuotes, collections);
  }, [savedQuotes, collections, searchService]);

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const newSuggestions = searchService.getSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, searchService]);

  // Load search data from localStorage
  const loadSearchData = useCallback(() => {
    try {
      const history = localStorage.getItem("boostlly-search-history");
      const saved = localStorage.getItem("boostlly-saved-searches");
      const analytics = localStorage.getItem("boostlly-search-analytics");

      if (history) setSearchHistory(JSON.parse(history));
      if (saved) setSavedSearches(JSON.parse(saved));
      if (analytics) setSearchAnalytics(JSON.parse(analytics));
    } catch (error) {
      logError("Failed to load search data:", { error: error });
    }
  }, []);

  // Save search data to localStorage
  const saveSearchData = useCallback(() => {
    try {
      localStorage.setItem(
        "boostlly-search-history",
        JSON.stringify(searchHistory),
      );
      localStorage.setItem(
        "boostlly-saved-searches",
        JSON.stringify(savedSearches),
      );
      localStorage.setItem(
        "boostlly-search-analytics",
        JSON.stringify(searchAnalytics),
      );
    } catch (error) {
      logError("Failed to save search data:", { error: error });
    }
  }, [searchHistory, savedSearches, searchAnalytics]);

  // Perform search with current query and filters
  const performSearch = useCallback(
    (query?: string, customFilters?: Partial<SearchFilters>) => {
      const searchTerm = query || searchQuery;
      const searchFilters = { ...filters, ...customFilters };

      const results = searchService.search(searchTerm);

      // Add to search history
      if (searchTerm.trim()) {
        const historyItem: SearchHistoryItem = {
          query: searchTerm,
          timestamp: Date.now(),
          resultCount: results.length,
        };

        setSearchHistory((prev) => {
          const newHistory = [
            historyItem,
            ...prev.filter((item) => item.query !== searchTerm),
          ].slice(0, 20);
          return newHistory;
        });

        // Update analytics
        setSearchAnalytics((prev) => ({
          ...prev,
          totalSearches: prev.totalSearches + 1,
          averageResults:
            (prev.averageResults * prev.totalSearches + results.length) /
            (prev.totalSearches + 1),
        }));
      }

      return results;
    },
    [searchQuery, filters, searchService],
  );

  // Save current search as a saved search
  const saveSearch = useCallback(
    (name: string) => {
      if (!searchQuery.trim()) return;

      const savedSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        query: searchQuery,
        filters,
        createdAt: Date.now(),
        useCount: 0,
      };

      setSavedSearches((prev) => [savedSearch, ...prev]);
    },
    [searchQuery, filters],
  );

  // Load a saved search
  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);

    // Update use count
    setSavedSearches((prev) =>
      prev.map((search) =>
        search.id === savedSearch.id
          ? { ...search, useCount: search.useCount + 1 }
          : search,
      ),
    );
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("boostlly-search-history");
  }, []);

  // Clear saved searches
  const clearSavedSearches = useCallback(() => {
    setSavedSearches([]);
    localStorage.removeItem("boostlly-saved-searches");
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      author: "",
      category: "",
      collection: "",
      isLiked: undefined,
    });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSearchData();
  }, [loadSearchData]);

  // Save data when it changes
  useEffect(() => {
    saveSearchData();
  }, [saveSearchData]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    suggestions,
    searchHistory,
    savedSearches,
    searchAnalytics,
    filters,

    // Methods
    performSearch,
    saveSearch,
    loadSavedSearch,
    clearHistory,
    clearSavedSearches,
    updateFilters,
    clearFilters,
  };
}
