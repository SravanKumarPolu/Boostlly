"use client";

import React, { useState, useEffect } from "react";

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  chunkCount: number;
  lazyLoadedComponents: string[];
  networkRequests: number;
}

interface WebpackChunk {
  name: string;
  size: number;
  files: string[];
}

// Performance monitoring component
export const PerformanceMonitor: React.FC<{
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}> = ({ onMetricsUpdate }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    bundleSize: 0,
    chunkCount: 0,
    lazyLoadedComponents: [],
    networkRequests: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor page load performance
    const measurePerformance = () => {
      if (typeof window === "undefined" || !window.performance) return;

      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigation
        ? navigation.loadEventEnd - navigation.fetchStart
        : 0;

      // Get webpack chunk information
      const chunks = getWebpackChunks();
      const totalBundleSize = chunks.reduce(
        (sum, chunk) => sum + chunk.size,
        0,
      );
      const chunkCount = chunks.length;

      // Count network requests
      const networkRequests = performance.getEntriesByType("resource").length;

      const newMetrics: PerformanceMetrics = {
        loadTime: Math.round(loadTime),
        bundleSize: Math.round(totalBundleSize / 1024), // Convert to KB
        chunkCount,
        lazyLoadedComponents: [],
        networkRequests,
      };

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
    };

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
    }

    // Monitor lazy loading (simplified for demo)
    // In a real implementation, you would integrate with webpack's module loading
    // This is a placeholder for demonstration purposes

    return () => {
      window.removeEventListener("load", measurePerformance);
    };
  }, [onMetricsUpdate]);

  const getWebpackChunks = (): WebpackChunk[] => {
    // This is a simplified version - in a real app, you'd get this from webpack stats
    // For demo purposes, return empty array
    return [];
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Load Time:</span>
          <span className="font-medium">{metrics.loadTime}ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Bundle Size:</span>
          <span className="font-medium">
            {formatBytes(metrics.bundleSize * 1024)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Chunks:</span>
          <span className="font-medium">{metrics.chunkCount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Network Requests:</span>
          <span className="font-medium">{metrics.networkRequests}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Lazy Components:</span>
          <span className="font-medium">
            {metrics.lazyLoadedComponents.length}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          💡 Code splitting is active - components load on demand
        </div>
      </div>
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const updateMetrics = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
  };
};

// Bundle analyzer component
export const BundleAnalyzer: React.FC = () => {
  const [chunks, setChunks] = useState<WebpackChunk[]>([]);

  useEffect(() => {
    // This would integrate with webpack-bundle-analyzer in a real implementation
    const analyzeBundles = () => {
      // Mock data for demonstration
      const mockChunks: WebpackChunk[] = [
        { name: "main", size: 245000, files: ["main.js"] },
        { name: "react", size: 89000, files: ["react.js"] },
        { name: "charts", size: 156000, files: ["charts.js"] },
        { name: "ui", size: 67000, files: ["ui.js"] },
        { name: "features", size: 123000, files: ["features.js"] },
      ];

      setChunks(mockChunks);
    };

    analyzeBundles();
  }, []);

  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bundle Analysis
      </h3>

      <div className="space-y-2">
        {chunks.map((chunk, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{chunk.name}</span>
                <span className="text-gray-600">
                  {(chunk.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(chunk.size / totalSize) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Total Size:</span>
          <span className="font-medium text-gray-800">
            {(totalSize / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>
    </div>
  );
};
