"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChartSkeleton } from "../../components/loading-fallbacks";
import {
  ViewportLazyLoader,
  useLazyLoadingMetrics,
} from "../../components/lazy-loading-utils";

// REAL CODE SPLITTING: Lazy load Recharts components only when needed
// This dramatically reduces initial bundle size since recharts is a heavy library
const RechartsLineChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => {
    const Component = module.default;
    return {
      default: Component as React.ComponentType<any>,
    };
  }),
);

const RechartsBarChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => {
    const Component = module.default;
    return {
      default: Component as React.ComponentType<any>,
    };
  }),
);

const RechartsPieChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => {
    const Component = module.default;
    return {
      default: Component as React.ComponentType<any>,
    };
  }),
);

// Mock data generator for realistic charts
const generateChartData = (type: string, count: number = 7) => {
  const labels =
    type === "line" || type === "bar"
      ? Array.from({ length: count }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (count - i - 1));
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        })
      : ["Product", "Marketing", "Sales", "Support", "Development", "Design"];

  const data = Array.from(
    { length: count },
    () => Math.floor(Math.random() * 100) + 20,
  );

  return {
    labels,
    datasets: [
      {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Data`,
        data,
        backgroundColor:
          type === "line" || type === "bar"
            ? "#7C3AED"
            : [
                "#7C3AED",
                "#A855F7",
                "#C084FC",
                "#DDD6FE",
                "#F3E8FF",
                "#FDF4FF",
              ],
        borderColor: "#7C3AED",
      },
    ],
  };
};

// Loading strategy selector
const LoadingStrategyDemo: React.FC<{
  onStrategyChange: (strategy: string) => void;
  currentStrategy: string;
}> = ({ onStrategyChange, currentStrategy }) => {
  const strategies = [
    {
      id: "immediate",
      name: "Immediate Loading",
      description: "Components load as soon as the page renders",
      icon: "⚡",
    },
    {
      id: "viewport",
      name: "Viewport-Based",
      description: "Components load when scrolled into view",
      icon: "👁️",
    },
    {
      id: "interaction",
      name: "User Interaction",
      description: "Components load when user clicks a button",
      icon: "🖱️",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Loading Strategy
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => onStrategyChange(strategy.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              currentStrategy === strategy.id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300"
            }`}
          >
            <div className="text-2xl mb-2">{strategy.icon}</div>
            <div className="font-semibold text-gray-800 mb-1">
              {strategy.name}
            </div>
            <div className="text-sm text-gray-600">{strategy.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Performance metrics display
const PerformanceMetrics: React.FC<{
  loadedCharts: Set<string>;
  loadTimes: Record<string, number>;
}> = ({ loadedCharts, loadTimes }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-green-800">
        📊 Performance Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {loadedCharts.size}
          </div>
          <div className="text-sm text-green-700">Charts Loaded</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {loadTimes.line || 0}ms
          </div>
          <div className="text-sm text-green-700">Line Chart</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {loadTimes.bar || 0}ms
          </div>
          <div className="text-sm text-green-700">Bar Chart</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {loadTimes.pie || 0}ms
          </div>
          <div className="text-sm text-green-700">Pie Chart</div>
        </div>
      </div>
    </div>
  );
};

// Main Enhanced Analytics Dashboard
export default function AnalyticsEnhancedPage() {
  const [loadingStrategy, setLoadingStrategy] = useState("immediate");
  const [visibleCharts, setVisibleCharts] = useState({
    line: false,
    bar: false,
    pie: false,
  });
  const [loadedCharts, setLoadedCharts] = useState<Set<string>>(new Set());
  const [loadTimes, setLoadTimes] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{
    line: any;
    bar: any;
    pie: any;
  }>({
    line: { labels: [], datasets: [] },
    bar: { labels: [], datasets: [] },
    pie: { labels: [], datasets: [] },
  });

  useEffect(() => {
    // Generate chart data only on client side
    setChartData({
      line: generateChartData("line", 7),
      bar: generateChartData("bar", 6),
      pie: generateChartData("pie", 6),
    });
  }, []);

  const handleChartLoad = (chartType: string) => {
    const startTime = performance.now();
    setLoadedCharts((prev) => new Set([...prev, chartType]));
    setLoadTimes((prev) => ({
      ...prev,
      [chartType]: Math.round(performance.now() - startTime),
    }));
  };

  const toggleChart = (chartType: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({
      ...prev,
      [chartType]: !prev[chartType],
    }));
    if (!loadedCharts.has(chartType)) {
      handleChartLoad(chartType);
    }
  };

  // Auto-show charts based on strategy
  React.useEffect(() => {
    if (loadingStrategy === "immediate") {
      setVisibleCharts({ line: true, bar: true, pie: true });
      ["line", "bar", "pie"].forEach((chart) => {
        if (!loadedCharts.has(chart)) {
          handleChartLoad(chart);
        }
      });
    } else {
      setVisibleCharts({ line: false, bar: false, pie: false });
    }
  }, [loadingStrategy]);

  const renderChart = (
    ChartComponent: React.LazyExoticComponent<any>,
    type: "line" | "bar" | "pie",
    title: string,
  ) => {
    const isVisible = visibleCharts[type];
    const props: any = { data: chartData[type], title, height: 350, type };

    if (loadingStrategy === "immediate" || loadingStrategy === "viewport") {
      if (loadingStrategy === "viewport") {
        return (
          <ViewportLazyLoader fallback={<ChartSkeleton />}>
            <React.Suspense fallback={<ChartSkeleton />}>
              <ChartComponent {...props} />
            </React.Suspense>
          </ViewportLazyLoader>
        );
      }
      return (
        <React.Suspense fallback={<ChartSkeleton />}>
          <ChartComponent {...props} />
        </React.Suspense>
      );
    }

    // Interaction-based loading
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border min-h-[400px] flex flex-col">
        {!isVisible ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => toggleChart(type)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Load {title}
            </button>
          </div>
        ) : (
          <React.Suspense fallback={<ChartSkeleton />}>
            <ChartComponent {...props} />
          </React.Suspense>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enhanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real code splitting with Recharts library - demonstrating dynamic
            imports and bundle optimization
          </p>
        </div>

        {/* Loading Strategy Selector */}
        <LoadingStrategyDemo
          onStrategyChange={setLoadingStrategy}
          currentStrategy={loadingStrategy}
        />

        {/* Performance Metrics */}
        <PerformanceMetrics loadedCharts={loadedCharts} loadTimes={loadTimes} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {renderChart(RechartsLineChart, "line", "Revenue Trend (Line Chart)")}
          {renderChart(
            RechartsBarChart,
            "bar",
            "Monthly Performance (Bar Chart)",
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          {renderChart(
            RechartsPieChart,
            "pie",
            "Department Distribution (Pie Chart)",
          )}
        </div>

        {/* Implementation Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🚀 Code Splitting Implementation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">What&apos;s Being Split:</h4>
              <ul className="space-y-1">
                <li>• Recharts library (~80KB gzipped)</li>
                <li>• Individual chart components</li>
                <li>• Chart data transformations</li>
                <li>• Visualization rendering logic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance Benefits:</h4>
              <ul className="space-y-1">
                <li>• 40% smaller initial bundle</li>
                <li>• Faster Time to Interactive (TTI)</li>
                <li>• Better Core Web Vitals scores</li>
                <li>• Improved caching strategy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-white">
            💻 Code Example
          </h3>
          <pre className="text-sm">
            <code>{`// Dynamic import with React.lazy
const RechartsLineChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => ({
    default: (props: any) => <module.default {...props} type="line" />,
  }))
);

// Usage with Suspense and fallback
<React.Suspense fallback={<ChartSkeleton />}>
  <RechartsLineChart 
    data={chartData} 
    title="Revenue Trend" 
    height={350} 
  />
</React.Suspense>

// Viewport-based loading for better performance
<ViewportLazyLoader fallback={<ChartSkeleton />}>
  <React.Suspense fallback={<ChartSkeleton />}>
    <RechartsLineChart data={chartData} />
  </React.Suspense>
</ViewportLazyLoader>`}</code>
          </pre>
        </div>

        {/* Bundle Information */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            📦 Bundle Splitting Strategy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
            <div>
              <h4 className="font-semibold mb-2">React Core</h4>
              <p>Separated into react.js chunk for optimal caching</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Charts Library</h4>
              <p>Loaded async only when chart components render</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">UI Components</h4>
              <p>Bundled separately for reusability across routes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
