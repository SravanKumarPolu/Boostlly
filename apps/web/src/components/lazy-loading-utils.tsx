"use client";

import dynamic from "next/dynamic";
import React from "react";
import {
  ChartSkeleton,
  PageSkeleton,
  ComponentSkeleton,
  LazyLoadErrorBoundary,
} from "./loading-fallbacks";

// Generic lazy loading factory with consistent configuration
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ComponentType;
    ssr?: boolean;
    fallback?: React.ReactNode;
  } = {},
) => {
  const { loading: LoadingComponent, ssr = false, fallback } = options;

  const LazyComponent = dynamic(importFn as any, {
    loading: LoadingComponent
      ? () => React.createElement(LoadingComponent) as React.ReactElement
      : () => (fallback as React.ReactElement) || <ComponentSkeleton />,
    ssr,
  });

  const Component = (props: React.ComponentProps<T>) => (
    <LazyLoadErrorBoundary fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoadErrorBoundary>
  );

  Component.displayName = "LazyComponent";
  return Component;
};

// Pre-configured lazy loading for charts
export const createLazyChart = (importFn: () => Promise<any>) =>
  createLazyComponent(importFn, {
    loading: () => <ChartSkeleton />,
    ssr: false,
  });

// Pre-configured lazy loading for pages
export const createLazyPage = (importFn: () => Promise<any>) =>
  createLazyComponent(importFn, {
    loading: () => <PageSkeleton />,
    ssr: false,
  });

// Hook for managing lazy loading state
export const useLazyLoading = () => {
  const [loadingStates, setLoadingStates] = React.useState<
    Record<string, boolean>
  >({});
  const [errors, setErrors] = React.useState<Record<string, Error | null>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
    if (loading) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const setError = (key: string, error: Error | null) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const hasError = (key: string) => !!errors[key];
  const getError = (key: string) => errors[key];

  const retry = (key: string) => {
    setError(key, null);
    setLoading(key, true);
  };

  return {
    isLoading,
    hasError,
    getError,
    setLoading,
    setError,
    retry,
  };
};

// Performance monitoring for lazy loading
export const useLazyLoadingMetrics = () => {
  const [metrics, setMetrics] = React.useState<
    Record<
      string,
      {
        loadTime: number;
        loadCount: number;
        lastLoaded: Date;
      }
    >
  >({});

  const recordLoad = React.useCallback(
    (componentName: string, loadTime: number) => {
      setMetrics((prev) => ({
        ...prev,
        [componentName]: {
          loadTime,
          loadCount: (prev[componentName]?.loadCount || 0) + 1,
          lastLoaded: new Date(),
        },
      }));
    },
    [],
  );

  const getMetrics = (componentName: string) => metrics[componentName];

  return { recordLoad, getMetrics };
};

// Intersection Observer hook for viewport-based lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

// Viewport-based lazy loading component
export const ViewportLazyLoader: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}> = ({
  children,
  fallback = <ComponentSkeleton />,
  rootMargin = "50px",
  threshold = 0.1,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { hasIntersected } = useIntersectionObserver(ref, {
    rootMargin,
    threshold,
  });

  return <div ref={ref}>{hasIntersected ? children : fallback}</div>;
};

ViewportLazyLoader.displayName = "ViewportLazyLoader";
