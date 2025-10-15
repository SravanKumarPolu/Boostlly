"use client";

import { logError, logDebug, logWarning } from "@boostlly/core";
import { useEffect, useRef, useState } from "react";

/**
 * GlobalVoiceListener
 * Minimal, no-UI speech recognizer that dispatches Boostlly voice events
 * so commands work from any tab without opening the Voice tab.
 */
export function GlobalVoiceListener() {
  const recognitionRef = useRef<any>(null);
  const [enabled, setEnabled] = useState(false); // Disabled by default - user must opt-in
  const permissionCheckedRef = useRef(false);

  useEffect(() => {
    // Check if we're in an extension context - only disable for actual Chrome extensions
    const isExtension =
      typeof window !== "undefined" &&
      !!(window as any).chrome?.storage?.local &&
      !!(window as any).chrome?.runtime?.id;

    if (isExtension) {
      // Voice features are limited in extensions due to security restrictions
      logDebug("Voice features disabled in extension context");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition || !enabled) return;

    // Stop any existing instance to prevent duplicates
    try {
      recognitionRef.current?.stop?.();
    } catch {}

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:status", {
            detail: { state: "listening" },
          }),
        );
      } catch {}
    };

    recognition.onerror = (event: any) => {
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:status", {
            detail: { state: "error", error: event?.error },
          }),
        );
      } catch {}
      // Attempt soft recovery on transient errors
      const nonRecoverable = ["not-allowed", "service-not-allowed"];
      if (!nonRecoverable.includes(event?.error)) {
        try {
          recognition.stop();
          recognition.start();
        } catch {}
      }
    };

    recognition.onend = () => {
      // Auto-restart while enabled, keep status as listening to avoid flicker
      if (enabled) {
        try {
          recognition.start();
          window.dispatchEvent(
            new CustomEvent("boostlly:voice:status", {
              detail: { state: "listening" },
            }),
          );
          return;
        } catch {}
      }
      try {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:status", {
            detail: { state: "ready" },
          }),
        );
      } catch {}
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }

      const liveText = (interimTranscript || finalTranscript).trim();
      if (liveText) {
        window.dispatchEvent(
          new CustomEvent("boostlly:voice:transcript", {
            detail: { text: liveText, isFinal: Boolean(finalTranscript) },
          }),
        );
      }

      const phrase = finalTranscript.trim().toLowerCase();
      if (!phrase) return;

      // Map phrases to actions
      const toDetail = (p: string): any | null => {
        if (p === "read" || p === "read quote") return { action: "read" };
        if (p.includes("next quote") || p === "next") return { action: "next" };
        if (p.includes("previous quote") || p === "previous")
          return { action: "previous" };
        if (p.includes("save quote") || p === "save") return { action: "save" };
        if (p.includes("like quote") || p === "like") return { action: "like" };
        if (p.includes("share quote") || p === "share")
          return { action: "share" };
        if (p.includes("open search") || p.includes("go to search"))
          return { action: "navigate", tab: "search" };
        if (p.includes("go to today") || p === "today")
          return { action: "navigate", tab: "today" };
        if (
          p.includes("open community stats") ||
          p.includes("go to community stats")
        )
          return { action: "navigate", tab: "community-stats" };
        if (p.includes("open collections") || p.includes("go to collections"))
          return { action: "navigate", tab: "collections" };
        if (p.includes("open api") || p.includes("go to api"))
          return { action: "navigate", tab: "api" };
        if (p.includes("open saved") || p.includes("go to saved"))
          return { action: "navigate", tab: "saved" };
        if (p.includes("open your") || p.includes("go to your"))
          return { action: "navigate", tab: "create" };
        if (p.includes("open stats") || p.includes("go to stats"))
          return { action: "navigate", tab: "stats" };
        if (p.includes("open smart ai") || p.includes("go to smart ai"))
          return { action: "navigate", tab: "smart" };
        if (p.includes("open analytics") || p.includes("go to analytics"))
          return { action: "navigate", tab: "analytics" };
        if (
          p.includes("open categories") ||
          p.includes("go to categories") ||
          p.includes("open categorization") ||
          p.includes("go to categorization")
        )
          return { action: "navigate", tab: "categorization" };
        if (p.includes("open patterns") || p.includes("go to patterns"))
          return { action: "navigate", tab: "patterns" };
        if (p.includes("open voice") || p.includes("go to voice"))
          return { action: "navigate", tab: "voice" };
        if (p.includes("open predictions") || p.includes("go to predictions"))
          return { action: "navigate", tab: "predictions" };
        if (p.includes("open sync") || p.includes("go to sync"))
          return { action: "navigate", tab: "sync" };
        if (p.includes("open settings") || p.includes("go to settings"))
          return { action: "navigate", tab: "settings" };
        return null;
      };

      // Rate/volume quick controls
      if (phrase.includes("faster speech")) {
        try {
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", {
              detail: { speechRate: "INCREMENT" },
            }),
          );
        } catch {}
      } else if (phrase.includes("slower speech")) {
        try {
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", {
              detail: { speechRate: "DECREMENT" },
            }),
          );
        } catch {}
      } else if (phrase.includes("increase volume")) {
        try {
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", {
              detail: { speechVolume: "INCREMENT" },
            }),
          );
        } catch {}
      } else if (phrase.includes("decrease volume")) {
        try {
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", {
              detail: { speechVolume: "DECREMENT" },
            }),
          );
        } catch {}
      } else {
        const detail = toDetail(phrase);
        if (detail) {
          window.dispatchEvent(new CustomEvent("boostlly:voice", { detail }));
        }
      }
    };

    const start = async () => {
      // Request mic permission once to improve reliability
      if (
        !permissionCheckedRef.current &&
        navigator.mediaDevices?.getUserMedia
      ) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
        permissionCheckedRef.current = true;
      }
      try {
        // On Chrome, start() must be called from a user gesture. If this call fails silently,
        // the button click in the header also triggers getUserMedia and toggles enabled state.
        recognition.start();
      } catch {}
    };
    start();

    // In Chrome, ensure we (re)start on explicit user gesture
    const onGesture = () => {
      if (!enabled) return;
      try {
        recognition.stop();
      } catch {}
      try {
        recognition.start();
      } catch {}
    };
    window.addEventListener("boostlly:voice:user-gesture", onGesture);

    return () => {
      window.removeEventListener("boostlly:voice:user-gesture", onGesture);
      try {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      } catch {}
    };
  }, [enabled]);

  // Allow external enable/disable
  useEffect(() => {
    const onToggle = (e: any) => {
      const val = e?.detail?.enabled;
      if (typeof val === "boolean") setEnabled(val);
    };
    window.addEventListener("boostlly:voice:enable", onToggle as any);
    return () =>
      window.removeEventListener("boostlly:voice:enable", onToggle as any);
  }, []);

  return null;
}
