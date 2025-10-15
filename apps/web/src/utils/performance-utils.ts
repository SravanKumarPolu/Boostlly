// Performance optimization utilities for Boostlly

// Bundle size optimization
export const optimizeImports = {
  // Lazy load heavy libraries
  loadRecharts: () => import("recharts"),
  loadHtml2Canvas: () => import("html2canvas"),
  loadFuse: () => import("fuse.js"),

  // Lazy load UI components
  loadHeavyComponents: () => import("../components/recharts-component"),
  loadAdvancedFeatures: () => import("../components/advanced-lazy-loader"),
  loadLoadingFallbacks: () => import("../components/loading-fallbacks"),
};

// Memory management
export class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, any>();
  private maxCacheSize = 50; // Maximum number of cached items

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): void {
    performance.mark(`${name}-start`);
  }

  endTiming(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    const duration = measure.duration;

    this.metrics.set(name, duration);

    // Clean up marks and measures
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  getAverageTiming(name: string): number {
    const timings = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith(name))
      .map(([, value]) => value);

    if (timings.length === 0) return 0;

    return timings.reduce((sum, timing) => sum + timing, 0) / timings.length;
  }
}

// Image optimization
export const imageOptimizer = {
  // Lazy load images with intersection observer
  lazyLoadImages: (selector: string = "img[data-src]"): void => {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll(selector).forEach((img) => {
        imageObserver.observe(img);
      });
    }
  },

  // Preload critical images
  preloadImages: (urls: string[]): void => {
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Generate responsive image srcset
  generateSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(", ");
  },
};

// Code splitting utilities
export const codeSplitting = {
  // Dynamic import with retry
  dynamicImport: async <T>(
    importFn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error("Max retries exceeded");
  },

  // Preload modules
  preloadModule: (modulePath: string): void => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = modulePath;
    document.head.appendChild(link);
  },

  // Critical path optimization
  loadCriticalPath: async (): Promise<void> => {
    const criticalModules = [
      () => import("react"),
      () => import("react-dom"),
      () => import("../components/loading-fallbacks"),
    ];

    await Promise.all(criticalModules.map((module) => module()));
  },
};

// Bundle analysis
export const bundleAnalyzer = {
  // Get chunk information
  getChunkInfo: (): Promise<any> => {
    return new Promise((resolve) => {
      if ("webpackChunkName" in window) {
        const chunks = (window as any).__webpack_require__.cache;
        resolve(chunks);
      } else {
        resolve({});
      }
    });
  },

  // Monitor bundle size
  monitorBundleSize: (): void => {
    if (!window.PerformanceObserver) {
      console.warn("PerformanceObserver not supported for bundle monitoring");
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "resource") {
            const resource = entry as PerformanceResourceTiming;
            if (
              resource.name.includes(".js") ||
              resource.name.includes(".css")
            ) {
              console.log(
                `Bundle loaded: ${resource.name} (${resource.transferSize} bytes)`,
              );
            }
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });
    } catch (error) {
      console.error("Error setting up bundle monitoring:", error);
    }
  },
};

// Web Vitals monitoring
export const webVitals = {
  // Measure Core Web Vitals
  measureWebVitals: (): void => {
    if (!window.PerformanceObserver) {
      console.warn("PerformanceObserver not supported");
      return;
    }

    try {
      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (
            entry.entryType === "paint" &&
            entry.name === "first-contentful-paint"
          ) {
            console.log("FCP:", entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ["paint"] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log("LCP:", lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        console.log("CLS:", clsValue);
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log("FID:", (entry as any).processingStart - entry.startTime);
        });
      });

      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.error("Error setting up Web Vitals monitoring:", error);
    }
  },
};

// Service Worker utilities
export const serviceWorkerUtils = {
  // Check if service worker is supported
  isSupported: (): boolean => {
    return "serviceWorker" in navigator;
  },

  // Register service worker with error handling
  register: async (
    swPath: string = "/sw.js",
  ): Promise<ServiceWorkerRegistration | null> => {
    if (!serviceWorkerUtils.isSupported()) {
      console.warn("Service Worker not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  },

  // Update service worker
  update: async (): Promise<void> => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
};

// Cache management
export const cacheManager = {
  // Clear all caches
  clearAll: async (): Promise<void> => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  },

  // Get cache size
  getCacheSize: async (): Promise<number> => {
    if (!("caches" in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  },
};

// Export all utilities
export const performanceUtils = {
  optimizeImports,
  MemoryManager,
  PerformanceMonitor,
  imageOptimizer,
  codeSplitting,
  bundleAnalyzer,
  webVitals,
  serviceWorkerUtils,
  cacheManager,
};

export default performanceUtils;
