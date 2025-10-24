/**
 * Code Splitting Utilities
 * 
 * Centralized code splitting utilities to improve bundle size
 * and loading performance across the application.
 */

import React, { Suspense, ComponentType } from 'react';
import { ErrorBoundary } from '@boostlly/ui';

/**
 * Lazy component configuration
 */
interface LazyComponentConfig {
  loading?: ComponentType;
  error?: ComponentType;
  retries?: number;
  delay?: number;
}

/**
 * Create a lazy component with enhanced error handling
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
): React.LazyExoticComponent<T> {
  const {
    loading: LoadingComponent,
    error: ErrorComponent,
    retries = 3,
    delay = 1000,
  } = config;

  const LazyComponent = React.lazy(() => 
    retryImport(importFn, retries, delay)
  );

  return LazyComponent;
}

/**
 * Retry import with exponential backoff
 */
async function retryImport<T>(
  importFn: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Lazy load page component
 */
export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig = {}
): React.LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    loading: () => React.createElement('div', null, 'Loading page...'),
    error: () => React.createElement('div', null, 'Failed to load page'),
    ...config,
  });
}

/**
 * Lazy load with Suspense wrapper
 */
export function withLazyLoading<T extends ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>,
  fallback?: React.ComponentType
): React.ComponentType<React.ComponentProps<T>> {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return React.createElement(
      ErrorBoundary,
      null,
      React.createElement(
        Suspense,
        { fallback: fallback ? React.createElement(fallback) : React.createElement('div', null, 'Loading...') },
        React.createElement(LazyComponent, props)
      )
    );
  };
}

/**
 * Preload component for better UX
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  // Preload in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(console.warn);
    });
  } else {
    setTimeout(() => {
      importFn().catch(console.warn);
    }, 100);
  }
}

/**
 * Critical path optimization
 */
export const criticalPath = {
  /**
   * Load critical components first
   */
  loadCritical: async (): Promise<void> => {
    const criticalModules = [
      () => import('react'),
      () => import('react-dom'),
      () => import('@boostlly/ui'),
    ];

    await Promise.all(criticalModules.map(module => module()));
  },

  /**
   * Preload non-critical components
   */
  preloadNonCritical: (): void => {
    const nonCriticalModules = [
      () => import('../components/advanced-analytics').then(m => ({ default: m.AdvancedAnalytics })),
      () => import('../components/pattern-recognition').then(m => ({ default: m.PatternRecognition })),
      () => import('../components/voice-commands').then(m => ({ default: m.VoiceCommands })),
    ];

    nonCriticalModules.forEach(module => {
      preloadComponent(module);
    });
  },
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalyzer = {
  /**
   * Get chunk information
   */
  getChunkInfo: (): any[] => {
    if (typeof window === 'undefined') return [];
    
    const chunks = (window as any).__webpack_require__?.cache || {};
    return Object.keys(chunks).map(key => ({
      name: key,
      size: chunks[key].size || 0,
    }));
  },

  /**
   * Monitor bundle size
   */
  monitorBundleSize: (): void => {
    if (process.env.NODE_ENV === 'development') {
      const chunks = bundleAnalyzer.getChunkInfo();
      console.log('Bundle chunks:', chunks);
      console.log('Total size:', chunks.reduce((sum, chunk) => sum + chunk.size, 0));
    }
  },
};
