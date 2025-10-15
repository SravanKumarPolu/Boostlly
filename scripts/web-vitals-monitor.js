#!/usr/bin/env node

/**
 * Core Web Vitals Monitor
 * Monitors and reports on Core Web Vitals metrics
 */

const fs = require("fs");
const path = require("path");

class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      FCP: [], // First Contentful Paint
      LCP: [], // Largest Contentful Paint
      FID: [], // First Input Delay
      CLS: [], // Cumulative Layout Shift
      TTFB: [], // Time to First Byte
      TBT: [], // Total Blocking Time
      SI: [], // Speed Index
    };

    this.thresholds = {
      FCP: { good: 1800, poor: 3000 }, // milliseconds
      LCP: { good: 2500, poor: 4000 }, // milliseconds
      FID: { good: 100, poor: 300 }, // milliseconds
      CLS: { good: 0.1, poor: 0.25 }, // score
      TTFB: { good: 800, poor: 1800 }, // milliseconds
      TBT: { good: 200, poor: 600 }, // milliseconds
      SI: { good: 3400, poor: 5800 }, // milliseconds
    };
  }

  // Generate Web Vitals monitoring script for client-side
  generateClientScript() {
    return `
// Web Vitals Monitoring Script
(function() {
  'use strict';

  // Core Web Vitals thresholds
  const thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    TBT: { good: 200, poor: 600 },
    SI: { good: 3400, poor: 5800 }
  };

  // Store metrics locally
  const metrics = {};

  // Get metric rating
  function getRating(metric, value) {
    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Send metric to analytics
  function sendMetric(name, value, rating) {
    // Store locally
    metrics[name] = { value, rating, timestamp: Date.now() };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`Web Vital [\${name}]: \${value}ms (rating: \${rating})\`);
    }
    
    // Send to analytics service (optional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        custom_map: {
          metric_rating: rating
        }
      });
    }
  }

  // Monitor First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const rating = getRating('FCP', entry.startTime);
            sendMetric('FCP', entry.startTime, rating);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP monitoring failed:', e);
    }

    // Monitor Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const rating = getRating('LCP', lastEntry.startTime);
        sendMetric('LCP', lastEntry.startTime, rating);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring failed:', e);
    }

    // Monitor First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const rating = getRating('FID', entry.processingStart - entry.startTime);
          sendMetric('FID', entry.processingStart - entry.startTime, rating);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring failed:', e);
    }

    // Monitor Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        const rating = getRating('CLS', clsValue);
        sendMetric('CLS', clsValue, rating);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring failed:', e);
    }

    // Monitor Total Blocking Time
    try {
      let totalBlockingTime = 0;
      const tbtObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        });
        const rating = getRating('TBT', totalBlockingTime);
        sendMetric('TBT', totalBlockingTime, rating);
      });
      tbtObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('TBT monitoring failed:', e);
    }
  }

  // Monitor Time to First Byte (TTFB)
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const rating = getRating('TTFB', ttfb);
      sendMetric('TTFB', ttfb, rating);
    }
  });

  // Calculate Speed Index (simplified)
  window.addEventListener('load', () => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      // Simplified Speed Index calculation
      const speedIndex = fcpEntry.startTime * 1.5; // Rough approximation
      const rating = getRating('SI', speedIndex);
      sendMetric('SI', speedIndex, rating);
    }
  });

  // Expose metrics for debugging
  window.webVitalsMetrics = metrics;

  // Generate report on page unload
  window.addEventListener('beforeunload', () => {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: metrics
    };
    
    // Store in localStorage for later analysis
    try {
      const existingReports = JSON.parse(localStorage.getItem('webVitalsReports') || '[]');
      existingReports.push(report);
      
      // Keep only last 100 reports
      if (existingReports.length > 100) {
        existingReports.splice(0, existingReports.length - 100);
      }
      
      localStorage.setItem('webVitalsReports', JSON.stringify(existingReports));
    } catch (e) {
      console.warn('Failed to store Web Vitals report:', e);
    }
  });
})();
`;
  }

  // Create Web Vitals monitoring component
  generateReactComponent() {
    return `
import * as React from 'react';
import { useEffect, useState } from 'react';

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
  showInDevelopment = false 
}: WebVitalsMonitorProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Only show in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || showInDevelopment;
    setIsVisible(shouldShow);

    // Load existing metrics from localStorage
    try {
      const storedReports = localStorage.getItem('webVitalsReports');
      if (storedReports) {
        const reports = JSON.parse(storedReports);
        const latestReport = reports[reports.length - 1];
        if (latestReport?.metrics) {
          setMetrics(latestReport.metrics);
        }
      }
    } catch (error) {
      console.warn('Failed to load Web Vitals reports:', error);
    }

    // Poll for updates
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.webVitalsMetrics) {
        setMetrics(window.webVitalsMetrics);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, showInDevelopment]);

  if (!isVisible) return null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'CLS') return value.toFixed(3);
    return \`\${Math.round(value)}ms\`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Core Web Vitals
      </h3>
      <div className="space-y-2">
        {Object.entries(metrics).map(([metric, data]) => (
          <div key={metric} className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {metric}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                {formatValue(data.value, metric)}
              </span>
              <span className={\`px-2 py-1 rounded text-xs font-medium \${getRatingColor(data.rating)}\`}>
                {data.rating.replace('-', ' ')}
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
`;
  }

  // Generate Lighthouse CI configuration
  generateLighthouseConfig() {
    return {
      ci: {
        collect: {
          url: [
            "http://localhost:3000",
            "http://localhost:3000/settings",
            "http://localhost:3000/collections",
          ],
          numberOfRuns: 3,
          settings: {
            chromeFlags: "--no-sandbox",
          },
        },
        assert: {
          assertions: {
            // Core Web Vitals
            "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
            "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
            "first-input-delay": ["warn", { maxNumericValue: 100 }],
            "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
            "total-blocking-time": ["warn", { maxNumericValue: 200 }],
            "speed-index": ["warn", { maxNumericValue: 3400 }],

            // Performance score
            "categories:performance": ["warn", { minScore: 0.8 }],

            // Accessibility
            "categories:accessibility": ["error", { minScore: 0.9 }],

            // Best practices
            "categories:best-practices": ["warn", { minScore: 0.8 }],

            // SEO
            "categories:seo": ["warn", { minScore: 0.8 }],

            // PWA
            "categories:pwa": ["warn", { minScore: 0.7 }],
          },
        },
        upload: {
          target: "temporary-public-storage",
        },
      },
    };
  }

  // Save generated files
  saveFiles() {
    const outputDir = "./scripts/web-vitals";

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save client-side script
    fs.writeFileSync(
      path.join(outputDir, "web-vitals-client.js"),
      this.generateClientScript(),
    );

    // Save React component
    fs.writeFileSync(
      path.join(outputDir, "web-vitals-monitor.tsx"),
      this.generateReactComponent(),
    );

    // Save Lighthouse config
    fs.writeFileSync(
      path.join(outputDir, "lighthouse-web-vitals.config.js"),
      `module.exports = ${JSON.stringify(this.generateLighthouseConfig(), null, 2)};`,
    );

    console.log("✅ Web Vitals monitoring files generated:");
    console.log(`   📄 ${outputDir}/web-vitals-client.js`);
    console.log(`   ⚛️  ${outputDir}/web-vitals-monitor.tsx`);
    console.log(`   🏆 ${outputDir}/lighthouse-web-vitals.config.js`);
  }

  // Generate report from collected metrics
  generateReport() {
    console.log("📊 Core Web Vitals Report");
    console.log("========================");

    const report = {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
      recommendations: this.getRecommendations(),
    };

    // Save report
    fs.writeFileSync("web-vitals-report.json", JSON.stringify(report, null, 2));
    console.log("📄 Report saved to: web-vitals-report.json");

    return report;
  }

  // Get performance recommendations
  getRecommendations() {
    return [
      {
        metric: "FCP",
        description: "First Contentful Paint",
        optimizations: [
          "Optimize critical rendering path",
          "Minimize render-blocking resources",
          "Use resource hints (preload, prefetch)",
        ],
      },
      {
        metric: "LCP",
        description: "Largest Contentful Paint",
        optimizations: [
          "Optimize images and videos",
          "Use efficient image formats (WebP, AVIF)",
          "Implement lazy loading",
          "Optimize server response times",
        ],
      },
      {
        metric: "FID",
        description: "First Input Delay",
        optimizations: [
          "Reduce JavaScript execution time",
          "Split long tasks",
          "Use web workers for heavy computations",
          "Optimize third-party scripts",
        ],
      },
      {
        metric: "CLS",
        description: "Cumulative Layout Shift",
        optimizations: [
          "Set size attributes for images and videos",
          "Reserve space for dynamic content",
          "Avoid inserting content above existing content",
          "Use transform animations instead of layout-triggering properties",
        ],
      },
    ];
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new WebVitalsMonitor();

  const command = process.argv[2];

  switch (command) {
    case "generate":
      monitor.saveFiles();
      break;
    case "report":
      monitor.generateReport();
      break;
    default:
      console.log("Usage: node web-vitals-monitor.js [generate|report]");
      console.log("  generate - Generate monitoring scripts and components");
      console.log("  report   - Generate performance report");
      break;
  }
}

module.exports = WebVitalsMonitor;
