import React from 'react';
import { Button, Input, Badge } from '@boostlly/ui';
import { X, Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../../hooks/useSearchState';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onClearFilters: () => void;
  collections?: any[];
}

/**
 * Search filters component for advanced search functionality
 */
export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  collections = [],
}: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined
  );

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Search Filters</span>
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Author Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Author</label>
          <Input
            placeholder="Filter by author..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input
            placeholder="Filter by category..."
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
        </div>

        {/* Collection Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Collection</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={filters.collection}
            onChange={(e) => handleFilterChange('collection', e.target.value)}
          >
            <option value="">All Collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        {/* Liked Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Liked Status</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            value={filters.isLiked === undefined ? '' : filters.isLiked.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('isLiked', value === '' ? undefined : value === 'true');
            }}
          >
            <option value="">All Quotes</option>
            <option value="true">Liked Only</option>
            <option value="false">Not Liked</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.author && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Author: {filters.author}</span>
              <button
                onClick={() => handleFilterChange('author', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Category: {filters.category}</span>
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.collection && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Collection: {collections.find(c => c.id === filters.collection)?.name || filters.collection}</span>
              <button
                onClick={() => handleFilterChange('collection', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.isLiked !== undefined && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Liked: {filters.isLiked ? 'Yes' : 'No'}</span>
              <button
                onClick={() => handleFilterChange('isLiked', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}