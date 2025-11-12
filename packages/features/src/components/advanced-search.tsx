import { useState, useEffect, useMemo } from "react";
import { SearchService, logError, logDebug, logWarning } from "@boostlly/core";
import { Button, Input, Badge } from "@boostlly/ui";
import {
  Search,
  Filter,
  X,
  Heart,
  Volume2,
  Image,
  FolderOpen,
  Clock,
  BarChart3,
  Bookmark,
  TrendingUp,
  History,
  Star,
  Save,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";

interface AdvancedSearchProps {
  savedQuotes: any[];
  collections: any[];
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

// Phase 1: Enhanced Search Experience Types
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

interface SavedSearch {
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

interface SearchAnalytics {
  popularSearches: { query: string; count: number }[];
  popularAuthors: { author: string; count: number }[];
  popularCategories: { category: string; count: number }[];
  totalSearches: number;
  averageResults: number;
}

// Phase 2: Advanced Discovery Types
interface SearchInsights {
  favoriteAuthor: string;
  favoriteCategory: string;
  mostQuotedAuthor: string;
  searchTrends: { date: string; count: number }[];
  uniqueAuthorsCount: number;
  uniqueCategoriesCount: number;
}

interface SmartRecommendation {
  type: "similar" | "trending" | "discovery";
  quote: any;
  reason: string;
  score: number;
}

interface RelatedContent {
  sameAuthor: any[];
  sameCategory: any[];
  sameCollection: any[];
  similarQuotes: any[];
}

// Phase 3: Power User Features Types
interface AdvancedFilters {
  dateRange: {
    start: string;
    end: string;
  };
  quoteLength: {
    min: number;
    max: number;
  };
  booleanSearch: {
    mustInclude: string[];
    mustExclude: string[];
    anyOf: string[];
  };
  sortBy: "relevance" | "date" | "author" | "category" | "length";
  sortOrder: "asc" | "desc";
}

interface BulkOperation {
  type: "addToCollection" | "removeFromCollection" | "export" | "delete";
  targetCollection?: string;
  selectedQuotes: string[];
}

export function AdvancedSearch({
  savedQuotes,
  collections,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    author: "",
    category: "",
    collection: "",
    isLiked: undefined as boolean | undefined,
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Phase 1: Enhanced Search Experience State
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

  // Phase 2: Advanced Discovery State
  const [showInsights, setShowInsights] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showRelatedContent, setShowRelatedContent] = useState(false);
  const [searchInsights, setSearchInsights] = useState<SearchInsights>({
    favoriteAuthor: "",
    favoriteCategory: "",
    mostQuotedAuthor: "",
    searchTrends: [],
    uniqueAuthorsCount: 0,
    uniqueCategoriesCount: 0,
  });
  const [smartRecommendations, setSmartRecommendations] = useState<
    SmartRecommendation[]
  >([]);
  const [relatedContent, setRelatedContent] = useState<RelatedContent>({
    sameAuthor: [],
    sameCategory: [],
    sameCollection: [],
    similarQuotes: [],
  });
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // Chip style to ensure icon buttons maintain contrast over background
  const chipStyle = {
    backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
    color: "hsl(var(--fg-hsl))",
    borderColor: "hsl(var(--fg-hsl) / 0.3)",
  } as React.CSSProperties;

  // Phase 3: Power User Features State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: { start: "", end: "" },
    quoteLength: { min: 0, max: 1000 },
    booleanSearch: { mustInclude: [], mustExclude: [], anyOf: [] },
    sortBy: "relevance",
    sortOrder: "desc",
  });
  const [_bulkOperation, setBulkOperation] = useState<BulkOperation>({
    type: "addToCollection",
    selectedQuotes: [],
  });

  const searchService = useMemo(
    () => new SearchService(collections),
    [collections],
  );

  useEffect(() => {
    searchService.updateData(savedQuotes, collections);
    loadSearchData();
  }, [savedQuotes, collections, searchService]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const newSuggestions = searchService.getSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, searchService]);

  // Phase 1: Load search data from localStorage
  const loadSearchData = () => {
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
  };

  // Phase 1: Save search data to localStorage
  const saveSearchData = () => {
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
  };

  // Phase 1: Add search to history
  const addToSearchHistory = (query: string, resultCount: number) => {
    if (!query.trim()) return;

    const newHistoryItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      resultCount,
    };

    const updatedHistory = [
      newHistoryItem,
      ...searchHistory.filter((item) => item.query !== query.trim()),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);
    updateSearchAnalytics(query.trim(), resultCount);
  };

  // Phase 1: Update search analytics
  const updateSearchAnalytics = (query: string, resultCount: number) => {
    const updatedAnalytics = { ...searchAnalytics };

    // Update popular searches
    const existingSearch = updatedAnalytics.popularSearches.find(
      (s) => s.query === query,
    );
    if (existingSearch) {
      existingSearch.count++;
    } else {
      updatedAnalytics.popularSearches.push({ query, count: 1 });
    }

    // Update total searches and average results
    updatedAnalytics.totalSearches++;
    updatedAnalytics.averageResults = Math.round(
      (updatedAnalytics.averageResults * (updatedAnalytics.totalSearches - 1) +
        resultCount) /
        updatedAnalytics.totalSearches,
    );

    // Update popular authors and categories from current results
    const currentResults = getFilteredResults();
    const authorCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    currentResults.forEach((result) => {
      authorCounts[result.item.author] =
        (authorCounts[result.item.author] || 0) + 1;
      if (result.item.category) {
        categoryCounts[result.item.category] =
          (categoryCounts[result.item.category] || 0) + 1;
      }
    });

    updatedAnalytics.popularAuthors = Object.entries(authorCounts)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    updatedAnalytics.popularCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setSearchAnalytics(updatedAnalytics);
  };

  // Phase 1: Save current search
  const saveCurrentSearch = () => {
    if (
      !searchQuery.trim() &&
      Object.values(filters).every((v) => !v || v === "")
    ) {
      alert("Please enter a search query or apply filters first");
      return;
    }

    const name = prompt("Enter a name for this saved search:");
    if (!name) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: name.trim(),
      query: searchQuery,
      filters: { ...filters },
      createdAt: Date.now(),
      useCount: 0,
    };

    const updatedSavedSearches = [newSavedSearch, ...savedSearches];
    setSavedSearches(updatedSavedSearches);
    alert("Search saved successfully!");
  };

  // Phase 1: Load saved search
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);

    // Update use count
    const updatedSavedSearches = savedSearches.map((search) =>
      search.id === savedSearch.id
        ? { ...search, useCount: search.useCount + 1 }
        : search,
    );
    setSavedSearches(updatedSavedSearches);

    setShowSavedSearches(false);
  };

  // Phase 1: Delete saved search
  const deleteSavedSearch = (id: string) => {
    if (confirm("Are you sure you want to delete this saved search?")) {
      const updatedSavedSearches = savedSearches.filter(
        (search) => search.id !== id,
      );
      setSavedSearches(updatedSavedSearches);
    }
  };

  // Phase 2: Generate search insights
  const generateSearchInsights = () => {
    const insights: SearchInsights = {
      favoriteAuthor: "",
      favoriteCategory: "",
      mostQuotedAuthor: "",
      searchTrends: [],
      uniqueAuthorsCount: 0,
      uniqueCategoriesCount: 0,
    };

    // Find favorite author (most searched)
    if (searchAnalytics.popularAuthors.length > 0) {
      insights.favoriteAuthor = searchAnalytics.popularAuthors[0].author;
    }

    // Find favorite category (most searched)
    if (searchAnalytics.popularCategories.length > 0) {
      insights.favoriteCategory = searchAnalytics.popularCategories[0].category;
    }

    // Find most quoted author (author with most quotes in collection)
    const authorCounts: Record<string, number> = {};
    savedQuotes.forEach((quote) => {
      authorCounts[quote.author] = (authorCounts[quote.author] || 0) + 1;
    });
    const mostQuotedAuthor = Object.entries(authorCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];
    insights.mostQuotedAuthor = mostQuotedAuthor ? mostQuotedAuthor[0] : "";

    // Count unique authors and categories
    insights.uniqueAuthorsCount = Object.keys(authorCounts).length;
    insights.uniqueCategoriesCount = uniqueCategories.length;

    // Generate search trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    insights.searchTrends = last7Days.map((date) => ({
      date,
      count: searchHistory.filter(
        (item) => new Date(item.timestamp).toISOString().split("T")[0] === date,
      ).length,
    }));

    setSearchInsights(insights);
  };

  // Phase 2: Generate smart recommendations
  const generateSmartRecommendations = () => {
    const recommendations: SmartRecommendation[] = [];

    // Similar quotes based on current search
    if (searchQuery.trim()) {
      const similarQuotes = savedQuotes
        .filter(
          (quote) =>
            quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quote.author.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 3)
        .map((quote) => ({
          type: "similar" as const,
          quote,
          reason: `Similar to "${searchQuery}"`,
          score: 0.8,
        }));
      recommendations.push(...similarQuotes);
    }

    // Trending quotes (most liked)
    const trendingQuotes = savedQuotes
      .filter((quote) => quote.isLiked)
      .slice(0, 2)
      .map((quote) => ({
        type: "trending" as const,
        quote,
        reason: "Popular in your collection",
        score: 0.9,
      }));
    recommendations.push(...trendingQuotes);

    // Discovery quotes (from favorite authors/categories)
    if (searchInsights.favoriteAuthor) {
      const discoveryQuotes = savedQuotes
        .filter(
          (quote) =>
            quote.author === searchInsights.favoriteAuthor && !quote.isLiked,
        )
        .slice(0, 1)
        .map((quote) => ({
          type: "discovery" as const,
          quote,
          reason: `From your favorite author: ${searchInsights.favoriteAuthor}`,
          score: 0.7,
        }));
      recommendations.push(...discoveryQuotes);
    }

    setSmartRecommendations(recommendations.slice(0, 5));
  };

  // Phase 2: Generate related content
  const generateRelatedContent = (quote: any) => {
    const related: RelatedContent = {
      sameAuthor: [],
      sameCategory: [],
      sameCollection: [],
      similarQuotes: [],
    };

    // Same author quotes
    related.sameAuthor = savedQuotes
      .filter((q) => q.author === quote.author && q.id !== quote.id)
      .slice(0, 3);

    // Same category quotes
    if (quote.category) {
      related.sameCategory = savedQuotes
        .filter((q) => q.category === quote.category && q.id !== quote.id)
        .slice(0, 3);
    }

    // Same collection quotes
    const quoteCollections = collections.filter((c) =>
      c.quoteIds.includes(quote.id),
    );
    const collectionIds = quoteCollections.map((c) => c.id);
    related.sameCollection = savedQuotes
      .filter(
        (q) =>
          q.id !== quote.id &&
          collections.some(
            (c) => collectionIds.includes(c.id) && c.quoteIds.includes(q.id),
          ),
      )
      .slice(0, 3);

    // Similar quotes (based on text similarity)
    const similarQuotes = savedQuotes
      .filter(
        (q) =>
          q.id !== quote.id &&
          (q.text
            .toLowerCase()
            .includes(quote.text.split(" ")[0].toLowerCase()) ||
            q.author === quote.author),
      )
      .slice(0, 3);

    related.similarQuotes = similarQuotes;

    setRelatedContent(related);
  };

  // Phase 3: Advanced filtering with new criteria
  const applyAdvancedFilters = (quotes: any[]) => {
    let filtered = [...quotes];

    // Date range filter
    if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
      filtered = filtered.filter((quote) => {
        const quoteDate = new Date(quote.createdAt || Date.now());
        const startDate = advancedFilters.dateRange.start
          ? new Date(advancedFilters.dateRange.start)
          : null;
        const endDate = advancedFilters.dateRange.end
          ? new Date(advancedFilters.dateRange.end)
          : null;

        if (startDate && quoteDate < startDate) return false;
        if (endDate && quoteDate > endDate) return false;
        return true;
      });
    }

    // Quote length filter
    if (
      advancedFilters.quoteLength.min > 0 ||
      advancedFilters.quoteLength.max < 1000
    ) {
      filtered = filtered.filter((quote) => {
        const length = quote.text.length;
        return (
          length >= advancedFilters.quoteLength.min &&
          length <= advancedFilters.quoteLength.max
        );
      });
    }

    // Boolean search filters
    if (advancedFilters.booleanSearch.mustInclude.length > 0) {
      filtered = filtered.filter((quote) =>
        advancedFilters.booleanSearch.mustInclude.every(
          (term) =>
            quote.text.toLowerCase().includes(term.toLowerCase()) ||
            quote.author.toLowerCase().includes(term.toLowerCase()),
        ),
      );
    }

    if (advancedFilters.booleanSearch.mustExclude.length > 0) {
      filtered = filtered.filter(
        (quote) =>
          !advancedFilters.booleanSearch.mustExclude.some(
            (term) =>
              quote.text.toLowerCase().includes(term.toLowerCase()) ||
              quote.author.toLowerCase().includes(term.toLowerCase()),
          ),
      );
    }

    if (advancedFilters.booleanSearch.anyOf.length > 0) {
      filtered = filtered.filter((quote) =>
        advancedFilters.booleanSearch.anyOf.some(
          (term) =>
            quote.text.toLowerCase().includes(term.toLowerCase()) ||
            quote.author.toLowerCase().includes(term.toLowerCase()),
        ),
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (advancedFilters.sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();
          break;
        case "author":
          comparison = a.author.localeCompare(b.author);
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
        case "length":
          comparison = a.text.length - b.text.length;
          break;
        case "relevance":
        default:
          comparison = 0; // Keep original order for relevance
          break;
      }

      return advancedFilters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  // Phase 3: Bulk operations
  const handleBulkOperation = async (operation: BulkOperation) => {
    try {
      switch (operation.type) {
        case "addToCollection":
          if (operation.targetCollection && onAddToCollection) {
            for (const quoteId of operation.selectedQuotes) {
              const quote = savedQuotes.find((q) => q.id === quoteId);
              if (quote) {
                onAddToCollection(quote);
              }
            }
            alert(
              `Added ${operation.selectedQuotes.length} quotes to collection`,
            );
          }
          break;
        case "removeFromCollection":
          if (operation.targetCollection && onRemoveQuote) {
            for (const quoteId of operation.selectedQuotes) {
              onRemoveQuote(quoteId);
            }
            alert(
              `Removed ${operation.selectedQuotes.length} quotes from collection`,
            );
          }
          break;
        case "export":
          exportSelectedQuotes(operation.selectedQuotes);
          break;
        case "delete":
          if (
            confirm(
              `Are you sure you want to delete ${operation.selectedQuotes.length} quotes?`,
            )
          ) {
            if (onRemoveQuote) {
              for (const quoteId of operation.selectedQuotes) {
                onRemoveQuote(quoteId);
              }
              alert(`Deleted ${operation.selectedQuotes.length} quotes`);
            }
          }
          break;
      }
      setSelectedQuotes(new Set());
      setShowBulkOperations(false);
    } catch (error) {
      logError("Bulk operation failed:", { error: error });
      alert("Bulk operation failed. Please try again.");
    }
  };

  // Phase 3: Export functionality
  const exportSelectedQuotes = (quoteIds: string[]) => {
    const quotesToExport = savedQuotes.filter((q) => quoteIds.includes(q.id));

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalQuotes: quotesToExport.length,
      searchQuery: searchQuery,
      filters: filters,
      quotes: quotesToExport.map((q) => ({
        text: q.text,
        author: q.author,
        category: q.category,
        isLiked: q.isLiked,
        createdAt: q.createdAt,
      })),
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boostlly-search-results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Exported ${quotesToExport.length} quotes successfully!`);
  };

  // Phase 3: Quote selection helpers
  const toggleQuoteSelection = (quoteId: string) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId);
    } else {
      newSelected.add(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  const selectAllQuotes = () => {
    const allQuoteIds = filteredResults.map((result) => result.item.id);
    setSelectedQuotes(new Set(allQuoteIds));
  };

  const clearSelection = () => {
    setSelectedQuotes(new Set());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (
    key: string,
    value: string | boolean | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      author: "",
      category: "",
      collection: "",
      isLiked: undefined,
    });
  };

  const getFilteredResults = () => {
    let results: any[] = [];

    if (
      !searchQuery.trim() &&
      Object.values(filters).every((v) => !v || v === "")
    ) {
      return [];
    }

    if (searchQuery.trim()) {
      results = searchService.advancedSearch({
        query: searchQuery,
        ...filters,
      });
    } else {
      results = searchService.advancedSearch(filters);
    }

    // Phase 3: Apply advanced filters
    return applyAdvancedFilters(results.map((r) => r.item)).map(
      (item, index) => ({
        item,
        refIndex: index,
        score: 0,
      }),
    );
  };

  const filteredResults = getFilteredResults();

  // Phase 1: Save data when it changes
  useEffect(() => {
    saveSearchData();
  }, [searchHistory, savedSearches, searchAnalytics]);

  // Phase 1: Add to history when search is performed
  useEffect(() => {
    if (
      searchQuery.trim() ||
      Object.values(filters).some((v) => v && v !== "")
    ) {
      addToSearchHistory(
        searchQuery || "Filtered Search",
        filteredResults.length,
      );
    }
  }, [filteredResults.length]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(
      savedQuotes.map((q) => q.category).filter(Boolean),
    );
    return Array.from(categories);
  }, [savedQuotes]);

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(savedQuotes.map((q) => q.author));
    return Array.from(authors);
  }, [savedQuotes]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
        <div className="text-center sm:text-left">
          <h2
            className="text-lg font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border"
            style={{
              color: "hsl(var(--fg-hsl))",
              backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
              borderColor: "hsl(var(--fg-hsl) / 0.3)",
              textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            Advanced Search
          </h2>
          <p
            className="text-xs mt-1 inline-flex px-2 py-0.5 rounded-lg backdrop-blur-md border"
            style={{
              color: "hsl(var(--fg-hsl))",
              backgroundColor: "hsl(var(--bg-hsl) / 0.3)",
              borderColor: "hsl(var(--fg-hsl) / 0.25)",
              textShadow: "0 1px 1px rgba(0,0,0,0.2)",
            }}
          >
            Search across {savedQuotes.length} saved quotes
          </p>
        </div>

        {/* Navigation Icons - Mobile-First Grid Layout */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
          {/* Phase 1: Enhanced Search Experience Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearchHistory(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Search History"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSavedSearches(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Saved Searches"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalytics(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Search Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          {/* Phase 2: Advanced Discovery Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              generateSearchInsights();
              setShowInsights(true);
            }}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Search Insights"
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              generateSmartRecommendations();
              setShowRecommendations(true);
            }}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Smart Recommendations"
          >
            <Star className="w-4 h-4" />
          </Button>
          {/* Phase 3: Power User Features Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBulkOperations(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Bulk Operations"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportOptions(true)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
            title="Export Results"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center sm:justify-start rounded-2xl border backdrop-blur-md"
            style={chipStyle as any}
          >
            <Filter className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search quotes, authors, categories, or collections..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 w-full"
        />
        {/* Phase 1: Save Search Button */}
        {(searchQuery.trim() ||
          Object.values(filters).some((v) => v && v !== "")) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={saveCurrentSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title="Save this search"
          >
            <Save className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && searchQuery.trim() && (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-1">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs w-full sm:w-auto justify-center sm:justify-start"
              onClick={() => handleSearch(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-card rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Author
              </label>
              <select
                value={filters.author}
                onChange={(e) => handleFilterChange("author", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Authors</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Collection
              </label>
              <select
                value={filters.collection}
                onChange={(e) =>
                  handleFilterChange("collection", e.target.value)
                }
                className="w-full px-2 py-1 text-sm bg-background border border-border rounded"
              >
                <option value="">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Liked
              </label>
              <select
                value={
                  filters.isLiked === undefined
                    ? ""
                    : filters.isLiked.toString()
                }
                onChange={(e) =>
                  handleFilterChange(
                    "isLiked",
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  )
                }
                className="w-full px-2 py-1 text-sm bg-background border border-border rounded"
              >
                <option value="">All Quotes</option>
                <option value="true">Liked Only</option>
                <option value="false">Not Liked</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Results ({filteredResults.length})
          </h3>
          <div className="flex items-center gap-2">
            {/* Phase 3: Bulk Selection Controls */}
            {filteredResults.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllQuotes}
                  className="text-xs"
                >
                  Select All
                </Button>
                {selectedQuotes.size > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs"
                    >
                      Clear ({selectedQuotes.size})
                    </Button>
                    <Badge variant="glass" className="text-xs">
                      {selectedQuotes.size} selected
                    </Badge>
                  </>
                )}
              </>
            )}
            {filteredResults.length > 0 && (
              <Badge variant="glass" className="text-xs">
                {searchQuery ? "Search" : "Filtered"}
              </Badge>
            )}
          </div>
        </div>

        {filteredResults.length === 0 &&
          (searchQuery.trim() ||
            Object.values(filters).some((v) => v && v !== "")) && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No quotes found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}

        {filteredResults.map((result) => (
          <div
            key={result.item.id}
            className="p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              {/* Phase 3: Bulk Selection Checkbox */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleQuoteSelection(result.item.id)}
                  className="mt-1"
                >
                  {selectedQuotes.has(result.item.id) ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-sm italic leading-relaxed">
                    &ldquo;{result.item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      — {result.item.author}
                    </span>
                    {result.item.category && (
                      <Badge variant="glass" className="text-xs">
                        {result.item.category}
                      </Badge>
                    )}
                    {result.item.isLiked && (
                      <Heart className="w-3 h-3 text-destructive fill-current" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                {/* Phase 2: Related Content Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => {
                    setSelectedQuote(result.item);
                    generateRelatedContent(result.item);
                    setShowRelatedContent(true);
                  }}
                  title="Related Content"
                >
                  <TrendingUp className="w-3 h-3" />
                </Button>
                {onAddToCollection && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onAddToCollection(result.item)}
                  >
                    <FolderOpen className="w-3 h-3" />
                  </Button>
                )}
                {onSaveAsImage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onSaveAsImage(result.item)}
                  >
                    <Image className="w-3 h-3" />
                  </Button>
                )}
                {onSpeakQuote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onSpeakQuote(result.item)}
                  >
                    <Volume2 className="w-3 h-3" />
                  </Button>
                )}
                {onRemoveQuote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onRemoveQuote(result.item.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase 1: Search History Modal */}
      {showSearchHistory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSearchHistory(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSearchHistory(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Search History
              </h3>
              <button
                onClick={() => setShowSearchHistory(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close search history dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {searchHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No search history yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Your recent searches will appear here
                  </p>
                </div>
              ) : (
                searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-background/5 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      setSearchQuery(item.query);
                      setShowSearchHistory(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">
                          {item.query}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()} •{" "}
                          {item.resultCount} results
                        </p>
                      </div>
                      <Clock className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {searchHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchHistory([]);
                  alert("Search history cleared!");
                }}
                className="mt-3"
              >
                Clear History
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Phase 1: Saved Searches Modal */}
      {showSavedSearches && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSavedSearches(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSavedSearches(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Saved Searches
              </h3>
              <button
                onClick={() => setShowSavedSearches(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close saved searches dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {savedSearches.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No saved searches yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Save your favorite search combinations
                  </p>
                </div>
              ) : (
                savedSearches.map((savedSearch) => (
                  <div
                    key={savedSearch.id}
                    className="p-3 bg-background/5 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">
                        {savedSearch.name}
                      </h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadSavedSearch(savedSearch)}
                          className="text-xs"
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedSearch(savedSearch.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Query: {savedSearch.query || "Filters only"}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Used {savedSearch.useCount} times •{" "}
                      {new Date(savedSearch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 1: Search Analytics Modal */}
      {showAnalytics && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnalytics(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowAnalytics(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Search Analytics
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close search analytics dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background/5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">
                      Total Searches
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {searchAnalytics.totalSearches}
                  </div>
                </div>
                <div className="p-3 bg-background/5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">
                      Avg Results
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    {searchAnalytics.averageResults}
                  </div>
                </div>
              </div>

              {/* Popular Searches */}
              {searchAnalytics.popularSearches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Popular Searches
                  </h4>
                  <div className="space-y-1">
                    {searchAnalytics.popularSearches
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background/5 rounded"
                        >
                          <span className="text-xs text-foreground">
                            {item.query}
                          </span>
                          <Badge variant="glass" className="text-xs">
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Popular Authors */}
              {searchAnalytics.popularAuthors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Popular Authors
                  </h4>
                  <div className="space-y-1">
                    {searchAnalytics.popularAuthors
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background/5 rounded"
                        >
                          <span className="text-xs text-foreground">
                            {item.author}
                          </span>
                          <Badge variant="glass" className="text-xs">
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Popular Categories */}
              {searchAnalytics.popularCategories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Popular Categories
                  </h4>
                  <div className="space-y-1">
                    {searchAnalytics.popularCategories
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background/5 rounded"
                        >
                          <span className="text-xs text-foreground">
                            {item.category}
                          </span>
                          <Badge variant="glass" className="text-xs">
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {searchAnalytics.totalSearches === 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No search data yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Start searching to see analytics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Search Insights Modal */}
      {showInsights && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInsights(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowInsights(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Search Insights
              </h3>
              <button
                onClick={() => setShowInsights(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close search insights dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Personal Insights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background/5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">
                      Favorite Author
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {searchInsights.favoriteAuthor || "None yet"}
                  </div>
                </div>
                <div className="p-3 bg-background/5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-muted-foreground">
                      Favorite Category
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {searchInsights.favoriteCategory || "None yet"}
                  </div>
                </div>
              </div>

              {/* Collection Stats */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Your Collection
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-background/5 rounded">
                    <span className="text-xs text-foreground">
                      Most Quoted Author
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {searchInsights.mostQuotedAuthor || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/5 rounded">
                    <span className="text-xs text-foreground">
                      Unique Authors
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {searchInsights.uniqueAuthorsCount}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-background/5 rounded">
                    <span className="text-xs text-foreground">
                      Unique Categories
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {searchInsights.uniqueCategoriesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Trends */}
              {searchInsights.searchTrends.some((trend) => trend.count > 0) && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Search Activity (Last 7 Days)
                  </h4>
                  <div className="space-y-1">
                    {searchInsights.searchTrends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-background/5 rounded"
                      >
                        <span className="text-xs text-foreground">
                          {new Date(trend.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-background/10 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(trend.count * 20, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {trend.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchAnalytics.totalSearches === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No search insights yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Start searching to see your patterns
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Smart Recommendations Modal */}
      {showRecommendations && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRecommendations(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowRecommendations(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Smart Recommendations
              </h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close smart recommendations dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {smartRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No recommendations yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Try searching to get personalized recommendations
                  </p>
                </div>
              ) : (
                smartRecommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-3 bg-background/5 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm italic text-foreground leading-relaxed">
                          &ldquo;{recommendation.quote.text}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            — {recommendation.quote.author}
                          </span>
                          <Badge variant="glass" className="text-xs">
                            {recommendation.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {onAddToCollection && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() =>
                              onAddToCollection(recommendation.quote)
                            }
                          >
                            <FolderOpen className="w-3 h-3" />
                          </Button>
                        )}
                        {onSpeakQuote && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => onSpeakQuote(recommendation.quote)}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {recommendation.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Related Content Modal */}
      {showRelatedContent && selectedQuote && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRelatedContent(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowRelatedContent(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Related Content
              </h3>
              <button
                onClick={() => setShowRelatedContent(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close related content dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Same Author */}
              {relatedContent.sameAuthor.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Same Author
                  </h4>
                  <div className="space-y-2">
                    {relatedContent.sameAuthor.map((quote, index) => (
                      <div
                        key={index}
                        className="p-2 bg-background/5 rounded border border-border"
                      >
                        <p className="text-xs italic text-foreground">
                          "{quote.text}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {quote.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Same Category */}
              {relatedContent.sameCategory.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Same Category
                  </h4>
                  <div className="space-y-2">
                    {relatedContent.sameCategory.map((quote, index) => (
                      <div
                        key={index}
                        className="p-2 bg-background/5 rounded border border-border"
                      >
                        <p className="text-xs italic text-foreground">
                          "{quote.text}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {quote.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Same Collection */}
              {relatedContent.sameCollection.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Same Collection
                  </h4>
                  <div className="space-y-2">
                    {relatedContent.sameCollection.map((quote, index) => (
                      <div
                        key={index}
                        className="p-2 bg-background/5 rounded border border-border"
                      >
                        <p className="text-xs italic text-foreground">
                          "{quote.text}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {quote.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Quotes */}
              {relatedContent.similarQuotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Similar Quotes
                  </h4>
                  <div className="space-y-2">
                    {relatedContent.similarQuotes.map((quote, index) => (
                      <div
                        key={index}
                        className="p-2 bg-background/5 rounded border border-border"
                      >
                        <p className="text-xs italic text-foreground">
                          "{quote.text}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {quote.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {relatedContent.sameAuthor.length === 0 &&
                relatedContent.sameCategory.length === 0 &&
                relatedContent.sameCollection.length === 0 &&
                relatedContent.similarQuotes.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No related content found
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      This quote is unique in your collection
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdvancedFilters(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowAdvancedFilters(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close advanced filters dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Date Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.start}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            start: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.end}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Quote Length */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Quote Length
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Min Length
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.quoteLength.min}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          quoteLength: {
                            ...prev.quoteLength,
                            min: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Max Length
                    </label>
                    <input
                      type="number"
                      value={advancedFilters.quoteLength.max}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          quoteLength: {
                            ...prev.quoteLength,
                            max: parseInt(e.target.value) || 1000,
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Boolean Search */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Boolean Search
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Must Include (AND)
                    </label>
                    <input
                      type="text"
                      placeholder="term1, term2, term3"
                      value={advancedFilters.booleanSearch.mustInclude.join(
                        ", ",
                      )}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          booleanSearch: {
                            ...prev.booleanSearch,
                            mustInclude: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Must Exclude (NOT)
                    </label>
                    <input
                      type="text"
                      placeholder="term1, term2, term3"
                      value={advancedFilters.booleanSearch.mustExclude.join(
                        ", ",
                      )}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          booleanSearch: {
                            ...prev.booleanSearch,
                            mustExclude: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Any Of (OR)
                    </label>
                    <input
                      type="text"
                      placeholder="term1, term2, term3"
                      value={advancedFilters.booleanSearch.anyOf.join(", ")}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          booleanSearch: {
                            ...prev.booleanSearch,
                            anyOf: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Sorting */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Sorting
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Sort By
                    </label>
                    <select
                      value={advancedFilters.sortBy}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          sortBy: e.target.value as any,
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="author">Author</option>
                      <option value="category">Category</option>
                      <option value="length">Length</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Order
                    </label>
                    <select
                      value={advancedFilters.sortOrder}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          sortOrder: e.target.value as "asc" | "desc",
                        }))
                      }
                      className="w-full px-2 py-1 text-sm bg-background/10 border border-border rounded text-foreground"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowAdvancedFilters(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Bulk Operations Modal */}
      {showBulkOperations && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBulkOperations(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowBulkOperations(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Bulk Operations
              </h3>
              <button
                onClick={() => setShowBulkOperations(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close bulk operations dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedQuotes.size === 0 ? (
                <div className="text-center py-8">
                  <Save className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No quotes selected
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Select quotes to perform bulk operations
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-background/5 rounded-lg border border-border">
                    <p className="text-sm text-foreground mb-2">
                      {selectedQuotes.size} quotes selected
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        setBulkOperation({
                          type: "addToCollection",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                        handleBulkOperation({
                          type: "addToCollection",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Add to Collection
                    </Button>

                    <Button
                      onClick={() => {
                        setBulkOperation({
                          type: "export",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                        handleBulkOperation({
                          type: "export",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Selected
                    </Button>

                    <Button
                      onClick={() => {
                        setBulkOperation({
                          type: "delete",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                        handleBulkOperation({
                          type: "delete",
                          selectedQuotes: Array.from(selectedQuotes),
                        });
                      }}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Export Options Modal */}
      {showExportOptions && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExportOptions(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowExportOptions(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Export Search Results
              </h3>
              <button
                onClick={() => setShowExportOptions(false)}
                className="p-2 rounded-lg text-foreground/80 hover:text-foreground bg-background/50 hover:bg-accent border border-border/50 hover:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close export dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-base font-medium text-foreground mb-1">
                  Export {filteredResults.length} search {filteredResults.length === 1 ? 'result' : 'results'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Includes search query, filters, and quote data
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    exportSelectedQuotes(filteredResults.map((r) => r.item.id));
                    setShowExportOptions(false);
                  }}
                  className="w-full"
                  disabled={filteredResults.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Results
                </Button>

                {selectedQuotes.size > 0 && (
                  <Button
                    onClick={() => {
                      exportSelectedQuotes(Array.from(selectedQuotes));
                      setShowExportOptions(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected ({selectedQuotes.size})
                  </Button>
                )}

                <Button
                  onClick={() => setShowExportOptions(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
