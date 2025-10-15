import { useState, useEffect } from "react";
import { Button, Badge, Input, Alert } from "@boostlly/ui";
import {
  QuoteService,
  Quote,
  Source,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
import {
  Search,
  RefreshCw,
  Zap,
  TrendingUp,
  FolderOpen,
  Users,
  Globe,
  X,
} from "lucide-react";
import "./api-explorer.css";

interface APIExplorerProps {
  storage: any;
}

export function APIExplorer({ storage }: APIExplorerProps) {
  const [quoteService] = useState(() => new QuoteService(storage));
  const [selectedProvider, setSelectedProvider] = useState<Source>("ZenQuotes");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Quote[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("popular");
  const [isClient, setIsClient] = useState(false);

  const providers: Source[] = [
    "ZenQuotes",
    "Quotable",
    "FavQs",
    "They Said So",
    "QuoteGarden",
    "Local",
  ];
  const categories = [
    "motivation",
    "success",
    "leadership",
    "happiness",
    "wisdom",
    "creativity",
    "advice",
    "inspiration",
    "productivity",
    "growth",
    "learning",
    "mindset",
    "positivity",
    "courage",
    "confidence",
    "peace",
    "simplicity",
    "calm",
    "discipline",
    "focus",
    "love",
    "kindness",
    "compassion",
    "purpose",
    "life",
    "resilience",
    "vision",
    "innovation",
    "gratitude",
    "mindfulness",
    "change",
    "adaptability",
    "faith",
    "hope",
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRandomQuote = async () => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      const quote = await quoteService.getRandomQuote();
      setCurrentQuote(quote);
    } catch (error) {
      logError("Failed to get random quote:", { error: error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isClient) return;

    setIsLoading(true);
    try {
      const results = await quoteService.searchQuotes(
        selectedProvider,
        searchQuery,
      );
      setSearchResults(results);
    } catch (error) {
      logError("Failed to search quotes:", { error: error });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySearch = async (category: string) => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      const results = await quoteService.searchQuotes(
        selectedProvider,
        category,
      );
      setSearchResults(results);
    } catch (error) {
      logError("Failed to search by category:", { error: error });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setCurrentQuote(null);
    setSearchQuery("");
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">API Explorer</h2>
            <p className="text-muted-foreground">
              Discover quotes from external APIs
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-accent/40 rounded animate-pulse"></div>
          <div className="h-8 bg-accent/40 rounded animate-pulse"></div>
          <div className="h-8 bg-accent/40 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* API Explorer Header */}
      <div className="p-4 sm:p-6 bg-card rounded-xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              API Explorer
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover quotes from external APIs
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button
              onClick={clearResults}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Provider Tabs - Mobile Responsive */}
      <div className="space-y-3 sm:space-y-0">
        {/* Provider Selection - Mobile Stacked, Desktop Horizontal */}
        <div className="grid grid-cols-2 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-2 scrollbar-hide">
          {providers.map((provider) => (
            <Button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              variant={selectedProvider === provider ? "gradient" : "outline"}
              size="sm"
              className={`transition-all duration-300 hover:scale-105 text-xs sm:text-sm ${
                selectedProvider === provider
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30"
                  : "hover:bg-accent/10 hover:border-border"
              }`}
            >
              <span className="truncate">{provider}</span>
            </Button>
          ))}
        </div>

        {/* Refresh Button - Full Width on Mobile */}
        <Button
          onClick={handleRandomQuote}
          variant="glass"
          size="sm"
          className="w-full sm:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="sm:hidden">Refresh Quotes</span>
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Search Bar - Mobile Responsive */}
      <div className="p-4 sm:p-6 bg-card rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full text-sm sm:text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            variant="glass"
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="sm:hidden">Search Quotes</span>
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="p-4 sm:p-6 bg-card rounded-xl border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-background/5 border border-border rounded-lg px-3 py-2 text-foreground text-xs sm:text-sm w-full"
          >
            <option value={5}>Limit: 5</option>
            <option value={10}>Limit: 10</option>
            <option value={20}>Limit: 20</option>
            <option value={50}>Limit: 50</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background/5 border border-border rounded-lg px-3 py-2 text-foreground text-xs sm:text-sm w-full"
          >
            <option value="popular">Sort by: Popular</option>
            <option value="recent">Sort by: Recent</option>
            <option value="author">Sort by: Author</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-6 bg-card rounded-xl border border-border">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={handleRandomQuote}
            disabled={isLoading}
            variant="glass"
            className="flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/30 text-xs sm:text-sm"
          >
            <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span className="hidden sm:inline">⚡ Random Quote</span>
            <span className="sm:hidden">Random</span>
          </Button>
          <Button
            onClick={() => handleCategorySearch("trending")}
            disabled={isLoading}
            variant="glass"
            className="flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 text-xs sm:text-sm"
          >
            <TrendingUp className="w-4 h-4 text-green-300 flex-shrink-0" />
            <span className="hidden sm:inline">📈 Trending</span>
            <span className="sm:hidden">Trending</span>
          </Button>
          <Button
            onClick={() => setSearchQuery("")}
            variant="glass"
            className="flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-xs sm:text-sm"
          >
            <FolderOpen className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span className="hidden sm:inline">📁 Categories</span>
            <span className="sm:hidden">Categories</span>
          </Button>
          <Button
            onClick={() => setSearchQuery("")}
            variant="glass"
            className="flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30 text-xs sm:text-sm"
          >
            <Users className="w-4 h-4 text-orange-300 flex-shrink-0" />
            <span className="hidden sm:inline">👥 Authors</span>
            <span className="sm:hidden">Authors</span>
          </Button>
        </div>
      </div>

      {/* Category Quick Access - Mobile Responsive */}
      <div className="p-4 sm:p-6 bg-card rounded-xl border border-border">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2 sm:gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => handleCategorySearch(category)}
              variant="outline"
              size="sm"
              className="text-xs transition-all duration-300 hover:scale-105 hover:bg-accent/10 hover:border-border w-full justify-center text-center"
            >
              <span className="truncate">
                {getCategoryDisplay(category)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading quotes...</p>
        </div>
      )}

      {/* Current Quote Display */}
      {currentQuote && !isLoading && (
        <div className="p-4 sm:p-6 bg-card rounded-xl border border-border transition-all duration-300 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4">
                <p className="italic text-lg leading-relaxed mb-3">
                  "{currentQuote.text}"
                </p>
                <p className="text-base font-medium text-muted-foreground">
                  — {currentQuote.author}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {currentQuote.category && (
                  <Badge
                    variant="glass"
                    className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-400/30"
                  >
                    📚 {currentQuote.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs px-3 py-1">
                  🌐 {currentQuote.source}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setCurrentQuote(null)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({searchResults.length})
            </h3>
            <Button
              onClick={() => setSearchResults([])}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Results
            </Button>
          </div>

          <div className="space-y-3">
            {searchResults.map((quote, index) => (
              <div
                key={index}
                className="p-4 bg-card rounded-lg border border-border"
              >
                <p className="italic mb-2">"{quote.text}"</p>
                <p className="text-sm text-muted-foreground">
                  — {quote.author}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {quote.category && (
                    <Badge variant="glass" className="text-xs">
                      {quote.category}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {quote.source}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchQuery && !isLoading && (
        <Alert variant="info" className="border-border bg-card/60">
          <Globe className="w-4 h-4" />
          <div>
            <h4 className="font-medium">No quotes found</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term or browse by category.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
}
