/**
 * Chunk Loading Utilities
 * Handles chunk loading errors and provides retry mechanisms
 */

// Global chunk loading error handler
let chunkLoadRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Store failed chunks to avoid infinite retry loops
const failedChunks = new Set<string>();

/**
 * Handle chunk loading errors with retry logic
 */
export function handleChunkLoadError(
  error: Error,
  chunkId?: string | number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if this chunk has already failed too many times
    if (chunkId && failedChunks.has(String(chunkId))) {
      console.error(`Chunk ${chunkId} has failed too many times, giving up`);
      reject(error);
      return;
    }

    // Check retry count
    if (chunkLoadRetryCount >= MAX_RETRY_ATTEMPTS) {
      console.error("Max chunk loading retry attempts reached");
      failedChunks.add(String(chunkId));
      reject(error);
      return;
    }

    chunkLoadRetryCount++;

    console.warn(
      `Chunk loading failed, retrying in ${RETRY_DELAY}ms... (attempt ${chunkLoadRetryCount}/${MAX_RETRY_ATTEMPTS})`,
    );

    // Retry after delay
    setTimeout(() => {
      // Force a page reload to retry chunk loading
      window.location.reload();
    }, RETRY_DELAY);
  });
}

/**
 * Reset chunk loading retry count
 */
export function resetChunkLoadRetryCount(): void {
  chunkLoadRetryCount = 0;
  failedChunks.clear();
}

/**
 * Check if chunk loading is experiencing issues
 */
export function isChunkLoadingUnhealthy(): boolean {
  return chunkLoadRetryCount > 0;
}

/**
 * Get chunk loading health status
 */
export function getChunkLoadingHealth(): {
  isHealthy: boolean;
  retryCount: number;
  maxRetries: number;
  failedChunks: string[];
} {
  return {
    isHealthy: chunkLoadRetryCount === 0,
    retryCount: chunkLoadRetryCount,
    maxRetries: MAX_RETRY_ATTEMPTS,
    failedChunks: Array.from(failedChunks),
  };
}

/**
 * Preload critical chunks to prevent loading issues
 */
export function preloadCriticalChunks(): void {
  if (typeof window === "undefined") return;

  const criticalChunks = [
    "/_next/static/chunks/app/layout.js",
    "/_next/static/chunks/app/page.js",
    "/_next/static/chunks/webpack.js",
  ];

  criticalChunks.forEach((chunkUrl) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = chunkUrl;
    document.head.appendChild(link);
  });
}

/**
 * Initialize chunk loading error handling
 */
export function initializeChunkLoadingHandling(): void {
  if (typeof window === "undefined") return;

  // Listen for chunk loading errors
  window.addEventListener("error", (event) => {
    if (event.error && event.error.name === "ChunkLoadError") {
      console.warn(
        "Chunk loading error detected, initializing retry mechanism",
      );
      handleChunkLoadError(event.error);
    }
  });

  // Listen for unhandled promise rejections (chunk loading failures)
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && event.reason.name === "ChunkLoadError") {
      console.warn(
        "Unhandled chunk loading rejection, initializing retry mechanism",
      );
      event.preventDefault(); // Prevent default handling
      handleChunkLoadError(event.reason);
    }
  });

  // Preload critical chunks
  preloadCriticalChunks();

  // Reset retry count on successful page load
  window.addEventListener("load", () => {
    resetChunkLoadRetryCount();
  });
}

/**
 * Force reload with cache clearing
 */
export function forceReloadWithCacheClear(): void {
  if (typeof window === "undefined") return;

  // Clear service worker cache
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }

  // Clear browser cache for this domain
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.includes("boostlly") || name.includes("next")) {
          caches.delete(name);
        }
      });
    });
  }

  // Force reload
  window.location.reload();
}

export default {
  handleChunkLoadError,
  resetChunkLoadRetryCount,
  isChunkLoadingUnhealthy,
  getChunkLoadingHealth,
  preloadCriticalChunks,
  initializeChunkLoadingHandling,
  forceReloadWithCacheClear,
};
