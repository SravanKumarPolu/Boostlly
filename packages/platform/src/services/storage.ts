import {
  StorageService as IStorageService,
  StorageOptions,
} from "../interfaces/storage";

export abstract class StorageService implements IStorageService {
  protected options: StorageOptions;

  constructor(options: StorageOptions = {}) {
    this.options = {
      prefix: "boostlly_",
      encryption: false,
      compression: false,
      ...options,
    };
  }

  abstract get<T = any>(key: string): Promise<T | null>;
  abstract set<T = any>(key: string, value: T): Promise<void>;
  abstract remove(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract keys(): Promise<string[]>;

  // Synchronous methods for immediate access
  abstract getSync<T = any>(key: string): T | null;
  abstract setSync<T = any>(key: string, value: T): void;

  protected getPrefixedKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }

  protected removePrefix(key: string): string {
    return key.replace(new RegExp(`^${this.options.prefix}`), "");
  }
}
