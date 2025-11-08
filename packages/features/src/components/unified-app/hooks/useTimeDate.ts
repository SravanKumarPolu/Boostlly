/**
 * Time and Date State Hook
 * 
 * Manages time and date display state and formatting
 */

import { useState, useEffect } from 'react';
import { StorageLike, TimeDateState } from '../types';

export function useTimeDate(storage: StorageLike | null): TimeDateState & {
  setShowTimeDate: (show: boolean) => void;
  setTimeFormat: (format: "12" | "24") => void;
  setDateFormat: (format: "full" | "compact") => void;
} {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeDate, setShowTimeDate] = useState(true);
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("12");
  const [dateFormat, setDateFormat] = useState<"full" | "compact">("full");
  const [isClient, setIsClient] = useState(false);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Real-time clock updates (only on client)
  useEffect(() => {
    if (!isClient) return;

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Load preferences for time and date display
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("showTimeDate");
        if (!cancelled) {
          // Default to true if not set, respect user preference if set
          setShowTimeDate(pref === undefined || pref === null ? true : !!pref);
        }
      } catch {
        if (!cancelled) setShowTimeDate(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Load time format preference
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("timeFormat");
        if (!cancelled) {
          setTimeFormat(pref === "24" ? "24" : "12");
        }
      } catch {
        if (!cancelled) setTimeFormat("12");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Load date format preference
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("dateFormat");
        if (!cancelled) {
          setDateFormat(pref === "compact" ? "compact" : "full");
        }
      } catch {
        if (!cancelled) setDateFormat("full");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  return {
    currentTime,
    showTimeDate,
    timeFormat,
    dateFormat,
    isClient,
    setShowTimeDate,
    setTimeFormat,
    setDateFormat,
  };
}
