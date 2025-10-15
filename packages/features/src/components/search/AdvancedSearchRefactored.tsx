import { useState, useEffect } from "react";
import { Button, Badge } from "@boostlly/ui";
import { SearchInput } from "./SearchInput";
import { SearchFilters } from "./SearchFilters";
import { SearchResults } from "./SearchResults";
import { useSearchState, useVoiceCommands } from "../../hooks";
import {
  History,
  Bookmark,
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Download,
  Share2,
} from "lucide-react";

/**
 * Props for the AdvancedSearchRefactored component
 */
interface AdvancedSearchRefactoredProps {
  savedQuotes: any[];
  collections: any[];
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

/**
 * Refactored AdvancedSearch component using smaller components and custom hooks
 *
 * This component provides advanced search functionality with:
 * - Search input with suggestions and voice commands
 * - Advanced filtering options
 * - Search history and saved searches
 * - Analytics and insights
 * - Bulk operations
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <AdvancedSearchRefactored
 *   savedQuotes={savedQuotes}
 *   collections={collections}
 *   onRemoveQuote={handleRemove}
 *   onSpeakQuote={handleSpeak}
 *   onSaveAsImage={handleSaveImage}
 *   onAddToCollection={handleAddToCollection}
 * />
 * ```
 */
export function AdvancedSearchRefactored({
  savedQuotes,
  collections,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: AdvancedSearchRefactoredProps) {
  // State for UI visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());

  // Use custom hooks for search functionality
  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    searchHistory,
    savedSearches,
    searchAnalytics,
    filters,
    performSearch,
    saveSearch,
    loadSavedSearch,
    clearHistory,
    clearSavedSearches,
    updateFilters,
    clearFilters,
  } = useSearchState(savedQuotes, collections);

  // Voice commands setup
  const voiceCommands = [
    {
      command: /search for (.*)/,
      handler: (transcript: string) => {
        const match = transcript.match(/search for (.*)/);
        if (match) {
          const query = match[1];
          setSearchQuery(query);
          performSearch(query);
        }
      },
    },
    {
      command: /clear search/,
      handler: () => {
        setSearchQuery("");
        clearFilters();
      },
    },
    {
      command: /show filters/,
      handler: () => setShowFilters(true),
    },
  ];

  const {
    status: voiceStatus,
    isSupported: voiceSupported,
    transcript: voiceTranscript,
    startListening,
    stopListening,
    toggleListening,
  } = useVoiceCommands(
    {
      enabled: true,
      language: "en-US",
      continuous: false,
      interimResults: false,
    },
    voiceCommands,
  );

  // Search results state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Handles search execution
   */
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = performSearch(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handles suggestion selection
   */
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  /**
   * Handles quote selection for bulk actions
   */
  const handleQuoteSelect = (quoteId: string, selected: boolean) => {
    const newSelected = new Set(selectedQuotes);
    if (selected) {
      newSelected.add(quoteId);
    } else {
      newSelected.delete(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  /**
   * Handles select all quotes
   */
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedQuotes(new Set(searchResults.map((q) => q.id)));
    } else {
      setSelectedQuotes(new Set());
    }
  };

  /**
   * Handles toggle like for a quote
   */
  const handleToggleLike = (quote: any) => {
    // This would typically update the quote in the parent component
    console.log("Toggle like for quote:", quote.id);
  };

  /**
   * Handles share quote
   */
  const handleShareQuote = async (quote: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Motivational Quote",
          text: `"${quote.text}" - ${quote.author}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `"${quote.text}" - ${quote.author}`,
        );
        // Show toast notification
        console.log("Quote copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing quote:", error);
    }
  };

  // Extract unique values for filters
  const categories = Array.from(
    new Set(savedQuotes.map((q) => q.category).filter(Boolean)),
  );
  const authors = Array.from(
    new Set(savedQuotes.map((q) => q.author).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Advanced Search</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
          >
            Bulk Actions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 size={16} />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        placeholder="Search quotes, authors, or categories..."
        suggestions={suggestions}
        onSuggestionSelect={handleSuggestionSelect}
        voiceEnabled={voiceSupported}
        onVoiceToggle={toggleListening}
        isListening={voiceStatus === "listening"}
      />

      {/* Voice Status */}
      {voiceSupported && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className={`w-2 h-2 rounded-full ${
              voiceStatus === "listening"
                ? "bg-green-500 animate-pulse"
                : "bg-muted"
            }`}
          />
          Voice commands: {voiceStatus}
          {voiceTranscript && (
            <span className="ml-2 italic">"{voiceTranscript}"</span>
          )}
        </div>
      )}

      {/* Search Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        collections={collections}
        categories={categories}
        authors={authors}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      {/* Search History & Saved Searches */}
      {(showSearchHistory || showSavedSearches) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search History */}
          <div className="bg-card/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <History size={16} />
                Recent Searches
              </h3>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(item.query);
                    handleSearch(item.query);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-accent/10 text-sm"
                >
                  <div className="font-medium">{item.query}</div>
                  <div className="text-muted-foreground text-xs">
                    {item.resultCount} results •{" "}
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Searches */}
          <div className="bg-card/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bookmark size={16} />
                Saved Searches
              </h3>
              <Button variant="ghost" size="sm" onClick={clearSavedSearches}>
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              {savedSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => loadSavedSearch(search)}
                  className="w-full text-left p-2 rounded hover:bg-accent/10 text-sm"
                >
                  <div className="font-medium">{search.name}</div>
                  <div className="text-muted-foreground text-xs">
                    "{search.query}" • Used {search.useCount} times
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <div className="bg-card/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Search Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {searchAnalytics.totalSearches}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Searches
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {searchAnalytics.averageResults}
              </div>
              <div className="text-sm text-muted-foreground">Avg Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {searchAnalytics.popularSearches.length}
              </div>
              <div className="text-sm text-muted-foreground">Popular Terms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {searchAnalytics.popularAuthors.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Popular Authors
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        quotes={searchResults}
        loading={isSearching}
        onRemoveQuote={onRemoveQuote}
        onSpeakQuote={onSpeakQuote}
        onSaveAsImage={onSaveAsImage}
        onAddToCollection={onAddToCollection}
        onShareQuote={handleShareQuote}
        onToggleLike={handleToggleLike}
        showBulkActions={showBulkActions}
        selectedQuotes={selectedQuotes}
        onQuoteSelect={handleQuoteSelect}
        onSelectAll={handleSelectAll}
        collections={collections}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearchHistory(!showSearchHistory)}
        >
          <History size={16} />
          History
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSavedSearches(!showSavedSearches)}
        >
          <Bookmark size={16} />
          Saved Searches
        </Button>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveSearch(`Search: ${searchQuery}`)}
          >
            <Star size={16} />
            Save Search
          </Button>
        )}
      </div>
    </div>
  );
}
