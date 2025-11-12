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

// Pre-initialize TTS voices on page load for better first-click experience
function preInitializeTTS() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  
  try {
    // Trigger voice loading by calling getVoices
    // This ensures voices are ready when user clicks read button
    window.speechSynthesis.getVoices();
    
    // Also set up voiceschanged listener to cache voices when they load
    if (!window.speechSynthesis.onvoiceschanged) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded - accessibleTTS will cache them on first use
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0 && process.env.NODE_ENV === "development") {
          console.log(`[TTS] ${voices.length} voices loaded and ready`);
        }
      };
    }
  } catch (error) {
    console.warn("[TTS] Failed to pre-initialize voices:", error);
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

    // Pre-initialize TTS voices for better first-click experience
    preInitializeTTS();

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
