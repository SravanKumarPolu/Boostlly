// Boostlly Service Worker
// Advanced caching and offline functionality

// UPDATE THIS VERSION NUMBER WITH EACH DEPLOYMENT TO FORCE CACHE REFRESH
// This file is automatically updated by scripts/update-version.js during build
const VERSION = "0.1.0"; // Updated: 2025-12-19T06:13:01.623Z
const BUILD_TIME = "20251219061301"; // Format: YYYYMMDDHHmmss

const CACHE_NAME = `boostlly-v${VERSION}`;
const STATIC_CACHE = `boostlly-static-v${VERSION}-${BUILD_TIME}`;
const DYNAMIC_CACHE = `boostlly-dynamic-v${VERSION}-${BUILD_TIME}`;
const API_CACHE = `boostlly-api-v${VERSION}-${BUILD_TIME}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Static assets to cache immediately (only actual files, not directories)
// Note: _next/static/* files are cached on-demand during fetch
const STATIC_ASSETS = [
  "/manifest.json",
  "/offline.html",
  // Don't pre-cache directories or the root - they'll be cached on first fetch
];

// API endpoints to cache
const API_ENDPOINTS = [
  "https://api.quotable.io",
  "https://zenquotes.io",
  "https://quotes.rest",
  "https://favqs.com",
  "https://quotegarden.herokuapp.com",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing service worker v${VERSION} (Build: ${BUILD_TIME})...`);
  console.log("[SW] 🚀 This will clear old caches and force fresh content on mobile!");

  event.waitUntil(
    Promise.all([
      // Cache essential static assets (only files that we know exist)
      caches.open(STATIC_CACHE).then(async (cache) => {
        console.log("[SW] Pre-caching essential assets...");
        // Cache each asset individually to avoid one failure breaking everything
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`[SW] ✓ Cached: ${url}`);
          } catch (err) {
            // Log but don't fail - some assets may not exist yet
            console.log(`[SW] ⚠️ Couldn't pre-cache ${url} (will cache on first request)`);
          }
        });
        await Promise.allSettled(cachePromises);
        console.log("[SW] Pre-cache complete (errors are OK - assets cached on-demand)");
      }),
      // Skip waiting to activate immediately - critical for updates
      self.skipWaiting(),
    ]),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`[SW] ✅ Activating service worker v${VERSION}...`);

  event.waitUntil(
    Promise.all([
      // AGGRESSIVE cache cleanup - delete ALL old caches
      caches.keys().then((cacheNames) => {
        const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
        const deletedCaches = [];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that's not in our current version list
            // Also delete any cache that starts with "boostlly" but has a different version
            const isCurrentCache = currentCaches.includes(cacheName);
            const isOldBoostllyCache = cacheName.startsWith('boostlly') && !isCurrentCache;
            
            if (!isCurrentCache || isOldBoostllyCache) {
              console.log("[SW] 🗑️  Deleting old cache:", cacheName);
              deletedCaches.push(cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          }),
        ).then(() => {
          if (deletedCaches.length > 0) {
            console.log(`[SW] ✨ Cleared ${deletedCaches.length} old cache(s). Fresh content loaded!`);
          } else {
            console.log("[SW] ✨ No old caches to clear - this is a fresh install or already up to date");
          }
        });
      }),
      // Take control of all clients immediately - CRITICAL for mobile updates
      self.clients.claim().then(() => {
        console.log("[SW] 📱 Taking control of all pages immediately");
        // Notify all clients about the new version and force reload
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
          let notifiedCount = 0;
          clients.forEach((client) => {
            console.log(`[SW] 📣 Notifying client about update: ${client.url}`);
            client.postMessage({
              type: "VERSION_UPDATE",
              version: VERSION,
              buildTime: BUILD_TIME,
              forceReload: true, // Tell clients to reload
            });
            notifiedCount++;
          });
          console.log(`[SW] 📣 Notified ${notifiedCount} client(s) about v${VERSION}`);
        });
      }),
    ]),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Determine caching strategy based on request type
  const strategy = getCacheStrategy(request);

  event.respondWith(handleRequest(request, strategy));
});

