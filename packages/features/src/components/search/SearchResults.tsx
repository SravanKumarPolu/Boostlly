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

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No quotes found</p>
          <p className="text-sm">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Search Results ({results.length})
        </h3>
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