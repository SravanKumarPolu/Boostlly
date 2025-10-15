"use client";

/**
 * Hydration hook for safe client-side rendering
 * Prevents hydration mismatches in Next.js
 */

import { useEffect, useState } from "react";

export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook to safely access store state after hydration
 * Returns null during SSR and initial hydration
 */
export function useSafeStore<T>(selector: () => T): T | null {
  const isHydrated = useHydrated();
  const [state, setState] = useState<T | null>(null);

  useEffect(() => {
    if (isHydrated) {
      setState(selector());
    }
  }, [isHydrated, selector]);

  return state;
}

/**
 * Hook to conditionally render components after hydration
 */
export function useClientOnly() {
  const isHydrated = useHydrated();
  return isHydrated;
}
