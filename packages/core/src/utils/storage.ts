import { StorageData } from "../types";
import { APP_CONFIG, DEFAULT_USER_PREFERENCES, TIME_CONSTANTS } from "../constants";

export class StorageManager {
  private static instance: StorageManager;
  private data: StorageData;

  private constructor() {
    this.data = this.getDefaultData();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  getData(): StorageData {
    return this.data;
  }

  updateData(updates: Partial<StorageData>): void {
    this.data = { ...this.data, ...updates };
  }

  private getDefaultData(): StorageData {
    return {
      quotes: [],
      user: {
        id: APP_CONFIG.DEFAULT_USER_ID,
        name: APP_CONFIG.DEFAULT_USER_NAME,
        preferences: DEFAULT_USER_PREFERENCES,
        stats: {
          totalQuotes: 0,
          savedQuotes: 0,
          streak: 0,
          lastSeen: new Date(),
          favoriteCategories: [],
        },
      },
      settings: {
        cacheEnabled: true,
        maxCacheAge: TIME_CONSTANTS.CACHE_24_HOURS,
        categories: ["motivation", "productivity", "success"],
      },
      feedback: {},
      collections: [],
    };
  }
}
