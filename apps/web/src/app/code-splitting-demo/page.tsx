"use client";

import React, { useState } from "react";
import {
  PerformanceMonitor,
  BundleAnalyzer,
} from "../../components/performance-monitor";
import { ViewportLazyLoader } from "../../components/lazy-loading-utils";
import {
  ChartSkeleton,
  PageSkeleton,
} from "../../components/loading-fallbacks";

// Different lazy loading strategies demonstration
const HeavyComponent1 = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="line" title="Heavy Component 1" />
    ),
  })),
);

const HeavyComponent2 = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="bar" title="Heavy Component 2" />
    ),
  })),
);

const HeavyComponent3 = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="pie" title="Heavy Component 3" />
    ),
  })),
);

// Mock data
const mockData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Demo Data",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "#7C3AED",
      borderColor: "#7C3AED",
    },
  ],
};

export default function CodeSplittingDemoPage() {
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(
    new Set(),
  );
  const [showBundleAnalysis, setShowBundleAnalysis] = useState(false);

  const handleComponentLoad = (componentName: string) => {
    setLoadedComponents((prev) => new Set([...prev, componentName]));
  };

  const loadComponent = (componentName: string) => {
    handleComponentLoad(componentName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Code Splitting Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Comprehensive demonstration of React/Next.js code splitting
            techniques
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Dynamic Imports
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              React.lazy
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Viewport Loading
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Bundle Splitting
            </span>
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Demo Sections */}
        <div className="space-y-8">
          {/* Strategy 1: Immediate Lazy Loading */}
          <section className="bg-white rounded-lg shadow-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Strategy 1: Immediate Lazy Loading
            </h2>
            <p className="text-gray-600 mb-4">
              Components load immediately when the page renders
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <React.Suspense fallback={<ChartSkeleton />}>
                <HeavyComponent1 data={mockData} height={250} />
              </React.Suspense>

              <React.Suspense fallback={<ChartSkeleton />}>
                <HeavyComponent2 data={mockData} height={250} />
              </React.Suspense>

              <React.Suspense fallback={<ChartSkeleton />}>
                <HeavyComponent3 data={mockData} height={250} />
              </React.Suspense>
            </div>
          </section>

          {/* Strategy 2: Viewport-Based Loading */}
          <section className="bg-white rounded-lg shadow-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Strategy 2: Viewport-Based Loading
            </h2>
            <p className="text-gray-600 mb-4">
              Components load only when they come into view (scroll down to see
              them load)
            </p>

            <div className="space-y-6">
              {/* Spacer to demonstrate scrolling */}
              <div className="h-96 bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📜</div>
                  <div className="text-gray-600">
                    Scroll down to see viewport-based loading
                  </div>
                </div>
              </div>

              <ViewportLazyLoader fallback={<ChartSkeleton />}>
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent1
                    data={mockData}
                    title="Viewport Loaded - Line Chart"
                    height={300}
                  />
                </React.Suspense>
              </ViewportLazyLoader>

              <ViewportLazyLoader fallback={<ChartSkeleton />}>
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent2
                    data={mockData}
                    title="Viewport Loaded - Bar Chart"
                    height={300}
                  />
                </React.Suspense>
              </ViewportLazyLoader>

              <ViewportLazyLoader fallback={<ChartSkeleton />}>
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent3
                    data={mockData}
                    title="Viewport Loaded - Pie Chart"
                    height={300}
                  />
                </React.Suspense>
              </ViewportLazyLoader>
            </div>
          </section>

          {/* Strategy 3: User Interaction Loading */}
          <section className="bg-white rounded-lg shadow-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Strategy 3: User Interaction Loading
            </h2>
            <p className="text-gray-600 mb-4">
              Components load only when user clicks a button
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => loadComponent("interactive1")}
                className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                Load Line Chart
              </button>
              <button
                onClick={() => loadComponent("interactive2")}
                className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                Load Bar Chart
              </button>
              <button
                onClick={() => loadComponent("interactive3")}
                className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
              >
                Load Pie Chart
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadedComponents.has("interactive1") && (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent1
                    data={mockData}
                    title="Interactive - Line Chart"
                    height={250}
                  />
                </React.Suspense>
              )}

              {loadedComponents.has("interactive2") && (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent2
                    data={mockData}
                    title="Interactive - Bar Chart"
                    height={250}
                  />
                </React.Suspense>
              )}

              {loadedComponents.has("interactive3") && (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <HeavyComponent3
                    data={mockData}
                    title="Interactive - Pie Chart"
                    height={250}
                  />
                </React.Suspense>
              )}
            </div>
          </section>

          {/* Bundle Analysis */}
          <section className="bg-white rounded-lg shadow-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Bundle Analysis
              </h2>
              <button
                onClick={() => setShowBundleAnalysis(!showBundleAnalysis)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showBundleAnalysis ? "Hide" : "Show"} Analysis
              </button>
            </div>

            {showBundleAnalysis && (
              <div className="mt-4">
                <BundleAnalyzer />
              </div>
            )}
          </section>

          {/* Implementation Guide */}
          <section className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">
              🚀 Implementation Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-700 mb-2">
                  Key Features Implemented:
                </h3>
                <ul className="space-y-1 text-sm text-purple-600">
                  <li>✅ Dynamic imports with React.lazy</li>
                  <li>✅ Viewport-based loading with Intersection Observer</li>
                  <li>✅ User interaction-based loading</li>
                  <li>✅ Error boundaries for failed loads</li>
                  <li>✅ Loading fallbacks and skeletons</li>
                  <li>✅ Performance monitoring</li>
                  <li>✅ Bundle splitting optimization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-purple-700 mb-2">
                  Performance Benefits:
                </h3>
                <ul className="space-y-1 text-sm text-purple-600">
                  <li>📈 Faster initial page load</li>
                  <li>📦 Reduced bundle size</li>
                  <li>⚡ On-demand loading</li>
                  <li>💾 Better caching strategies</li>
                  <li>🔄 Improved user experience</li>
                  <li>📊 Real-time performance monitoring</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
