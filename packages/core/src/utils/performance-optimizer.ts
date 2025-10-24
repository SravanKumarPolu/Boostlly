/**
 * Performance Optimization Utilities
 * 
 * Centralized performance optimization utilities to improve
 * application speed and reduce resource consumption.
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Debounce hook for performance optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for performance optimization
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Memoized selector hook for Redux-like state selection
 */
export function useMemoizedSelector<T, R>(
  selector: (state: T) => R,
  state: T,
  deps?: React.DependencyList
): R {
  return useMemo(() => selector(state), [selector, state, ...(deps || [])]);
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  const measureRender = useCallback((componentName: string, renderFn: () => void) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    renderFn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    setMetrics(prev => ({
      ...prev,
      renderTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      componentCount: prev.componentCount + 1,
    }));

    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance [${componentName}]:`, {
        renderTime: `${(endTime - startTime).toFixed(2)}ms`,
        memoryUsage: `${((endMemory - startMemory) / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }, []);

  return { metrics, measureRender };
}

/**
 * Bundle size optimization utilities
 */
export const bundleOptimizer = {
  /**
   * Lazy load component with retry mechanism
   */
  lazyLoad: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    retries: number = 3
  ): React.LazyExoticComponent<T> => {
    return React.lazy(async () => {
      try {
        return await importFn();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await importFn();
        }
        throw error;
      }
    });
  },

  /**
   * Preload critical resources
   */
  preloadCritical: async (): Promise<void> => {
    const criticalModules = [
      () => import('react'),
      () => import('react-dom'),
    ];

    await Promise.all(criticalModules.map(module => module()));
  },

  /**
   * Dynamic import with error boundary
   */
  dynamicImport: async <T>(
    importFn: () => Promise<T>,
    fallback?: T
  ): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Dynamic import failed:', error);
      if (fallback) return fallback;
      throw error;
    }
  },
};

/**
 * Memory management utilities
 */
export const memoryManager = {
  /**
   * Clear unused references
   */
  clearUnusedRefs: (refs: React.MutableRefObject<any>[]): void => {
    refs.forEach(ref => {
      if (ref.current) {
        ref.current = null;
      }
    });
  },

  /**
   * Monitor memory usage
   */
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  },

  /**
   * Force garbage collection (development only)
   */
  forceGC: (): void => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  },
};
