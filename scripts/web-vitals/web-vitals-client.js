// Web Vitals Monitoring Script
(function () {
  "use strict";

  // Core Web Vitals thresholds
  const thresholds = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
    TBT: { good: 200, poor: 600 },
    SI: { good: 3400, poor: 5800 },
  };

  // Store metrics locally
  const metrics = {};

  // Get metric rating
  function getRating(metric, value) {
    const threshold = thresholds[metric];
    if (!threshold) return "unknown";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  // Send metric to analytics
  function sendMetric(name, value, rating) {
    // Store locally
    metrics[name] = { value, rating, timestamp: Date.now() };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Web Vital [${name}]: ${value}ms (rating: ${rating})`);
    }

    // Send to analytics service (optional)
    if (typeof gtag !== "undefined") {
      gtag("event", "web_vitals", {
        event_category: "Web Vitals",
        event_label: name,
        value: Math.round(value),
        custom_map: {
          metric_rating: rating,
        },
      });
    }
  }

  // Monitor First Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            const rating = getRating("FCP", entry.startTime);
            sendMetric("FCP", entry.startTime, rating);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (e) {
      console.warn("FCP monitoring failed:", e);
    }

    // Monitor Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const rating = getRating("LCP", lastEntry.startTime);
        sendMetric("LCP", lastEntry.startTime, rating);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP monitoring failed:", e);
    }

    // Monitor First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const rating = getRating(
            "FID",
            entry.processingStart - entry.startTime,
          );
          sendMetric("FID", entry.processingStart - entry.startTime, rating);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID monitoring failed:", e);
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
        const rating = getRating("CLS", clsValue);
        sendMetric("CLS", clsValue, rating);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS monitoring failed:", e);
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
        const rating = getRating("TBT", totalBlockingTime);
        sendMetric("TBT", totalBlockingTime, rating);
      });
      tbtObserver.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      console.warn("TBT monitoring failed:", e);
    }
  }

  // Monitor Time to First Byte (TTFB)
  window.addEventListener("load", () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const rating = getRating("TTFB", ttfb);
      sendMetric("TTFB", ttfb, rating);
    }
  });

  // Calculate Speed Index (simplified)
  window.addEventListener("load", () => {
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint",
    );

    if (fcpEntry) {
      // Simplified Speed Index calculation
      const speedIndex = fcpEntry.startTime * 1.5; // Rough approximation
      const rating = getRating("SI", speedIndex);
      sendMetric("SI", speedIndex, rating);
    }
  });

  // Expose metrics for debugging
  window.webVitalsMetrics = metrics;

  // Generate report on page unload
  window.addEventListener("beforeunload", () => {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: metrics,
    };

    // Store in localStorage for later analysis
    try {
      const existingReports = JSON.parse(
        localStorage.getItem("webVitalsReports") || "[]",
      );
      existingReports.push(report);

      // Keep only last 100 reports
      if (existingReports.length > 100) {
        existingReports.splice(0, existingReports.length - 100);
      }

      localStorage.setItem("webVitalsReports", JSON.stringify(existingReports));
    } catch (e) {
      console.warn("Failed to store Web Vitals report:", e);
    }
  });
})();
