import { useState } from "react";
import { Button, Badge } from "@boostlly/ui";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
import {
  Heart,
  Volume2,
  Image,
  FolderOpen,
  Share2,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import { useQuoteActions } from "../../hooks";

/**
 * Interface for quote object
 */
export interface Quote {
  id: string;
  text: string;
  author: string;
  category?: string;
  source?: string;
  isLiked?: boolean;
}

/**
 * Props for the SearchResults component
 */
export interface SearchResultsProps {
  quotes: Quote[];
  loading?: boolean;
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: Quote) => void;
  onSaveAsImage?: (quote: Quote) => void;
  onAddToCollection?: (quote: Quote) => void;
  onShareQuote?: (quote: Quote) => void;
  onToggleLike?: (quote: Quote) => void;
  showBulkActions?: boolean;
  selectedQuotes?: Set<string>;
  onQuoteSelect?: (quoteId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  collections?: Array<{ id: string; name: string }>;
}

/**
 * SearchResults component for displaying search results
 *
 * Displays a list of quotes with action buttons and optional bulk selection.
 * Supports individual quote actions like like, speak, save as image, etc.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <SearchResults
 *   quotes={searchResults}
 *   loading={isLoading}
 *   onRemoveQuote={handleRemove}
 *   onSpeakQuote={handleSpeak}
 *   onSaveAsImage={handleSaveImage}
 *   onAddToCollection={handleAddToCollection}
 *   showBulkActions={true}
 *   selectedQuotes={selectedQuotes}
 *   onQuoteSelect={handleQuoteSelect}
 * />
 * ```
 */
export function SearchResults({
  quotes,
  loading = false,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
  onShareQuote,
  onToggleLike,
  showBulkActions = false,
  selectedQuotes = new Set(),
  onQuoteSelect,
  onSelectAll,
  collections = [],
}: SearchResultsProps) {
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);
  const { handleSpeakQuote, handleSaveAsImage, handleShareQuote } =
    useQuoteActions({
      onSpeakQuote,
      onSaveAsImage,
      onShareQuote,
    });

  /**
   * Handles quote selection for bulk actions
   */
  const handleQuoteSelect = (quoteId: string) => {
    const isSelected = selectedQuotes.has(quoteId);
    onQuoteSelect?.(quoteId, !isSelected);
  };

  /**
   * Handles select all toggle
   */
  const handleSelectAll = () => {
    const allSelected =
      quotes.length > 0 && selectedQuotes.size === quotes.length;
    onSelectAll?.(!allSelected);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-card rounded-lg p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Search className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No quotes found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      {showBulkActions && quotes.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedQuotes.size === quotes.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              Select All
            </Button>
            {selectedQuotes.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedQuotes.size} of {quotes.length} selected
              </span>
            )}
          </div>
          {selectedQuotes.size > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Add to Collection
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quote Results */}
      <div className="space-y-4">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
            onMouseEnter={() => setHoveredQuote(quote.id)}
            onMouseLeave={() => setHoveredQuote(null)}
          >
            <div className="flex items-start gap-4">
              {/* Selection Checkbox */}
              {showBulkActions && (
                <button
                  onClick={() => handleQuoteSelect(quote.id)}
                  className="mt-1 text-muted-foreground hover:text-foreground"
                >
                  {selectedQuotes.has(quote.id) ? (
                    <CheckSquare size={20} className="text-blue-500" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>
              )}

              {/* Quote Content */}
              <div className="flex-1">
                <blockquote className="text-lg text-foreground mb-3 italic">
                  "{quote.text}"
                </blockquote>
                <div className="flex items-center gap-2 mb-4">
                  <cite className="text-sm font-medium text-muted-foreground">
                    — {quote.author}
                  </cite>
                  {quote.category && (
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryDisplay(quote.category)}
                    </Badge>
                  )}
                  {quote.source && (
                    <Badge variant="outline" className="text-xs">
                      {quote.source}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleLike?.(quote)}
                    className={`flex items-center gap-1 ${
                      quote.isLiked
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Heart
                      size={16}
                      className={quote.isLiked ? "fill-current" : ""}
                    />
                    {quote.isLiked ? "Liked" : "Like"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeakQuote(quote)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Volume2 size={16} />
                    Speak
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveAsImage(quote)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-green-500"
                  >
                    <Image size={16} />
                    Save Image
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShareQuote(quote)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-purple-500"
                  >
                    <Share2 size={16} />
                    Share
                  </Button>

                  {collections.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToCollection?.(quote)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-orange-500"
                    >
                      <FolderOpen size={16} />
                      Add to Collection
                    </Button>
                  )}

                  {onRemoveQuote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveQuote(quote.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        Found {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
