"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChartSkeleton } from "../../components/loading-fallbacks";
import {
  ViewportLazyLoader,
  useLazyLoadingMetrics,
} from "../../components/lazy-loading-utils";

// Lazy load chart components with different loading strategies
const LineChart = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => <module.default {...props} type="line" />,
  })),
);

const BarChart = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => <module.default {...props} type="bar" />,
  })),
);

const PieChart = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => <module.default {...props} type="pie" />,
  })),
);

const DoughnutChart = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => <module.default {...props} type="doughnut" />,
  })),
);

// Mock data generator
const generateChartData = (type: string, count: number = 7) => {
  const labels = Array.from({ length: count }, (_, i) =>
    type === "line" || type === "bar" ? `Day ${i + 1}` : `Category ${i + 1}`,
  );

  const data = Array.from(
    { length: count },
    () => Math.floor(Math.random() * 100) + 10,
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
                "#FEF7FF",
              ],
        borderColor: "#7C3AED",
      },
    ],
  };
};

// Chart configuration component
const ChartConfig: React.FC<{
  onConfigChange: (config: any) => void;
}> = ({ onConfigChange }) => {
  const [config, setConfig] = useState({
    dataPoints: 7,
    chartType: "line",
    title: "Analytics Dashboard",
  });

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Chart Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Points
          </label>
          <select
            value={config.dataPoints}
            onChange={(e) =>
              handleChange("dataPoints", parseInt(e.target.value))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={5}>5 points</option>
            <option value={7}>7 points</option>
            <option value={10}>10 points</option>
            <option value={15}>15 points</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </label>
          <select
            value={config.chartType}
            onChange={(e) => handleChange("chartType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// Performance metrics display
const PerformanceMetrics: React.FC = () => {
  const { getMetrics } = useLazyLoadingMetrics();

  const metrics = {
    lineChart: getMetrics("LineChart"),
    barChart: getMetrics("BarChart"),
    pieChart: getMetrics("PieChart"),
    doughnutChart: getMetrics("DoughnutChart"),
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Loading Performance
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([chart, metric]) => (
          <div key={chart} className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metric ? `${metric.loadTime}ms` : "N/A"}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {chart.replace("Chart", " Chart")}
            </div>
            <div className="text-xs text-gray-500">
              Loads: {metric?.loadCount || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Dashboard
export default function AnalyticsPage() {
  const [config, setConfig] = useState({
    dataPoints: 7,
    chartType: "line",
    title: "Analytics Dashboard",
  });

  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });

  useEffect(() => {
    // Generate chart data only on client side
    setChartData(generateChartData(config.chartType, config.dataPoints));
  }, [config.chartType, config.dataPoints]);

  const [visibleCharts, setVisibleCharts] = useState({
    line: true,
    bar: false,
    pie: false,
    doughnut: false,
  });

  const toggleChart = (chartType: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({
      ...prev,
      [chartType]: !prev[chartType],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Demonstrating code splitting with lazy-loaded chart components
          </p>
        </div>

        {/* Configuration Panel */}
        <ChartConfig onConfigChange={setConfig} />

        {/* Performance Metrics */}
        <PerformanceMetrics />

        {/* Chart Toggle Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Chart Visibility
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(visibleCharts).map(([chartType, visible]) => (
              <button
                key={chartType}
                onClick={() =>
                  toggleChart(chartType as keyof typeof visibleCharts)
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  visible
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
              </button>
            ))}
          </div>
        </div>

        {/* Lazy Loaded Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleCharts.line && (
            <ViewportLazyLoader fallback={<ChartSkeleton />}>
              <React.Suspense fallback={<ChartSkeleton />}>
                <LineChart
                  data={chartData}
                  title={`${config.title} - Line Chart`}
                  height={400}
                />
              </React.Suspense>
            </ViewportLazyLoader>
          )}

          {visibleCharts.bar && (
            <ViewportLazyLoader fallback={<ChartSkeleton />}>
              <React.Suspense fallback={<ChartSkeleton />}>
                <BarChart
                  data={chartData}
                  title={`${config.title} - Bar Chart`}
                  height={400}
                />
              </React.Suspense>
            </ViewportLazyLoader>
          )}

          {visibleCharts.pie && (
            <ViewportLazyLoader fallback={<ChartSkeleton />}>
              <React.Suspense fallback={<ChartSkeleton />}>
                <PieChart
                  data={chartData}
                  title={`${config.title} - Pie Chart`}
                  height={400}
                />
              </React.Suspense>
            </ViewportLazyLoader>
          )}

          {visibleCharts.doughnut && (
            <ViewportLazyLoader fallback={<ChartSkeleton />}>
              <React.Suspense fallback={<ChartSkeleton />}>
                <DoughnutChart
                  data={chartData}
                  title={`${config.title} - Doughnut Chart`}
                  height={400}
                />
              </React.Suspense>
            </ViewportLazyLoader>
          )}
        </div>

        {/* Code Splitting Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🚀 Code Splitting Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Performance Improvements:</h4>
              <ul className="space-y-1">
                <li>• Faster initial page load</li>
                <li>• Reduced bundle size</li>
                <li>• On-demand loading</li>
                <li>• Better caching strategies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Implementation Features:</h4>
              <ul className="space-y-1">
                <li>• Dynamic imports with React.lazy</li>
                <li>• Viewport-based loading</li>
                <li>• Error boundaries</li>
                <li>• Loading fallbacks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
