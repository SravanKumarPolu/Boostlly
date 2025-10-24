import React from 'react';
import { Badge } from '@boostlly/ui';
import { BarChart3, TrendingUp, Users, Tag, Search } from 'lucide-react';
import { SearchAnalytics as SearchAnalyticsType } from '../../hooks/useSearchState';

interface SearchAnalyticsProps {
  analytics: SearchAnalyticsType;
}

/**
 * Search analytics component for displaying search statistics and insights
 */
export function SearchAnalytics({ analytics }: SearchAnalyticsProps) {
  const {
    popularSearches,
    popularAuthors,
    popularCategories,
    totalSearches,
    averageResults,
  } = analytics;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Search Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Searches */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Searches</span>
          </div>
          <p className="text-2xl font-bold">{totalSearches}</p>
        </div>

        {/* Average Results */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Results</span>
          </div>
          <p className="text-2xl font-bold">{averageResults.toFixed(1)}</p>
        </div>

        {/* Popular Authors */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Top Authors</span>
          </div>
          <p className="text-2xl font-bold">{popularAuthors.length}</p>
        </div>

        {/* Popular Categories */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Top Categories</span>
          </div>
          <p className="text-2xl font-bold">{popularCategories.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Popular Searches */}
        {popularSearches.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Popular Searches</h4>
            <div className="space-y-1">
              {popularSearches.slice(0, 5).map((search, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate">{search.query}</span>
                  <Badge variant="secondary" className="text-xs">
                    {search.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Authors */}
        {popularAuthors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Popular Authors</h4>
            <div className="space-y-1">
              {popularAuthors.slice(0, 5).map((author, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate">{author.author}</span>
                  <Badge variant="secondary" className="text-xs">
                    {author.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Categories */}
        {popularCategories.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Popular Categories</h4>
            <div className="space-y-1">
              {popularCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm truncate">{category.category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {totalSearches === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No search data available yet</p>
          <p className="text-sm text-muted-foreground">Start searching to see analytics</p>
        </div>
      )}
    </div>
  );
}
