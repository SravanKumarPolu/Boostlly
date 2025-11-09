"use client";

import React, { useEffect, useState } from "react";

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  cacheSize: number;
  registration: ServiceWorkerRegistration | null;
}

export const ServiceWorkerManager: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true, // Default to true, will be updated on client
    cacheSize: 0,
    registration: null,
  });

  const [showNotification, setShowNotification] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const [isLocalDevelopment, setIsLocalDevelopment] = useState(false);

  // Define checkCacheSize function before useEffect
  const checkCacheSize = async () => {
    if (swState.registration?.active) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise<number>((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.cacheSize);
          };
        });

        swState.registration.active.postMessage({ type: "GET_CACHE_SIZE" }, [
          messageChannel.port2,
        ]);

        const cacheSize = await promise;
        setSwState((prev) => ({ ...prev, cacheSize }));
      } catch (error) {
        console.error("Error checking cache size:", error);
      }
    }
  };

  useEffect(() => {
    // Mark component as mounted and set client-only values
    setMounted(true);
    
    // Check if we're in local development
    setIsLocalDevelopment(
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );
    
    // Set initial online status on client
    setSwState((prev) => ({ ...prev, isOnline: navigator.onLine }));

    // Check if service worker is supported
    if ("serviceWorker" in navigator) {
      setSwState((prev) => ({ ...prev, isSupported: true }));
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () =>
      setSwState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setSwState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for version updates from service worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "VERSION_UPDATE") {
        const newVersion = event.data.version;
        console.log(
          `[App] 🆕 New version detected: v${newVersion} (Build: ${event.data.buildTime})`
        );
        
        // If service worker requests force reload, do it immediately
        if (event.data.forceReload) {
          console.log("[App] 🔃 Service worker requesting immediate reload for new version...");
          
          // Check if we've already reloaded for this version
          const reloadKey = `boostlly-reloaded-for-${newVersion}`;
          const hasReloaded = sessionStorage.getItem(reloadKey);
          
          if (!hasReloaded) {
            // Mark as reloaded BEFORE reloading to prevent reload loops
            sessionStorage.setItem(reloadKey, "true");
            
            // Give service worker time to take control
            setTimeout(() => {
              console.log("[App] 🔃 Reloading now to activate new version...");
              window.location.reload();
            }, 500);
            return;
          } else {
            console.log("[App] ℹ️ Already reloaded for v${newVersion}, skipping reload");
          }
        }
        
        // Check if we've already shown notification in this session
        const sessionKey = `boostlly-shown-notification-${newVersion}`;
        if (sessionStorage.getItem(sessionKey)) {
          console.log(`[App] ℹ️ Update notification for v${newVersion} already shown in this session`);
          return;
        }
        
        // Check if user has already dismissed this version's notification
        const dismissedVersions = JSON.parse(
          localStorage.getItem("boostlly-dismissed-update-versions") || "[]"
        );
        
        if (!dismissedVersions.includes(newVersion)) {
          // Show update notification only if not dismissed before
          setCurrentVersion(newVersion);
          setShowNotification(false); // Disabled update notifications
          setHasShownNotification(true);
          // Mark as shown in this session
          sessionStorage.setItem(sessionKey, "true");
        } else {
          console.log(`[App] ℹ️ Update notification for v${newVersion} already dismissed`);
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);

    // Check cache size periodically
    const interval = setInterval(checkCacheSize, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      clearInterval(interval);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Wait for page load
      if (document.readyState === "complete") {
        await doRegister();
      } else {
        window.addEventListener("load", doRegister);
      }
    } catch (error) {
      console.error("Service Worker registration setup failed:", error);
    }
  };

  const doRegister = async () => {
    try {
      // Fetch version.json to get cache buster
      let cacheBust = Date.now().toString();
      try {
        const versionResponse = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          cacheBust = versionData.cacheBuster || cacheBust;
        }
      } catch (e) {
        // Fallback to timestamp if version.json unavailable
        console.warn("[SW] Could not fetch version.json for cache busting", e);
      }

      // Add cache-busting parameter to force fetch of new service worker
      const registration = await navigator.serviceWorker.register(`/sw.js?v=${cacheBust}`, {
        scope: "/",
        updateViaCache: "none", // Critical: never use cached service worker
      });

      setSwState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Initial cache size check
      checkCacheSize();

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              showUpdateNotification();
            }
          });
        }
      });

      // Check if there's an update waiting
      if (registration.waiting) {
        showUpdateNotification();
      }

      console.log("✅ Service Worker registered successfully");
      console.log("Registration:", registration);
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      setSwState((prev) => ({ ...prev, isRegistered: false }));
    }
  };

  const showUpdateNotification = (version?: string) => {
    // If version is provided, check if it's been dismissed
    if (version) {
      const dismissedVersions = JSON.parse(
        localStorage.getItem("boostlly-dismissed-update-versions") || "[]"
      );
      
      if (dismissedVersions.includes(version)) {
        console.log(`[App] ℹ️ Update notification for v${version} already dismissed`);
        return;
      }
      
      setCurrentVersion(version);
    }
    
    setShowNotification(true);
  };
  
  const dismissNotification = () => {
    // Save the current version to localStorage so it won't show again
    if (currentVersion) {
      const dismissedVersions = JSON.parse(
        localStorage.getItem("boostlly-dismissed-update-versions") || "[]"
      );
      
      if (!dismissedVersions.includes(currentVersion)) {
        dismissedVersions.push(currentVersion);
        localStorage.setItem(
          "boostlly-dismissed-update-versions",
          JSON.stringify(dismissedVersions)
        );
        console.log(`[App] 📝 Dismissed update notification for v${currentVersion}`);
      }
      
      // Also mark as shown in this session to prevent re-showing
      const sessionKey = `boostlly-shown-notification-${currentVersion}`;
      sessionStorage.setItem(sessionKey, "true");
    }
    
    setShowNotification(false);
  };

  const updateServiceWorker = () => {
    // Clear dismissed versions since we're updating to a new version
    localStorage.removeItem("boostlly-dismissed-update-versions");
    
    // Clear all session notification markers
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith("boostlly-shown-notification-")) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear reload attempts to allow fresh reload
    sessionStorage.removeItem("version-reload-attempts");
    
    console.log("[App] 🔄 Updating service worker and clearing dismissed versions");
    
    if (swState.registration?.waiting) {
      swState.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    
    // Reload to activate new version
    window.location.reload();
  };

  const clearCache = async () => {
    if (swState.registration?.active) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise<boolean>((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.success);
          };
        });

        swState.registration.active.postMessage({ type: "CLEAR_CACHE" }, [
          messageChannel.port2,
        ]);

        const success = await promise;
        if (success) {
          setSwState((prev) => ({ ...prev, cacheSize: 0 }));
          alert("Cache cleared successfully!");
        }
      } catch (error) {
        console.error("Error clearing cache:", error);
        alert("Failed to clear cache");
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Update Notification - Removed */}

      {/* Service Worker Status (Local Development Only) */}
      {isLocalDevelopment && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-40 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">Service Worker Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Supported:</span>
              <span
                className={
                  swState.isSupported ? "text-green-400" : "text-red-400"
                }
              >
                {swState.isSupported ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Registered:</span>
              <span
                className={
                  swState.isRegistered ? "text-green-400" : "text-red-400"
                }
              >
                {swState.isRegistered ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Online:</span>
              <span
                className={swState.isOnline ? "text-green-400" : "text-red-400"}
              >
                {swState.isOnline ? "🟢" : "🔴"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cache:</span>
              <span className="text-blue-400">
                {formatBytes(swState.cacheSize)}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={clearCache}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs w-full"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!swState.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
          <span className="text-sm">
            📡 You&apos;re offline - Some features may be limited
          </span>
        </div>
      )}
    </>
  );
};

// Hook for service worker functionality
export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(true); // Default to true, will be updated on client
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Set initial online status on client
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => setSwRegistration(registration))
        .catch((error) => console.error("SW registration failed:", error));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && swRegistration) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  return {
    isOnline,
    swRegistration,
    requestNotificationPermission,
    showNotification,
  };
};
