import { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchService } from '@boostlly/core';

// Types for search state management
export interface SearchFilters {
  author: string;
  category: string;
  collection: string;
  isLiked: boolean | undefined;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: number;
  useCount: number;
}

export interface SearchAnalytics {
  popularSearches: { query: string; count: number }[];
  popularAuthors: { author: string; count: number }[];
  popularCategories: { category: string; count: number }[];
  totalSearches: number;
  averageResults: number;
}

export interface SearchInsights {
  favoriteAuthor: string;
  favoriteCategory: string;
  mostQuotedAuthor: string;
  searchTrends: { date: string; count: number }[];
  uniqueAuthorsCount: number;
  uniqueCategoriesCount: number;
}

export interface SmartRecommendation {
  type: 'similar' | 'trending' | 'discovery';
  quote: any;
  reason: string;
  score: number;
}

export interface RelatedContent {
  sameAuthor: any[];
  sameCategory: any[];
  sameCollection: any[];
  similarQuotes: any[];
}

/**
 * Custom hook for managing search state and functionality
 * 
 * This hook centralizes all search-related state management, reducing
 * the complexity of components that use search functionality.
 * 
 * @param savedQuotes - Array of saved quotes to search through
 * @param collections - Array of collections for filtering
 * @returns Object containing search state and methods
 */
export function useSearchState(savedQuotes: any[], collections: any[]) {
  // Basic search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    author: '',
    category: '',
    collection: '',
    isLiked: undefined,
  });

  // Enhanced search experience state
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics>({
    popularSearches: [],
    popularAuthors: [],
    popularCategories: [],
    totalSearches: 0,
    averageResults: 0,
  });

  // Advanced discovery state
  const [showInsights, setShowInsights] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showRelatedContent, setShowRelatedContent] = useState(false);
  const [searchInsights, setSearchInsights] = useState<SearchInsights>({
    favoriteAuthor: '',
    favoriteCategory: '',
    mostQuotedAuthor: '',
    searchTrends: [],
    uniqueAuthorsCount: 0,
    uniqueCategoriesCount: 0,
  });
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [relatedContent, setRelatedContent] = useState<RelatedContent>({
    sameAuthor: [],
    sameCategory: [],
    sameCollection: [],
    similarQuotes: [],
  });
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // Search service instance
  const searchService = useMemo(
    () => new SearchService(collections),
    [collections]
  );

  // Update search service when data changes
  useEffect(() => {
    searchService.updateData(savedQuotes, collections);
  }, [savedQuotes, collections, searchService]);

  // Perform search with current query and filters
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return [];

    try {
      const results = await searchService.search(searchQuery);

      // Update search history
      const historyItem: SearchHistoryItem = {
        query: searchQuery,
        timestamp: Date.now(),
        resultCount: results.length,
      };
      setSearchHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50

      // Update analytics
      setSearchAnalytics(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1,
        averageResults: (prev.averageResults + results.length) / 2,
      }));

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }, [searchQuery, filters, searchService]);

  // Save current search as a saved search
  const saveSearch = useCallback((name: string) => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: searchQuery,
      filters: { ...filters },
      createdAt: Date.now(),
      useCount: 0,
    };
    setSavedSearches(prev => [...prev, savedSearch]);
  }, [searchQuery, filters]);

  // Load a saved search
  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === savedSearch.id 
          ? { ...s, useCount: s.useCount + 1 }
          : s
      )
    );
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Clear saved searches
  const clearSavedSearches = useCallback(() => {
    setSavedSearches([]);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      author: '',
      category: '',
      collection: '',
      isLiked: undefined,
    });
  }, []);

  // Generate suggestions based on search history and saved searches
  const suggestions = useMemo(() => {
    const historyQueries = searchHistory.map(item => item.query);
    const savedQueries = savedSearches.map(item => item.query);
    const allQueries = [...new Set([...historyQueries, ...savedQueries])];
    
    return allQueries
      .filter(query => query.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10);
  }, [searchQuery, searchHistory, savedSearches]);

  return {
    // Basic search state
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    suggestions,

    // Enhanced search experience
    showSearchHistory,
    setShowSearchHistory,
    showSavedSearches,
    setShowSavedSearches,
    showAnalytics,
    setShowAnalytics,
    searchHistory,
    savedSearches,
    searchAnalytics,

    // Advanced discovery
    showInsights,
    setShowInsights,
    showRecommendations,
    setShowRecommendations,
    showRelatedContent,
    setShowRelatedContent,
    searchInsights,
    smartRecommendations,
    setSmartRecommendations,
    relatedContent,
    setRelatedContent,
    selectedQuote,
    setSelectedQuote,

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