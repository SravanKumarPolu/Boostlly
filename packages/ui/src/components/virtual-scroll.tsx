import * as React from "react";
import { cn } from "../lib/utils";

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent = <div className="p-4 text-center">Loading...</div>,
  emptyComponent = (
    <div className="p-4 text-center text-muted-foreground">No items found</div>
  ),
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const scrollElementRef = React.useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate offset for visible items
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const newScrollTop = target.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll],
  );

  // Auto-scroll to top when items change
  React.useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        {loadingComponent}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5,
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
  };
}

// Enhanced Virtual Scroll with search
interface SearchableVirtualScrollProps<T>
  extends Omit<VirtualScrollProps<T>, "items"> {
  items: T[];
  searchTerm: string;
  searchFunction: (items: T[], term: string) => T[];
  placeholder?: string;
  searchInputClassName?: string;
}

function SearchableVirtualScroll<T>({
  items,
  searchTerm,
  searchFunction,
  placeholder = "Search...",
  searchInputClassName,
  ...props
}: SearchableVirtualScrollProps<T>) {
  const [internalSearchTerm, setInternalSearchTerm] =
    React.useState(searchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    React.useState(searchTerm);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(internalSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [internalSearchTerm]);

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items;
    return searchFunction(items, debouncedSearchTerm);
  }, [items, debouncedSearchTerm, searchFunction]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
          className={cn(
            "w-full px-4 py-2 border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200",
            searchInputClassName,
          )}
        />
        {internalSearchTerm && (
          <button
            onClick={() => setInternalSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      <VirtualScroll {...props} items={filteredItems} />
    </div>
  );
}

export { VirtualScroll, SearchableVirtualScroll };
