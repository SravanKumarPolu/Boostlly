"use client";

import { useEffect } from "react";
import { initializeChunkLoadingHandling } from "../utils/chunk-loading";

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
 * Initializes essential systems (monitoring removed for privacy)
 */
export function MonitoringBootstrap() {
  useEffect(() => {
    // Initialize chunk loading error handling
    safeInitChunkLoading();
  }, []);

  // This component doesn't render anything
  return null;
}
