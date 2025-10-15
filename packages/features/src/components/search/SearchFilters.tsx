import { useState } from "react";
import { Button, Input } from "@boostlly/ui";
import { Filter, X, Calendar, User, Tag, Folder } from "lucide-react";

/**
 * Interface for search filters
 */
export interface SearchFilters {
  author: string;
  category: string;
  collection: string;
  isLiked: boolean | undefined;
}

/**
 * Props for the SearchFilters component
 */
export interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  collections: Array<{ id: string; name: string }>;
  categories: string[];
  authors: string[];
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * SearchFilters component for advanced search filtering
 *
 * Provides filtering options for:
 * - Author
 * - Category
 * - Collection
 * - Liked status
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <SearchFilters
 *   filters={filters}
 *   onFiltersChange={updateFilters}
 *   onClearFilters={clearFilters}
 *   collections={collections}
 *   categories={categories}
 *   authors={authors}
 *   isOpen={showFilters}
 *   onToggle={toggleFilters}
 * />
 * ```
 */
export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  collections,
  categories,
  authors,
  isOpen,
  onToggle,
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  /**
   * Handles individual filter changes
   */
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  /**
   * Handles applying filters
   */
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onToggle();
  };

  /**
   * Handles clearing all filters
   */
  const handleClearFilters = () => {
    const clearedFilters = {
      author: "",
      category: "",
      collection: "",
      isLiked: undefined,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  /**
   * Checks if any filters are active
   */
  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== "" && value !== undefined,
  );

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter size={16} />
        Filters
        {hasActiveFilters && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
            {
              Object.values(localFilters).filter(
                (v) => v !== "" && v !== undefined,
              ).length
            }
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/50 p-4 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Filter Results
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Author Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User size={16} />
                Author
              </label>
              <Input
                type="text"
                value={localFilters.author}
                onChange={(e) => handleFilterChange("author", e.target.value)}
                placeholder="Filter by author..."
                className="text-sm"
              />
              {authors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {authors.slice(0, 5).map((author) => (
                    <button
                      key={author}
                      type="button"
                      onClick={() => handleFilterChange("author", author)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        localFilters.author === author
                          ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
                          : "bg-secondary border-border text-secondary-foreground"
                      }`}
                    >
                      {author}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag size={16} />
                Category
              </label>
              <Input
                type="text"
                value={localFilters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                placeholder="Filter by category..."
                className="text-sm"
              />
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {categories.slice(0, 5).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleFilterChange("category", category)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        localFilters.category === category
                          ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
                          : "bg-secondary border-border text-secondary-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collection Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Folder size={16} />
                Collection
              </label>
              <select
                value={localFilters.collection}
                onChange={(e) =>
                  handleFilterChange("collection", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
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
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <select
                value={
                  localFilters.isLiked === undefined
                    ? ""
                    : localFilters.isLiked.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange(
                    "isLiked",
                    value === "" ? undefined : value === "true",
                  );
                }}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
              >
                <option value="">All Quotes</option>
                <option value="true">Liked Only</option>
                <option value="false">Not Liked</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onToggle}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
