import * as React from "react";
import { useEffect, useState } from "react";

interface WebVitalsMetrics {
  FCP?: { value: number; rating: string; timestamp: number };
  LCP?: { value: number; rating: string; timestamp: number };
  FID?: { value: number; rating: string; timestamp: number };
  CLS?: { value: number; rating: string; timestamp: number };
  TTFB?: { value: number; rating: string; timestamp: number };
  TBT?: { value: number; rating: string; timestamp: number };
  SI?: { value: number; rating: string; timestamp: number };
}

interface WebVitalsMonitorProps {
  enabled?: boolean;
  showInDevelopment?: boolean;
}

export function WebVitalsMonitor({
  enabled = true,
  showInDevelopment = false,
}: WebVitalsMonitorProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Only show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === "development" || showInDevelopment;
    setIsVisible(shouldShow);

    // Load existing metrics from localStorage
    try {
      const storedReports = localStorage.getItem("webVitalsReports");
      if (storedReports) {
        const reports = JSON.parse(storedReports);
        const latestReport = reports[reports.length - 1];
        if (latestReport?.metrics) {
          setMetrics(latestReport.metrics);
        }
      }
    } catch (error) {
      console.warn("Failed to load Web Vitals reports:", error);
    }

    // Poll for updates
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.webVitalsMetrics) {
        setMetrics(window.webVitalsMetrics);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, showInDevelopment]);

  if (!isVisible) return null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600 bg-green-100";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === "CLS") return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Core Web Vitals
      </h3>
      <div className="space-y-2">
        {Object.entries(metrics).map(([metric, data]) => (
          <div
            key={metric}
            className="flex items-center justify-between text-xs"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {metric}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                {formatValue(data.value, metric)}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(data.rating)}`}
              >
                {data.rating.replace("-", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(metrics).length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Loading metrics...
        </p>
      )}
    </div>
  );
}
