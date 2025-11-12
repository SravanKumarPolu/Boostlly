import React, { useState, useMemo } from 'react';
import { Button, Input, Badge } from '@boostlly/ui';
import { Search, Filter, X, Clock, Bookmark, BarChart3, Heart, FolderOpen } from 'lucide-react';
import { useSearchState } from '../../hooks/useSearchState';
import { SearchInput } from './SearchInput';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { SearchHistory } from './SearchHistory';
import { SearchAnalytics } from './SearchAnalytics';

interface SearchContainerProps {
  savedQuotes: any[];
  collections: any[];
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

/**
 * Main search container component
 * 
 * This component orchestrates all search functionality using the useSearchState hook.
 * It's much smaller and more focused than the original AdvancedSearch component.
 */
export function SearchContainer({
  savedQuotes,
  collections,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: SearchContainerProps) {
  const {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    showSearchHistory,
    setShowSearchHistory,
    showSavedSearches,
    setShowSavedSearches,
    showAnalytics,
    setShowAnalytics,
    searchHistory,
    savedSearches,
    searchAnalytics,
    performSearch,
    saveSearch,
    loadSavedSearch,
    clearHistory,
    clearSavedSearches,
    updateFilters,
    clearFilters,
  } = useSearchState(savedQuotes, collections);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search when query or filters change
  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await performSearch();
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  // Navigation tabs for search features
  const searchTabs = [
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      count: searchHistory.length,
      onClick: () => setShowSearchHistory(!showSearchHistory),
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Bookmark,
      count: savedSearches.length,
      onClick: () => setShowSavedSearches(!showSavedSearches),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => setShowAnalytics(!showAnalytics),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            isSearching={isSearching}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Search Features Navigation */}
      <div className="flex items-center space-x-2">
        {searchTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={tab.onClick}
            className="flex items-center space-x-1"
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Search Filters */}
      {showFilters && (
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      )}

      {/* Search History */}
      {showSearchHistory && (
        <SearchHistory
          searchHistory={searchHistory}
          onClearHistory={clearHistory}
          onLoadSearch={(query) => {
            setSearchQuery(query);
            handleSearch();
          }}
        />
      )}

      {/* Saved Searches */}
      {showSavedSearches && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saved Searches</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSavedSearches}
            >
              Clear All
            </Button>
          </div>
          {savedSearches.length === 0 ? (
            <p className="text-muted-foreground">No saved searches yet</p>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((savedSearch) => (
                <div
                  key={savedSearch.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{savedSearch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {savedSearch.query}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSavedSearch(savedSearch)}
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Analytics */}
      {showAnalytics && (
        <SearchAnalytics analytics={searchAnalytics} />
      )}

      {/* Search Results - Only show if user has searched */}
      {hasSearched && (
        <SearchResults
          results={searchResults}
          isSearching={isSearching}
          onRemoveQuote={onRemoveQuote}
          onSpeakQuote={onSpeakQuote}
          onSaveAsImage={onSaveAsImage}
          onAddToCollection={onAddToCollection}
        />
      )}

      {/* Initial State - Show when no search has been performed */}
      {!hasSearched && !isSearching && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center max-w-lg">
            <div className="mb-6">
              <Search className="w-20 h-20 mx-auto mb-4 opacity-30 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">Search Quotes</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Search through your saved quotes, collections, and discover new quotes by author, category, or keywords.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1 text-foreground">Search by Text</p>
                    <p className="text-xs text-muted-foreground">Find quotes containing specific words or phrases</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1 text-foreground">Search by Author</p>
                    <p className="text-xs text-muted-foreground">Discover quotes from your favorite authors</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start gap-3">
                  <FolderOpen className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1 text-foreground">Filter by Category</p>
                    <p className="text-xs text-muted-foreground">Browse quotes by topic or theme</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1 text-foreground">Use Filters</p>
                    <p className="text-xs text-muted-foreground">Refine your search with advanced filters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
