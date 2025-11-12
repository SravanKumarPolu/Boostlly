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
// More aggressive initialization for production builds
function preInitializeTTS() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  
  try {
    // Strategy 1: Trigger voice loading by calling getVoices immediately
    window.speechSynthesis.getVoices();
    
    // Strategy 2: Set up voiceschanged listener to cache voices when they load
    if (!window.speechSynthesis.onvoiceschanged) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          if (process.env.NODE_ENV === "development") {
            console.log(`[TTS] ${voices.length} voices loaded and ready`);
          }
          // Store in a global cache that AccessibleTTS can access
          (window as any).__boostlly_tts_voices = voices;
        }
      };
    }
    
    // Strategy 3: Try to trigger voice loading with a dummy utterance
    // Some browsers need this to initialize voices
    setTimeout(() => {
      try {
        const dummyUtterance = new SpeechSynthesisUtterance("");
        dummyUtterance.volume = 0;
        window.speechSynthesis.speak(dummyUtterance);
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore errors
      }
    }, 100);
    
    // Strategy 4: Check again after a delay (for code-split modules)
    setTimeout(() => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          (window as any).__boostlly_tts_voices = voices;
        }
      } catch (e) {
        // Ignore errors
      }
    }, 500);
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
