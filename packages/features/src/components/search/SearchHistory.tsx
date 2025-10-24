import React from 'react';
import { Button, Badge } from '@boostlly/ui';
import { Clock, X, Search } from 'lucide-react';
import { SearchHistoryItem } from '../../hooks/useSearchState';

interface SearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  onClearHistory: () => void;
  onLoadSearch: (query: string) => void;
}

/**
 * Search history component for displaying and managing search history
 */
export function SearchHistory({
  searchHistory,
  onClearHistory,
  onLoadSearch,
}: SearchHistoryProps) {
  if (searchHistory.length === 0) {
    return (
      <div className="p-4 border rounded-lg text-center">
        <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">No search history yet</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Search History</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearHistory}
          className="flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Clear All</span>
        </Button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {searchHistory.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onLoadSearch(item.query)}
                  className="flex items-center space-x-2 text-left hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium truncate">{item.query}</span>
                </button>
                <Badge variant="secondary" className="text-xs">
                  {item.resultCount} results
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTimestamp(item.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
