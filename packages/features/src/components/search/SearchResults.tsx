import React from 'react';
import { Button, Badge } from '@boostlly/ui';
import { Heart, Volume2, Image, FolderOpen, Trash2, Search } from 'lucide-react';

interface SearchResultsProps {
  results: any[];
  isSearching: boolean;
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

/**
 * Search results component for displaying search results
 */
export function SearchResults({
  results,
  isSearching,
  onRemoveQuote,
  onSpeakQuote,
  onSaveAsImage,
  onAddToCollection,
}: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-4" />
            <div className="flex space-x-2">
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Don't show results section if no results - show empty state instead
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No quotes found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            We couldn't find any quotes matching your search. Try different keywords or adjust your filters.
          </p>
          <div className="space-y-2 text-left">
            <p className="text-xs font-medium text-foreground/70 mb-3">Search tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Try searching by author name, quote text, or category</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Use shorter, more general search terms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Check your filters - they might be too restrictive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Browse by category or author to discover quotes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Search Results
          </h3>
          <Badge variant="secondary" className="font-medium">
            {results.length} {results.length === 1 ? 'quote' : 'quotes'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {results.map((quote) => (
          <div
            key={quote.id}
            className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="space-y-3">
              {/* Quote Text */}
              <blockquote className="text-lg font-medium leading-relaxed">
                "{quote.text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">—</span>
                <span className="font-medium">{quote.author}</span>
                {quote.category && (
                  <Badge variant="outline" className="text-xs">
                    {quote.category}
                  </Badge>
                )}
                {quote.source && (
                  <Badge variant="secondary" className="text-xs">
                    {quote.source}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                {onSpeakQuote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSpeakQuote(quote)}
                    className="flex items-center space-x-1"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Speak</span>
                  </Button>
                )}

                {onSaveAsImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSaveAsImage(quote)}
                    className="flex items-center space-x-1"
                  >
                    <Image className="w-4 h-4" />
                    <span>Save as Image</span>
                  </Button>
                )}

                {onAddToCollection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToCollection(quote)}
                    className="flex items-center space-x-1"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Add to Collection</span>
                  </Button>
                )}

                {onRemoveQuote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveQuote(quote.id)}
                    className="flex items-center space-x-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}