// Determine caching strategy for different types of requests
function getCacheStrategy(request) {
  const url = new URL(request.url);

  // Static assets - cache first
  if (isStaticAsset(url)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // API requests - network first with fallback
  if (isApiRequest(url)) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // HTML pages - network first to always get latest updates (especially important for mobile)
  // NEVER cache HTML to ensure users always get the latest version
  if (request.headers.get("accept")?.includes("text/html")) {
    return CACHE_STRATEGIES.NETWORK_ONLY;
  }

  // Default to cache first for other resources
  return CACHE_STRATEGIES.CACHE_FIRST;
}

// Check if request is for static assets
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".eot")
  );
}

// Check if request is for API endpoints
function isApiRequest(url) {
  return (
    API_ENDPOINTS.some((endpoint) => url.href.startsWith(endpoint)) ||
    url.pathname.startsWith("/api/")
  );
}

// Handle requests with different caching strategies
async function handleRequest(request, strategy) {
  const url = new URL(request.url);

  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request);

      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request);

      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request);

      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await networkOnly(request);

      default:
        return await cacheFirst(request);
    }
  } catch (error) {
    console.error("[SW] Error handling request:", error);
    // Fallback to offline page or cached response
    return await getOfflineFallback(request);
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("[SW] Serving from cache:", request.url);
    return cachedResponse;
  }

  console.log("[SW] Fetching from network:", request.url);
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    const cache = await getCacheForRequest(request);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// Network First Strategy
async function networkFirst(request) {
  try {
    console.log("[SW] Fetching from network first:", request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await getCacheForRequest(request);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  // Fetch from network in background
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await getCacheForRequest(request);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, ignore
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    console.log("[SW] Serving stale while revalidating:", request.url);
    // Don't wait for network response
    networkPromise;
    return cachedResponse;
  }

  // Wait for network response if no cache
  console.log("[SW] No cache, waiting for network:", request.url);
  return await networkPromise;
}

// Network Only Strategy - Never cache, always fetch fresh
async function networkOnly(request) {
  console.log("[SW] Network only (no cache):", request.url);
  return await fetch(request);
}

// Get appropriate cache for request type
async function getCacheForRequest(request) {
  if (isStaticAsset(new URL(request.url))) {
    return await caches.open(STATIC_CACHE);
  } else if (isApiRequest(new URL(request.url))) {
    return await caches.open(API_CACHE);
  } else {
    return await caches.open(DYNAMIC_CACHE);
  }
}

// Get offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return cached response if available
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline page for HTML requests
  if (request.headers.get("accept")?.includes("text/html")) {
    const offlineResponse = await caches.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }
  }

  // Return a basic offline response
  return new Response("Offline - Content not available", {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

// Message handling for cache management
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_CACHE_SIZE") {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

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
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("[SW] Performing background sync...");
  // Implement background sync logic here
}

// Push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || "New motivational quote available!",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "View Quote",
          icon: "/icon-192x192.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icon-192x192.png",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Boostlly", options),
    );
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Periodic update check - check for new service worker every 15 minutes
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_FOR_UPDATES") {
    console.log("[SW] 🔄 Checking for updates...");
    self.registration.update();
  }
});

// Auto-check for updates when service worker becomes active
if (self.registration) {
  // Check for updates every 2 minutes for faster update detection
  setInterval(() => {
    console.log("[SW] ⏰ Auto-checking for updates...");
    self.registration.update();
  }, 2 * 60 * 1000); // 2 minutes (faster than 15 minutes)
}

console.log(`[SW] 🎉 Service worker v${VERSION} loaded successfully (Build: ${BUILD_TIME})`);
console.log("[SW] 📱 Mobile caching optimized - Users will get fresh content on reload!");
console.log("[SW] ⏰ Auto-update checks every 2 minutes");
