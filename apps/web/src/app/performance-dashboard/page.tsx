"use client";

import React, { useState, useEffect } from "react";
import {
  PerformanceMonitor,
  BundleAnalyzer,
} from "../../components/performance-monitor";
import { AdvancedLazyLoader } from "../../components/advanced-lazy-loader";
import { performanceUtils } from "../../utils/performance-utils";

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  bundleSize: number;
  cacheSize: number;
  memoryUsage: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    bundleSize: 0,
    cacheSize: 0,
    memoryUsage: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    performanceUtils.webVitals.measureWebVitals();
    performanceUtils.bundleAnalyzer.monitorBundleSize();

    // Monitor memory usage
    const monitorMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        }));
      }
    };

    const interval = setInterval(monitorMemory, 5000);
    monitorMemory();

    return () => clearInterval(interval);
  }, []);

  const runPerformanceTest = async () => {
    setIsMonitoring(true);
    const monitor = performanceUtils.PerformanceMonitor.getInstance();

    // Test bundle loading
    monitor.startTiming("bundle-load");
    await performanceUtils.codeSplitting.loadCriticalPath();
    monitor.endTiming("bundle-load");

    // Test lazy loading
    monitor.startTiming("lazy-load");
    await performanceUtils.optimizeImports.loadRecharts();
    monitor.endTiming("lazy-load");

    // Test cache operations
    monitor.startTiming("cache-operations");
    await performanceUtils.cacheManager.getCacheSize();
    monitor.endTiming("cache-operations");

    setIsMonitoring(false);
  };

  const clearAllCaches = async () => {
    await performanceUtils.cacheManager.clearAll();
    alert("All caches cleared successfully!");
  };

  const optimizePerformance = async () => {
    // Preload critical resources
    await performanceUtils.codeSplitting.loadCriticalPath();

    // Clear old caches
    await performanceUtils.cacheManager.clearAll();

    alert("Performance optimization completed!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and optimize your application&apos;s performance
          </p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Core Web Vitals
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className="font-medium">{metrics.fcp.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className="font-medium">{metrics.lcp.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>FID:</span>
                <span className="font-medium">{metrics.fid.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>CLS:</span>
                <span className="font-medium">{metrics.cls.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Memory Usage
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.memoryUsage.toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-500">JavaScript Heap Size</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cache Size
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.cacheSize.toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-500">Total Cached Data</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Bundle Size
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.bundleSize.toFixed(1)}KB
              </div>
              <div className="text-sm text-gray-500">Total Bundle Size</div>
            </div>
          </div>
        </div>

        {/* Performance Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Controls
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runPerformanceTest}
              disabled={isMonitoring}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMonitoring ? "Running Tests..." : "Run Performance Test"}
            </button>

            <button
              onClick={clearAllCaches}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All Caches
            </button>

            <button
              onClick={optimizePerformance}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Optimize Performance
            </button>
          </div>
        </div>

        {/* Bundle Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Bundle Analysis
          </h3>
          <BundleAnalyzer />
        </div>

        {/* Performance Monitor */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Real-time Performance Monitor
          </h3>
          <PerformanceMonitor />
        </div>

        {/* Advanced Lazy Loading Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Advanced Lazy Loading Demo
          </h3>
          <div className="space-y-4">
            <AdvancedLazyLoader
              options={{
                priority: "high",
                threshold: 0.1,
                rootMargin: "50px",
              }}
              onLoad={() => console.log("High priority component loaded")}
            >
              <div className="p-6 bg-green-100 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  High Priority Component
                </h4>
                <p className="text-green-600">
                  This component loads with high priority when it comes into
                  view.
                </p>
              </div>
            </AdvancedLazyLoader>

            <AdvancedLazyLoader
              options={{
                priority: "normal",
                threshold: 0.1,
                rootMargin: "50px",
                delay: 500,
              }}
              onLoad={() => console.log("Normal priority component loaded")}
            >
              <div className="p-6 bg-blue-100 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Normal Priority Component
                </h4>
                <p className="text-blue-600">
                  This component loads with normal priority after a 500ms delay.
                </p>
              </div>
            </AdvancedLazyLoader>

            <AdvancedLazyLoader
              options={{
                priority: "low",
                threshold: 0.1,
                rootMargin: "50px",
                delay: 1000,
              }}
              onLoad={() => console.log("Low priority component loaded")}
            >
              <div className="p-6 bg-purple-100 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  Low Priority Component
                </h4>
                <p className="text-purple-600">
                  This component loads with low priority after a 1000ms delay.
                </p>
              </div>
            </AdvancedLazyLoader>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            🚀 Performance Optimization Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
            <div>
              <h4 className="font-medium mb-2">Bundle Optimization:</h4>
              <ul className="space-y-1">
                <li>• Use dynamic imports for heavy libraries</li>
                <li>• Implement code splitting by route</li>
                <li>• Optimize bundle chunk sizes</li>
                <li>• Use tree shaking effectively</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Caching Strategies:</h4>
              <ul className="space-y-1">
                <li>• Implement service worker caching</li>
                <li>• Use appropriate cache headers</li>
                <li>• Cache API responses intelligently</li>
                <li>• Implement stale-while-revalidate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Loading Performance:</h4>
              <ul className="space-y-1">
                <li>• Lazy load non-critical components</li>
                <li>• Use intersection observer</li>
                <li>• Implement progressive loading</li>
                <li>• Optimize image loading</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Memory Management:</h4>
              <ul className="space-y-1">
                <li>• Monitor memory usage</li>
                <li>• Clean up event listeners</li>
                <li>• Use weak references where appropriate</li>
                <li>• Implement memory-efficient caching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
