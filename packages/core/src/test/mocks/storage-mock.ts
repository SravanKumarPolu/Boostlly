/**
 * Mock StorageService for testing
 * Provides in-memory storage implementation
 */

import { StorageService } from "@boostlly/platform";

export class MockStorageService extends StorageService {
  private store: Map<string, any> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return value !== undefined ? (value as T) : null;
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  getSync<T = any>(key: string): T | null {
    const value = this.store.get(key);
    return value !== undefined ? (value as T) : null;
  }

  setSync<T = any>(key: string, value: T): void {
    this.store.set(key, value);
  }

  // Helper method to reset storage for tests
  reset(): void {
    this.store.clear();
  }

  // Helper method to get all stored data
  getAll(): Map<string, any> {
    return new Map(this.store);
  }
}

