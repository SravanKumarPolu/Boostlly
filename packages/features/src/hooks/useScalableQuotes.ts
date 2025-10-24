/**
 * Scalable Quotes Hook
 * 
 * Example implementation of scalable state management for quotes
 * using the new scalability utilities.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScalabilityManager,
  ScalableStateManager,
  ScalableAPIManager,
  ScalabilityMonitor,
  SCALABILITY_LIMITS,
} from '@boostlly/core';

/**
 * Hook for managing quotes with scalability considerations
 */
export function useScalableQuotes() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Initialize scalability managers
  const scalabilityManager = ScalabilityManager.getInstance();
  const stateManager = ScalableStateManager.getInstance();
  const apiManager = ScalableAPIManager.getInstance();
  const monitor = ScalabilityMonitor.getInstance();
  
  // Create scalable state slice for quotes
  const quotesSlice = useMemo(() => {
    return stateManager.createSlice('quotes', {
      maxItems: SCALABILITY_LIMITS.MAX_QUOTES_IN_MEMORY,
      enablePagination: true,
      enableVirtualization: true,
    });
  }, [stateManager]);
  
  // Start monitoring
  useEffect(() => {
    scalabilityManager.startMonitoring();
    monitor.startMonitoring();
    
    return () => {
      scalabilityManager.stopMonitoring();
      monitor.stopMonitoring();
    };
  }, [scalabilityManager, monitor]);
  
  // Set up alert handling
  useEffect(() => {
    const handleAlert = (alert: any) => {
      console.warn('Scalability Alert:', alert.message);
      
      // Handle critical alerts
      if (alert.severity === 'critical') {
        // Clear old data to free memory
        clearOldQuotes();
      }
    };
    
    monitor.onAlert(handleAlert);
    
    return () => {
      monitor.offAlert(handleAlert);
    };
  }, [monitor]);
  
  // Load quotes with scalability considerations
  const loadQuotes = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're under stress
      if (scalabilityManager.isUnderStress()) {
        console.warn('System under stress, using cached data');
        const cachedQuotes = quotesSlice.getPage(page);
        setQuotes(cachedQuotes.data);
        setCurrentPage(page);
        return;
      }
      
      // Make API request with intelligent management
      const response = await apiManager.requestWithRetry({
        url: '/api/quotes',
        method: 'GET',
        cache: true,
        priority: 'normal',
        retries: 3,
      });
      
      // Add to scalable state slice
      quotesSlice.addItems(Array.isArray(response.data) ? response.data : []);
      
      // Get paginated data
      const paginatedData = quotesSlice.getPage(page);
      setQuotes(paginatedData.data);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
      console.error('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [apiManager, quotesSlice, scalabilityManager]);
  
  // Search quotes with pagination
  const searchQuotes = useCallback(async (query: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use cached search if available
      const cacheKey = `search:${query}:${page}`;
      const cached = quotesSlice.getState();
      
      if (cached.data.length > 0) {
        const filtered = quotesSlice.search(
          (quote: any) => 
            quote.text.toLowerCase().includes(query.toLowerCase()) ||
            quote.author.toLowerCase().includes(query.toLowerCase()),
          page
        );
        
        setQuotes(filtered.data);
        setCurrentPage(page);
        return;
      }
      
      // Make API request for search
      const response = await apiManager.request({
        url: `/api/quotes/search?q=${encodeURIComponent(query)}&page=${page}`,
        method: 'GET',
        cache: true,
        priority: 'normal',
      });
      
      // Add to state slice
      quotesSlice.addItems(Array.isArray(response.data) ? response.data : []);
      
      // Get paginated results
      const paginatedData = quotesSlice.getPage(page);
      setQuotes(paginatedData.data);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiManager, quotesSlice]);
  
  // Clear old quotes to free memory
  const clearOldQuotes = useCallback(() => {
    quotesSlice.clear();
    setQuotes([]);
    setCurrentPage(1);
    console.log('Cleared old quotes to free memory');
  }, [quotesSlice]);
  
  // Get pagination info
  const paginationInfo = useMemo(() => {
    const state = quotesSlice.getState();
    return {
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      totalItems: state.totalItems,
      hasNext: currentPage < state.totalPages,
      hasPrev: currentPage > 1,
    };
  }, [quotesSlice, currentPage]);
  
  // Get performance metrics
  const metrics = useMemo(() => {
    return {
      scalability: scalabilityManager.getMetrics(),
      state: stateManager.getMetrics(),
      api: apiManager.getMetrics(),
      monitor: monitor.getMetrics(),
    };
  }, [scalabilityManager, stateManager, apiManager, monitor]);
  
  // Get health status
  const healthStatus = useMemo(() => {
    return monitor.getHealthStatus();
  }, [monitor]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up state slice
      stateManager.removeSlice('quotes');
    };
  }, [stateManager]);
  
  return {
    // Data
    quotes,
    loading,
    error,
    currentPage,
    paginationInfo,
    
    // Actions
    loadQuotes,
    searchQuotes,
    clearOldQuotes,
    setCurrentPage,
    
    // Monitoring
    metrics,
    healthStatus,
    
    // Utilities
    isUnderStress: scalabilityManager.isUnderStress(),
  };
}
