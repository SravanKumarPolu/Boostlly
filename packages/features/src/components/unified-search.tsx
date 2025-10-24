/**
 * Unified Search Component
 * 
 * A consolidated search component that replaces multiple search components
 * with a single, highly configurable component that handles all search needs.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, X, Loader2, Mic, MicOff } from 'lucide-react';
import { BaseComponent } from '@boostlly/ui';
import { Input } from '@boostlly/ui';
import { Button } from '@boostlly/ui';
import { Badge } from '@boostlly/ui';
import { cn } from '@boostlly/ui';
import { useDebounce, useThrottle } from '@boostlly/core';

/**
 * Search result interface
 */
export interface SearchResult {
  id: string;
  text: string;
  author: string;
  category?: string;
  tags?: string[];
  source?: string;
  relevanceScore?: number;
}

/**
 * Search filter interface
 */
export interface SearchFilter {
  category?: string;
  author?: string;
  tags?: string[];
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Search variant types
 */
export type SearchVariant = 'default' | 'minimal' | 'advanced' | 'voice';

/**
 * Search size types
 */
export type SearchSize = 'sm' | 'md' | 'lg';

/**
 * Unified search props interface
 */
export interface UnifiedSearchProps {
  variant?: SearchVariant;
  size?: SearchSize;
  placeholder?: string;
  showFilters?: boolean;
  showVoiceSearch?: boolean;
  showSuggestions?: boolean;
  enableRealTimeSearch?: boolean;
  enableVoiceSearch?: boolean;
  enableFilters?: boolean;
  enableHistory?: boolean;
  maxResults?: number;
  debounceMs?: number;
  className?: string;
  onSearch?: (query: string, filters?: SearchFilter) => Promise<SearchResult[]>;
  onResultSelect?: (result: SearchResult) => void;
  onFilterChange?: (filters: SearchFilter) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  testId?: string;
}

/**
 * Unified Search Component
 * 
 * This component consolidates multiple search components into a single,
 * highly configurable component that can handle all search needs.
 */
export function UnifiedSearch({
  variant = 'default',
  size = 'md',
  placeholder = 'Search quotes...',
  showFilters = true,
  showVoiceSearch = true,
  showSuggestions = true,
  enableRealTimeSearch = true,
  enableVoiceSearch = true,
  enableFilters = true,
  enableHistory = true,
  maxResults = 10,
  debounceMs = 300,
  className,
  onSearch,
  onResultSelect,
  onFilterChange,
  onVoiceStart,
  onVoiceEnd,
  testId,
}: UnifiedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Generate component-specific class names
  const searchClasses = useMemo(() => {
    const baseClasses = [
      'relative',
      'w-full',
      'max-w-md',
      'mx-auto',
    ];

    const variantClasses = {
      default: 'space-y-4',
      minimal: 'space-y-2',
      advanced: 'space-y-6',
      voice: 'space-y-4',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );
  }, [variant, size, className]);

  // Debounced search query
  const debouncedQuery = useDebounce(query, debounceMs);

  // Throttled search function
  const throttledSearch = useThrottle(
    useCallback(async (searchQuery: string, searchFilters: SearchFilter) => {
      if (!searchQuery.trim() || !onSearch) return;

      setIsSearching(true);
      try {
        const searchResults = await onSearch(searchQuery, searchFilters);
        setResults(searchResults.slice(0, maxResults));
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, [onSearch, maxResults]),
    500
  );

  // Handle search query changes
  useEffect(() => {
    if (enableRealTimeSearch && debouncedQuery.trim()) {
      throttledSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, enableRealTimeSearch, throttledSearch]);

  // Generate suggestions based on query
  useEffect(() => {
    if (showSuggestions && query.length > 1) {
      // Generate suggestions from search history and common terms
      const historySuggestions = searchHistory
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      
      const commonSuggestions = [
        'motivation',
        'success',
        'inspiration',
        'wisdom',
        'leadership',
        'happiness',
        'life',
        'work',
        'dreams',
        'goals'
      ].filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSuggestions([...historySuggestions, ...commonSuggestions]);
    } else {
      setSuggestions([]);
    }
  }, [query, showSuggestions, searchHistory]);

  // Initialize voice recognition
  useEffect(() => {
    if (enableVoiceSearch && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onVoiceStart?.();
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onVoiceEnd?.(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsVoiceActive(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
        setIsVoiceActive(false);
      };
    }
  }, [enableVoiceSearch, onVoiceStart, onVoiceEnd]);

  // Handle search input changes
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Handle search submission
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    // Add to search history
    if (enableHistory) {
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(term => term !== query)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });
    }

    // Perform search
    if (onSearch) {
      setIsSearching(true);
      try {
        const searchResults = await onSearch(query, filters);
        setResults(searchResults.slice(0, maxResults));
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  }, [query, filters, onSearch, maxResults, enableHistory]);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    onResultSelect?.(result);
    setQuery('');
    setResults([]);
  }, [onResultSelect]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: SearchFilter) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);

