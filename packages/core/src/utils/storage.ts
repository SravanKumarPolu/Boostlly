import { StorageData } from "../types";

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
        id: "default-user",
        name: "User",
        preferences: {
          theme: "auto",
          notifications: true,
          dailyReminder: true,
          categories: ["motivation", "productivity"],
          language: "en",
        },
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
        maxCacheAge: 24 * 60 * 60 * 1000,
        categories: ["motivation", "productivity", "success"],
      },
      feedback: {},
      collections: [],
    };
  }
}
