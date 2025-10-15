"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  delay?: number;
  priority?: "high" | "normal" | "low";
}

interface AdvancedLazyLoaderProps {
  children: React.ReactNode;
  options?: LazyLoadOptions;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Performance-optimized lazy loader with multiple strategies
export const AdvancedLazyLoader: React.FC<AdvancedLazyLoaderProps> = ({
  children,
  options = {},
  onLoad,
  onError,
  className = "",
}) => {
  const {
    rootMargin = "50px",
    threshold = 0.1,
    triggerOnce = true,
    fallback,
    placeholder,
    delay = 0,
    priority = "normal",
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle intersection
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];

      if (entry.isIntersecting) {
        setIsVisible(true);

        // Apply delay if specified
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            loadContent();
          }, delay);
        } else {
          loadContent();
        }

        // Disconnect observer if triggerOnce is true
        if (triggerOnce) {
          cleanup();
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [delay, triggerOnce],
  );

  // Load content with error handling
  const loadContent = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);

    try {
      // Simulate loading time for demonstration
      if (priority === "low") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setIsLoaded(true);
      onLoad?.();
    } catch (error) {
      setHasError(true);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading, priority, onLoad, onError]);

  // Setup intersection observer
  useEffect(() => {
    if (!elementRef.current) return;

    // Use requestIdleCallback for better performance
    const setupObserver = () => {
      if (window.IntersectionObserver) {
        observerRef.current = new IntersectionObserver(handleIntersection, {
          rootMargin,
          threshold,
        });
        observerRef.current.observe(elementRef.current!);
      } else {
        // Fallback for browsers without IntersectionObserver
        loadContent();
      }
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(setupObserver);
    } else {
      setTimeout(setupObserver, 1);
    }

    return cleanup;
  }, [handleIntersection, rootMargin, threshold, loadContent, cleanup]);

  // Render content based on state
  const renderContent = () => {
    if (hasError) {
      return (
        fallback || (
          <div className="flex items-center justify-center p-8 text-red-500">
            <div className="text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm">Failed to load content</div>
            </div>
          </div>
        )
      );
    }

    if (!isVisible || !isLoaded) {
      return (
        placeholder || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )
      );
    }

    return children;
  };

  return (
    <div
      ref={elementRef}
      className={`advanced-lazy-loader ${className}`}
      data-priority={priority}
      data-loaded={isLoaded}
      data-visible={isVisible}
    >
      {renderContent()}
    </div>
  );
};

// Preload hook for critical resources
export const usePreload = () => {
  const preloadResource = useCallback(
    async (url: string, type: "script" | "style" | "image" = "script") => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = url;

        switch (type) {
          case "script":
            link.as = "script";
            break;
          case "style":
            link.as = "style";
            break;
          case "image":
            link.as = "image";
            break;
        }

        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload ${url}`));

        document.head.appendChild(link);
      });
    },
    [],
  );

  const preloadModule = useCallback(async (modulePath: string) => {
    try {
      // Use dynamic import with explicit chunk naming to avoid webpack warnings
      const importedModule = await import(
        /* webpackChunkName: "preloaded-module" */
        /* webpackMode: "lazy" */
        modulePath
      );
      return importedModule;
    } catch (error) {
      console.warn(`Failed to preload module ${modulePath}:`, error);
      return null;
    }
  }, []);

  return { preloadResource, preloadModule };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  }>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  });

  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    fn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const loadTime = endTime - startTime;
    const memoryUsage = endMemory - startMemory;

    setMetrics((prev) => ({
      ...prev,
      loadTime: Math.max(prev.loadTime, loadTime),
      memoryUsage: Math.max(prev.memoryUsage, memoryUsage),
    }));

    // Log performance metrics
    console.log(`Performance [${name}]:`, {
      loadTime: `${loadTime.toFixed(2)}ms`,
      memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
    });

    return { loadTime, memoryUsage };
  }, []);

  return { metrics, measurePerformance };
};

// Virtual scrolling component for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan,
  );
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${visibleStart * itemHeight}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Resource hints component
interface ResourceHintsProps {
  preload?: string[];
  prefetch?: string[];
  preconnect?: string[];
}

export const ResourceHints: React.FC<ResourceHintsProps> = ({
  preload = [],
  prefetch = [],
  preconnect = [],
}) => {
  useEffect(() => {
    // Add preload links
    preload.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = url.endsWith(".css") ? "style" : "script";
      document.head.appendChild(link);
    });

    // Add prefetch links
    prefetch.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    });

    // Add preconnect links
    preconnect.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      document.head.appendChild(link);
    });
  }, [preload, prefetch, preconnect]);

  return null;
};

export default AdvancedLazyLoader;