  // Handle voice search
  const handleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    } else {
      recognitionRef.current.start();
      setIsVoiceActive(true);
    }
  }, [isVoiceActive]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
  }, []);


  // Render search input
  const renderSearchInput = useCallback(() => {
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className={cn(
              'pl-10 pr-20',
              size === 'sm' && 'h-8',
              size === 'md' && 'h-10',
              size === 'lg' && 'h-12'
            )}
            disabled={isSearching}
          />
          {isSearching && (
            <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showVoiceSearch && enableVoiceSearch && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVoiceSearch}
              className={cn(
                'p-1 h-6 w-6',
                isVoiceActive && 'text-red-500',
                isListening && 'animate-pulse'
              )}
              title={isVoiceActive ? 'Stop listening' : 'Start voice search'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {showFilters && enableFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="p-1 h-6 w-6"
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }, [
    query,
    handleQueryChange,
    handleSearch,
    placeholder,
    size,
    isSearching,
    showVoiceSearch,
    enableVoiceSearch,
    isVoiceActive,
    isListening,
    handleVoiceSearch,
    showFilters,
    enableFilters,
    showFilterPanel,
    setShowFilterPanel,
  ]);

  // Render suggestions
  const renderSuggestions = useCallback(() => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionSelect(suggestion)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  }, [showSuggestions, suggestions, handleSuggestionSelect]);

  // Render search results
  const renderResults = useCallback(() => {
    if (results.length === 0) return null;

    return (
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={result.id || index}
            onClick={() => handleResultSelect(result)}
            className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {result.text}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">— {result.author}</p>
              <div className="flex items-center gap-2">
                {result.category && (
                  <Badge variant="secondary" className="text-xs">
                    {result.category}
                  </Badge>
                )}
                {result.source && (
                  <Badge variant="outline" className="text-xs">
                    {result.source}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [results, handleResultSelect]);

  // Render filter panel
  const renderFilterPanel = useCallback(() => {
    if (!showFilterPanel || !enableFilters) return null;

    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilterPanel(false)}
              className="p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <Input
                type="text"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  category: e.target.value
                })}
                placeholder="Enter category"
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Author
              </label>
              <Input
                type="text"
                value={filters.author || ''}
                onChange={(e) => handleFilterChange({
                  ...filters,
                  author: e.target.value
                })}
                placeholder="Enter author"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    showFilterPanel,
    enableFilters,
    filters,
    handleFilterChange,
    setShowFilterPanel,
  ]);

  return (
    <div className={searchClasses} data-testid={testId}>
      {renderSearchInput()}
      {renderSuggestions()}
      {renderFilterPanel()}
      {renderResults()}
    </div>
  );
}

/**
 * Search result list component
 */
export function SearchResultList({
  results,
  onResultSelect,
  className,
}: {
  results: SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {results.map((result, index) => (
        <div
          key={result.id || index}
          onClick={() => onResultSelect?.(result)}
          className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {result.text}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-600">— {result.author}</p>
            <div className="flex items-center gap-2">
              {result.category && (
                <Badge variant="secondary" className="text-xs">
                  {result.category}
                </Badge>
              )}
              {result.source && (
                <Badge variant="outline" className="text-xs">
                  {result.source}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
