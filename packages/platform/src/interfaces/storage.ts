export interface StorageService {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;

  // Synchronous methods for immediate access
  getSync<T = any>(key: string): T | null;
  setSync<T = any>(key: string, value: T): void;
}

export interface StorageOptions {
  prefix?: string;
  encryption?: boolean;
  compression?: boolean;
}
