/**
 * Platform Utilities
 * 
 * Platform-specific utilities for extension and web environments
 */

import { logError } from '@boostlly/core';
import { StorageLike } from '../types';

/**
 * Check if running in extension environment
 */
export function isExtensionEnv(): boolean {
  return (
    typeof window !== "undefined" && !!(window as any).chrome?.storage?.local
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
    logError("Failed to load platform storage:", { error: error });
    // Fallback to a simple in-memory storage
    return {
      get: async () => null,
      set: async () => {},
    };
  }
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
  } catch {}
  try {
    // Fallback: attempt to open options route within the extension bundle
    window.open("/options/index.html", "_blank", "noopener,noreferrer");
  } catch {}
}
