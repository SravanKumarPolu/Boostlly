import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StorageService,
  StorageOptions,
} from "@boostlly/platform";

/**
 * Android Storage Service using Expo SecureStore and AsyncStorage
 * 
 * Uses SecureStore for sensitive data and AsyncStorage for general data
 */
export class AndroidStorageService extends StorageService {
  private useSecureStore: boolean;

  constructor(options: StorageOptions = {}) {
    super(options);
    this.useSecureStore = options.encryption || false;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getPrefixedKey(key);
      
      if (this.useSecureStore) {
        const value = await SecureStore.getItemAsync(fullKey);
        return value ? JSON.parse(value) : null;
      } else {
        const value = await AsyncStorage.getItem(fullKey);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getPrefixedKey(key);
      const serialized = JSON.stringify(value);
      
      if (this.useSecureStore) {
        await SecureStore.setItemAsync(fullKey, serialized);
      } else {
        await AsyncStorage.setItem(fullKey, serialized);
      }
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getPrefixedKey(key);
      
      if (this.useSecureStore) {
        await SecureStore.deleteItemAsync(fullKey);
      } else {
        await AsyncStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys();
      await Promise.all(keys.map((key) => this.remove(key)));
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (this.useSecureStore) {
        // SecureStore doesn't support listing keys, return empty array
        // In production, you might want to maintain a separate key registry
        return [];
      } else {
        const allKeys = await AsyncStorage.getAllKeys();
        return allKeys
          .filter((key: string) => key.startsWith(this.options.prefix || "boostlly_"))
          .map((key: string) => this.removePrefix(key));
      }
    } catch (error) {
      console.error("Error getting storage keys:", error);
      return [];
    }
  }

  // Synchronous methods - Not fully supported on React Native
  // These will use AsyncStorage synchronously which may cause performance issues
  getSync<T = any>(key: string): T | null {
    // Note: React Native doesn't support truly synchronous storage
    // This is a best-effort implementation that may block
    try {
      const fullKey = this.getPrefixedKey(key);
      // For React Native, we can't do truly synchronous operations
      // This would need to be handled differently in production
      // Consider using a sync adapter or in-memory cache
      return null;
    } catch (error) {
      console.error(`Error getting storage key ${key} sync:`, error);
      return null;
    }
  }

  setSync<T = any>(key: string, value: T): void {
    // Note: React Native doesn't support truly synchronous storage
    // This is a best-effort implementation
    try {
      const fullKey = this.getPrefixedKey(key);
      const serialized = JSON.stringify(value);
      // For React Native, we can't do truly synchronous operations
      // Consider using a sync adapter or in-memory cache
    } catch (error) {
      console.error(`Error setting storage key ${key} sync:`, error);
    }
  }
}

