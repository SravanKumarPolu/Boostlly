import { logError, logDebug, logWarning } from "./logger";
/**
 * Storage adapter for cross-platform persistence
 * Supports web (localStorage) and extension (chrome.storage.local)
 */

export interface StorageAdapter {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
}

export const storageAdapter: StorageAdapter = {
  getItem: async (name: string) => {
    try {
      if (
        typeof window !== "undefined" &&
        (window as any).chrome?.storage?.local
      ) {
        // Extension environment
        const result = await (window as any).chrome.storage.local.get([name]);
        return result?.[name] ?? null;
      } else if (typeof window !== "undefined" && window.localStorage) {
        // Web environment
        return localStorage.getItem(name);
      }
      return null;
    } catch (error) {
      logError("Storage getItem failed:", { error: error });
      return null;
    }
  },

  setItem: async (name: string, value: string) => {
    try {
      if (
        typeof window !== "undefined" &&
        (window as any).chrome?.storage?.local
      ) {
        // Extension environment
        await (window as any).chrome.storage.local.set({ [name]: value });
      } else if (typeof window !== "undefined" && window.localStorage) {
        // Web environment
        localStorage.setItem(name, value);
      }
    } catch (error) {
      logError("Storage setItem failed:", { error: error });
    }
  },

  removeItem: async (name: string) => {
    try {
      if (
        typeof window !== "undefined" &&
        (window as any).chrome?.storage?.local
      ) {
        // Extension environment
        await (window as any).chrome.storage.local.remove([name]);
      } else if (typeof window !== "undefined" && window.localStorage) {
        // Web environment
        localStorage.removeItem(name);
      }
    } catch (error) {
      logError("Storage removeItem failed:", { error: error });
    }
  },
};

/**
 * Check if we're in an extension environment
 */
export function isExtensionEnvironment(): boolean {
  return (
    typeof window !== "undefined" && !!(window as any).chrome?.storage?.local
  );
}

/**
 * Check if we're in a web environment
 */
export function isWebEnvironment(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}
