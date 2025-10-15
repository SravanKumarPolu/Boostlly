declare module "@boostlly/platform-extension" {
  export class ExtensionStorageService {
    constructor();
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T): Promise<void>;
  }
}

declare module "@boostlly/platform-web" {
  export class StorageService {
    constructor();
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T): Promise<void>;
  }
}
