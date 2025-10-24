/**
 * Storage Utilities
 * 
 * Centralized storage management utilities for platform-specific
 * storage implementations with proper error handling.
 */

import { logError } from '@boostlly/core';

export type StorageLike = {
  get: <T = any>(key: string) => Promise<T | null>;
  set: <T = any>(key: string, value: T) => Promise<void>;
};

/**
 * Check if running in extension environment
 */
export function isExtensionEnv(): boolean {
  return (
    typeof window !== "undefined" && 
    !!(window as any).chrome?.storage?.local
  );
}

/**
 * Create platform-specific storage instance
 */
export async function createPlatformStorage(): Promise<StorageLike> {
  try {
    if (isExtensionEnv()) {
      const mod = await import("@boostlly/platform-extension");
      const Service = mod.ExtensionStorageService;
      const storage = new Service();
      return storage;
    } else {
      const mod = await import("@boostlly/platform-web");
      const Service = mod.StorageService;
      const storage = new Service();
      return storage;
    }
  } catch (error) {
    logError("Failed to load platform storage:", { error });
    
    // Fallback to a simple in-memory storage
    return createFallbackStorage();
  }
}

/**
 * Create fallback in-memory storage
 */
function createFallbackStorage(): StorageLike {
  const memoryStore = new Map<string, any>();
  
  return {
    get: async (key: string) => {
      return memoryStore.get(key) || null;
    },
    set: async (key: string, value: any) => {
      memoryStore.set(key, value);
    },
  };
}

/**
 * Open options page (extension only)
 */
export function openInOptionsPage(): void {
  try {
    const chromeObj = (window as any).chrome;
    if (chromeObj?.runtime?.openOptionsPage) {
      chromeObj.runtime.openOptionsPage();
      return;
    }
    
    // Fallback for older extension APIs
    if (chromeObj?.tabs?.create) {
      chromeObj.tabs.create({ url: chromeObj.runtime.getURL('options.html') });
    }
  } catch (error) {
    logError("Failed to open options page:", { error });
  }
}
