import { StorageService } from "@boostlly/platform";
import { logError } from "@boostlly/core";

export class ExtensionStorageService extends StorageService {
  private memoryCache: Map<string, any> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([prefixedKey], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            const value = result[prefixedKey] || null;
            // Update memory cache
            this.memoryCache.set(prefixedKey, value);
            resolve(value);
          }
        });
      });
    } catch (error) {
      logError(error as Error, { key }, "ExtensionStorage.get");
      return null;
    }
  }

  getSync<T = any>(key: string): T | null {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      // Return from memory cache if available
      const cached = this.memoryCache.get(prefixedKey);
      if (cached !== undefined) {
        return cached;
      }

      // If not in cache, try to get from chrome.storage synchronously
      // Note: This is a fallback and may not work in all contexts
      try {
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.local
        ) {
          // This is a synchronous fallback - in practice, we should use async get
          // But for compatibility with existing code, we'll return null and let async get handle it
          return null;
        }
      } catch (e) {
        // Ignore chrome.storage errors in sync context
      }

      return null;
    } catch (error) {
      logError(error as Error, { key }, "ExtensionStorage.getSync");
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      // Update memory cache immediately
      this.memoryCache.set(prefixedKey, value);
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [prefixedKey]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      logError(error as Error, { key }, "ExtensionStorage.set");
      throw error;
    }
  }

  setSync<T = any>(key: string, value: T): void {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      // Update memory cache immediately
      this.memoryCache.set(prefixedKey, value);
      // Async write to chrome.storage (fire and forget)
      chrome.storage.local.set({ [prefixedKey]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error writing to chrome.storage:",
            chrome.runtime.lastError,
          );
        }
      });
    } catch (error) {
      logError(error as Error, { key }, "ExtensionStorage.setSync");
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      // Remove from memory cache
      this.memoryCache.delete(prefixedKey);
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove([prefixedKey], () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      logError(error as Error, { key }, "ExtensionStorage.remove");
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      const prefixedKeys = keys.map((key) => this.getPrefixedKey(key));
      // Clear memory cache
      this.memoryCache.clear();
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove(prefixedKeys, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      logError(error as Error, {}, "ExtensionStorage.clear");
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            const keys = Object.keys(result)
              .filter((key) => key.startsWith(this.options.prefix!))
              .map((key) => this.removePrefix(key));
            resolve(keys);
          }
        });
      });
    } catch (error) {
      logError(error as Error, {}, "ExtensionStorage.keys");
      return [];
    }
  }
}
