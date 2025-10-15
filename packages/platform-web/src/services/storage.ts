import { StorageService } from "@boostlly/platform";
import { logError } from "@boostlly/core";

export class WebStorageService extends StorageService {
  private memoryStore: Map<string, string> = new Map();
  private idbName = "boostlly_db";
  private idbStore = "kv";
  private largeKeys = new Set<string>([
    "savedQuotes",
    "archivedQuotes",
    "collections",
    "userStats",
  ]);

  private get isBrowser(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  }

  private get supportsIDB(): boolean {
    return typeof indexedDB !== "undefined";
  }

  private get useIDB(): boolean {
    return this.isBrowser && this.supportsIDB;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(this.idbName, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(this.idbStore)) {
            db.createObjectStore(this.idbStore);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async idbGet<T = any>(key: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.idbStore, "readonly");
      const store = tx.objectStore(this.idbStore);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  private async idbSet<T = any>(key: string, value: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.idbStore, "readwrite");
      const store = tx.objectStore(this.idbStore);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async idbRemove(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.idbStore, "readwrite");
      const store = tx.objectStore(this.idbStore);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async idbKeys(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.idbStore, "readonly");
      const store = tx.objectStore(this.idbStore);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result as string[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      if (this.isBrowser && (!this.largeKeys.has(key) || !this.useIDB)) {
        const item = window.localStorage.getItem(prefixedKey);
        if (item === null || item === "") return null;
        return JSON.parse(item);
      }
      if (this.useIDB && this.largeKeys.has(key)) {
        const value = await this.idbGet(prefixedKey);
        return value as any;
      }
      const mem = this.memoryStore.get(prefixedKey);
      return mem ? JSON.parse(mem) : null;
    } catch (error) {
      logError(error as Error, { key }, "WebStorageService.get");
      return null;
    }
  }

  getSync<T = any>(key: string): T | null {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      if (this.isBrowser) {
        const item = window.localStorage.getItem(prefixedKey);
        if (item === null || item === "") return null;
        return JSON.parse(item);
      }
      const mem = this.memoryStore.get(prefixedKey);
      return mem ? JSON.parse(mem) : null;
    } catch (error) {
      logError(error as Error, { key }, "WebStorageService.get");
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serialized = JSON.stringify(value);
      if (this.isBrowser && (!this.largeKeys.has(key) || !this.useIDB)) {
        window.localStorage.setItem(prefixedKey, serialized);
        return;
      }
      if (this.useIDB && this.largeKeys.has(key)) {
        await this.idbSet(prefixedKey, value);
        return;
      }
      this.memoryStore.set(prefixedKey, serialized);
    } catch (error) {
      logError(error as Error, { key }, "WebStorageService.set");
      throw error;
    }
  }

  setSync<T = any>(key: string, value: T): void {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serialized = JSON.stringify(value);
      if (this.isBrowser) {
        window.localStorage.setItem(prefixedKey, serialized);
        return;
      }
      this.memoryStore.set(prefixedKey, serialized);
    } catch (error) {
      logError(error as Error, { key }, "WebStorageService.set");
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      if (this.isBrowser && (!this.largeKeys.has(key) || !this.useIDB)) {
        window.localStorage.removeItem(prefixedKey);
        return;
      }
      if (this.useIDB && this.largeKeys.has(key)) {
        await this.idbRemove(prefixedKey);
        return;
      }
      this.memoryStore.delete(prefixedKey);
    } catch (error) {
      logError(error as Error, { key }, "WebStorageService.remove");
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isBrowser) {
        const keys = await this.keys();
        keys.forEach((key) => {
          window.localStorage.removeItem(this.getPrefixedKey(key));
        });
        if (this.useIDB) {
          const idbKeys = await this.idbKeys();
          await Promise.all(idbKeys.map((k) => this.idbRemove(k)));
        }
        return;
      }
      this.memoryStore.clear();
    } catch (error) {
      logError(error as Error, {}, "WebStorageService.clear");
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      if (this.isBrowser) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(this.options.prefix!)) {
            keys.push(this.removePrefix(key));
          }
        }
        if (this.useIDB) {
          const idbKeys = await this.idbKeys();
          for (const k of idbKeys) {
            if (k.startsWith(this.options.prefix!))
              keys.push(this.removePrefix(k));
          }
        }
        return keys;
      }
      for (const key of this.memoryStore.keys()) {
        if (key.startsWith(this.options.prefix!)) {
          keys.push(this.removePrefix(key));
        }
      }
      return keys;
    } catch (error) {
      logError(error as Error, {}, "WebStorageService.keys");
      return [];
    }
  }
}
