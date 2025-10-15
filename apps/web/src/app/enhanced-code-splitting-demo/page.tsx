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

// Lazy load different chart components - Mock vs Real
const MockChartComponent = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="line" title="Mock Chart Component" />
    ),
  })),
);

const RechartsLineChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="line" title="Real Recharts Line Chart" />
    ),
  })),
);

const RechartsBarChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="bar" title="Real Recharts Bar Chart" />
    ),
  })),
);

const RechartsPieChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="pie" title="Real Recharts Pie Chart" />
    ),
  })),
);

const RechartsDoughnutChart = React.lazy(() =>
  import("../../components/recharts-component").then((module) => ({
    default: (props: any) => (
      <module.default
        {...props}
        type="doughnut"
        title="Real Recharts Doughnut Chart"
      />
    ),
  })),
);

// Mock data for charts
const mockData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Sales Data",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: "#7C3AED",
      borderColor: "#7C3AED",
    },
  ],
};

const generateRandomData = () => ({
  labels: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"],
  datasets: [
    {
      label: "Performance",
      data: Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 100) + 10,
      ),
      backgroundColor: "#7C3AED",
      borderColor: "#7C3AED",
    },
  ],
});

// Loading strategy selector
const LoadingStrategySelector: React.FC<{
  strategy: string;
  onStrategyChange: (strategy: string) => void;
}> = ({ strategy, onStrategyChange }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Loading Strategy
    </h3>
    <div className="flex flex-wrap gap-3">
      {[
        {
          id: "immediate",
          label: "Immediate Loading",
          description: "Loads components right away",
        },
        {
          id: "viewport",
          label: "Viewport Loading",
          description: "Loads when scrolling into view",
        },
        {
          id: "interaction",
          label: "User Interaction",
          description: "Loads on button click",
        },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onStrategyChange(item.id)}
          className={`p-4 rounded-lg border-2 transition-all ${
            strategy === item.id
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }`}
        >
          <div className="font-medium">{item.label}</div>
          <div className="text-sm text-gray-500 mt-1">{item.description}</div>
        </button>
      ))}
    </div>
  </div>
);

// Chart type selector
const ChartTypeSelector: React.FC<{
  chartTypes: string[];
  onToggleChart: (type: string) => void;
}> = ({ chartTypes, onToggleChart }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Chart Components
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
          type: "mock",
          label: "Mock Chart",
          description: "Lightweight mock component",
        },
        {
          type: "line",
          label: "Line Chart",
          description: "Real Recharts line chart",
        },
        {
          type: "bar",
          label: "Bar Chart",
          description: "Real Recharts bar chart",
        },
        {
          type: "pie",
          label: "Pie Chart",
          description: "Real Recharts pie chart",
        },
        {
          type: "doughnut",
          label: "Doughnut Chart",
          description: "Real Recharts doughnut chart",
        },
      ].map((chart) => (
        <div
          key={chart.type}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            chartTypes.includes(chart.type)
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }`}
          onClick={() => onToggleChart(chart.type)}
        >
          <div className="font-medium">{chart.label}</div>
          <div className="text-sm text-gray-500 mt-1">{chart.description}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function EnhancedCodeSplittingDemoPage() {
  const [loadingStrategy, setLoadingStrategy] = useState("immediate");
  const [activeCharts, setActiveCharts] = useState<string[]>(["mock"]);
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(
    new Set(),
  );
  const [showBundleAnalysis, setShowBundleAnalysis] = useState(false);
  const [data, setData] = useState(mockData);

  const handleComponentLoad = (componentName: string) => {
    setLoadedComponents((prev) => new Set([...prev, componentName]));
  };

  const toggleChart = (chartType: string) => {
    setActiveCharts((prev) => {
      if (prev.includes(chartType)) {
        return prev.filter((type) => type !== chartType);
      } else {
        return [...prev, chartType];
      }
    });
  };

  const loadComponent = (componentName: string) => {
    handleComponentLoad(componentName);
  };

  const generateNewData = () => {
    setData(generateRandomData());
  };

  const renderChart = (chartType: string) => {
    const chartProps = {
      data,
      height: 400,
    };

    switch (chartType) {
      case "mock":
        return <MockChartComponent {...chartProps} />;
      case "line":
        return <RechartsLineChart {...chartProps} />;
      case "bar":
        return <RechartsBarChart {...chartProps} />;
      case "pie":
        return <RechartsPieChart {...chartProps} />;
      case "doughnut":
        return <RechartsDoughnutChart {...chartProps} />;
      default:
        return null;
    }
  };

  const renderChartWithStrategy = (chartType: string) => {
    const chartComponent = renderChart(chartType);

    if (loadingStrategy === "immediate") {
      return (
        <React.Suspense fallback={<ChartSkeleton />}>
          {chartComponent}
        </React.Suspense>
      );
    }

    if (loadingStrategy === "viewport") {
      return (
        <ViewportLazyLoader fallback={<ChartSkeleton />}>
          <React.Suspense fallback={<ChartSkeleton />}>
            {chartComponent}
          </React.Suspense>
        </ViewportLazyLoader>
      );
    }

    if (loadingStrategy === "interaction") {
      return (
        <div className="space-y-4">
          <button
            onClick={() => loadComponent(chartType)}
            className="w-full p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors font-medium"
          >
            Load {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </button>
          {loadedComponents.has(chartType) && (
            <React.Suspense fallback={<ChartSkeleton />}>
              {chartComponent}
            </React.Suspense>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Code Splitting Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Comprehensive demonstration with both mock and real chart components
            using Recharts
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Dynamic Imports
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              React.lazy
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Recharts Integration
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Bundle Splitting
            </span>
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Controls */}
        <LoadingStrategySelector
          strategy={loadingStrategy}
          onStrategyChange={setLoadingStrategy}
        />

        <ChartTypeSelector
          chartTypes={activeCharts}
          onToggleChart={toggleChart}
        />

        {/* Data Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Data Controls
          </h3>
          <div className="flex gap-4">
            <button
              onClick={generateNewData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Random Data
            </button>
            <button
              onClick={() => setData(mockData)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset to Default Data
            </button>
          </div>
        </div>

        {/* Charts Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {activeCharts.map((chartType) => (
            <div key={chartType} className="space-y-4">
              {renderChartWithStrategy(chartType)}
            </div>
          ))}
        </div>

        {/* Bundle Analysis */}
        <div className="bg-white rounded-lg shadow-lg border p-6 mb-8">
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
        </div>

        {/* Implementation Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-800 mb-4">
            🚀 Enhanced Implementation Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-700 mb-2">
                Code Splitting Strategies:
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
                Chart Components:
              </h3>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>📊 Mock lightweight chart component</li>
                <li>📈 Real Recharts line charts</li>
                <li>📊 Real Recharts bar charts</li>
                <li>🥧 Real Recharts pie charts</li>
                <li>🍩 Real Recharts doughnut charts</li>
                <li>⚡ Heavy library lazy loading</li>
                <li>🎨 Responsive and interactive</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-2">
              Performance Benefits:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-600">
              <div>
                <h5 className="font-medium">Bundle Size:</h5>
                <p>Recharts (~200KB) loads only when needed</p>
              </div>
              <div>
                <h5 className="font-medium">Loading Strategy:</h5>
                <p>Multiple strategies for different use cases</p>
              </div>
              <div>
                <h5 className="font-medium">User Experience:</h5>
                <p>Smooth loading with skeleton fallbacks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
