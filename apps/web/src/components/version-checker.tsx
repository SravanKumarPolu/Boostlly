"use client";

import { useEffect, useState } from "react";

/**
 * Version Checker Component
 * 
 * Dynamically checks deployed version from version.json and service worker.
 * Compares build times to detect new deployments and auto-reloads.
 * 
 * This solves the issue where normal refresh shows cached old version,
 * but hard refresh (Cmd+Shift+R) shows new version.
 */

const VERSION_CHECK_INTERVAL = 60000; // Check every 60 seconds

interface VersionInfo {
  version: string;
  buildTime: string;
  timestamp: number;
  date: string;
}

export function VersionChecker() {
  const [hasChecked, setHasChecked] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkVersion = async () => {
      try {
        // Fetch version.json with cache-busting parameter
        const versionResponse = await fetch(`/version.json?v=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!versionResponse.ok) {
          console.warn("[VersionChecker] version.json not found, skipping check");
          return;
        }

        const deployedVersion: VersionInfo = await versionResponse.json();
        console.log(`[VersionChecker] Deployed version:`, deployedVersion);

        // If this is our first check, just store the version
        if (!currentVersion) {
          setCurrentVersion(deployedVersion);
          console.log("[VersionChecker] ✅ Initial version check complete");
          sessionStorage.removeItem("version-reload-attempts");
          return;
        }

        // Check if the deployed version is different from what we have
        if (deployedVersion.buildTime !== currentVersion.buildTime) {
          console.warn(
            `[VersionChecker] 🆕 New version detected! Current: ${currentVersion.buildTime}, Deployed: ${deployedVersion.buildTime}`
          );

          // Check if we've already tried to reload (prevent infinite loops)
          const reloadAttempts = parseInt(
            sessionStorage.getItem("version-reload-attempts") || "0"
          );

          if (reloadAttempts < 3) {
            console.log(
              `[VersionChecker] 🔄 Reloading to fetch new version (attempt ${reloadAttempts + 1}/3)...`
            );
            sessionStorage.setItem(
              "version-reload-attempts",
              String(reloadAttempts + 1)
            );

            // Tell service worker to check for updates
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: "CHECK_FOR_UPDATES",
              });
            }

            // Wait a bit for SW to update, then reload
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error(
              "[VersionChecker] ❌ Failed to load new version after 3 attempts."
            );
            sessionStorage.removeItem("version-reload-attempts");
          }
        } else {
          console.log("[VersionChecker] ✅ Version is up to date!");
          // Clear reload attempts on successful version match
          sessionStorage.removeItem("version-reload-attempts");
        }
      } catch (error) {
        console.error("[VersionChecker] Error checking version:", error);
      }

      setHasChecked(true);
    };

    // Check immediately on mount
    if (!hasChecked) {
      checkVersion();
    }

    // Check periodically for updates
    const interval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [hasChecked, currentVersion]);

  // Listen for service worker version updates
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "VERSION_UPDATE") {
        const newVersion = event.data.version;
        const newBuildTime = event.data.buildTime;
        const forceReload = event.data.forceReload;
        
        console.log(`[VersionChecker] 🆕 Service worker updated to v${newVersion} (Build: ${newBuildTime})`);

        // If service worker tells us to force reload, do it
        if (false && forceReload) { // Disabled automatic reloads
          console.log("[VersionChecker] 🔄 Service worker requesting reload...");
          // Clear reload attempts so we can try fresh
          sessionStorage.removeItem("version-reload-attempts");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, []);

  return null; // This component doesn't render anything
}
