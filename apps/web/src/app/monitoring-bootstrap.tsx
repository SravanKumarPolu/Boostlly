"use client";

import { useEffect } from "react";
import { initializeChunkLoadingHandling } from "../utils/chunk-loading";
import { initializeSentry, initializeAnalytics } from "../utils/monitoring";

// Safe chunk loading initialization
function safeInitChunkLoading() {
  try {
    initializeChunkLoadingHandling();
  } catch (error) {
    console.warn("[chunk-loading] Failed to initialize:", error);
  }
}

/**
 * Client-only bootstrap component
 * Initializes essential systems including error tracking and analytics
 */
export function MonitoringBootstrap() {
  useEffect(() => {
    // Initialize chunk loading error handling
    safeInitChunkLoading();

    // Initialize error tracking (Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      initializeSentry().catch((error) => {
        console.error("[MonitoringBootstrap] Failed to initialize Sentry:", error);
      });
    }

    // Initialize analytics
    initializeAnalytics();
  }, []);

  // This component doesn't render anything
  return null;
}
