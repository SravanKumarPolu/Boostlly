/**
 * Voice State Hook
 * 
 * Manages voice-related state and functionality
 */

import { useState, useEffect } from 'react';
import { logError, logDebug } from '@boostlly/core';
import { VoiceState } from '../types';

export function useVoiceState() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<
    "off" | "ready" | "listening" | "error"
  >("off");

  // Initialize global voice listener enable state
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("boostlly:voice:enable", {
          detail: { enabled: voiceEnabled },
        }),
      );
    } catch {}
    setVoiceStatus(voiceEnabled ? "ready" : "off");
  }, [voiceEnabled]);

  // Listen for navigation voice events
  useEffect(() => {
    const onVoice = (evt: any) => {
      const { action, tab } = evt?.detail || {};
      if (action === "navigate" && typeof tab === "string") {
        // This will be handled by the parent component
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:navigate", {
            detail: { tab },
          }),
        );
      }
    };
    window.addEventListener("boostlly:voice", onVoice as any);
    return () => window.removeEventListener("boostlly:voice", onVoice as any);
  }, []);

  // Listen for live transcript updates
  useEffect(() => {
    const onTranscript = (e: any) => {
      const text = e?.detail?.text || "";
      setLiveTranscript(text);
      // Clear transcript shortly after final result
      if (e?.detail?.isFinal) {
        setTimeout(() => setLiveTranscript(""), 1200);
      }
    };
    window.addEventListener("boostlly:voice:transcript", onTranscript as any);
    return () =>
      window.removeEventListener(
        "boostlly:voice:transcript",
        onTranscript as any,
      );
  }, []);

  // Listen for status updates
  useEffect(() => {
    const onStatus = (e: any) => {
      const state = e?.detail?.state;
      if (state === "listening" || state === "ready" || state === "error") {
        setVoiceStatus(state);
      }
    };
    window.addEventListener("boostlly:voice:status", onStatus as any);
    return () =>
      window.removeEventListener("boostlly:voice:status", onStatus as any);
  }, []);

  async function enableVoice(): Promise<void> {
    try {
      // Check if we're in an extension context
      const isExtension =
        typeof window !== "undefined" &&
        !!(window as any).chrome?.storage?.local;

      if (isExtension) {
        // For extensions, show a helpful message
        alert(
          "Voice features are limited in browser extensions due to security restrictions. Please use the web app at boostlly.com for full voice functionality.",
        );
        return;
      }

      // Check if getUserMedia is available
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert(
          "Voice features are not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.",
        );
        return;
      }

      // Prompt for mic permission on user gesture (Chrome requirement)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setVoiceEnabled(true);
      setVoiceStatus("ready");
      
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:user-gesture"),
        );
      } catch {}
    } catch (error: any) {
      const errorName = error?.name || "";
      const errorMessage = error?.message || "";

      logError("Microphone access denied:", {
        error: error,
        name: errorName,
        message: errorMessage,
      });

      // Provide Chrome-specific help
      const isChrome =
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor);

      if (
        errorName === "NotAllowedError" ||
        errorName === "PermissionDeniedError"
      ) {
        if (isChrome) {
          alert(
            "Microphone blocked!\n\n" +
              "To fix in Chrome:\n" +
              "1. Click the 🔒 lock icon in the address bar\n" +
              "2. Find 'Microphone' and set to 'Allow'\n" +
              "3. Click 'Reload' or refresh the page\n" +
              "4. Try the microphone button again",
          );
        } else {
          alert(
            "Microphone access was denied.\n\n" +
              "Please allow microphone access when prompted and try again.",
          );
        }
      } else if (errorName === "NotFoundError") {
        alert(
          "No microphone found!\n\n" +
            "Please connect a microphone and try again.",
        );
      } else if (errorName === "NotReadableError") {
        alert(
          "Microphone is being used by another application.\n\n" +
            "Please close other apps using the microphone and try again.",
        );
      } else {
        alert(
          "Cannot access microphone.\n\n" +
            "Error: " +
            errorMessage +
            "\n\n" +
            (isChrome
              ? "Check Chrome settings: chrome://settings/content/microphone"
              : "Please check your browser's microphone settings."),
        );
      }
    }
  }

  function disableVoice(): void {
    setVoiceEnabled(false);
    setVoiceStatus("off");
  }

  function toggleVoice(): void {
    if (voiceEnabled) {
      disableVoice();
    } else {
      enableVoice();
    }
  }

  return {
    voiceEnabled,
    liveTranscript,
    voiceStatus,
    setVoiceEnabled,
    enableVoice,
    disableVoice,
    toggleVoice,
  };
}
