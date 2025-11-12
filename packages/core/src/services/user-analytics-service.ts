/**
 * User Analytics Service
 * 
 * Tracks user behavior such as homepage visits and read button clicks.
 * Stores data in localStorage with daily aggregation.
 */

// Storage interface compatible with all storage implementations
export interface StorageLike {
  get: <T = any>(key: string) => Promise<T | null> | T | null;
  set: <T = any>(key: string, value: T) => Promise<void> | void;
  remove?: (key: string) => Promise<void> | void;
  getSync?: <T = any>(key: string) => T | null;
  setSync?: <T = any>(key: string, value: T) => void;
  removeSync?: (key: string) => void;
}

export interface DailyAnalytics {
  date: string; // ISO date string (YYYY-MM-DD)
  homepageVisits: number;
  readButtonClicks: number;
}

export interface UserAnalyticsData {
  dailyData: DailyAnalytics[];
  totalHomepageVisits: number;
  totalReadButtonClicks: number;
  lastUpdated: string;
}

const STORAGE_KEY = "boostlly-user-analytics";
const MAX_DAYS_TO_KEEP = 365; // Keep data for 1 year

export class UserAnalyticsService {
  private storage: StorageLike;

  constructor(storage: StorageLike) {
    this.storage = storage;
  }

  /**
   * Get current date key (YYYY-MM-DD)
   */
  private getDateKey(): string {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  /**
   * Load analytics data from storage
   */
  private async loadAnalytics(): Promise<UserAnalyticsData> {
    try {
      // Try sync first if available
      if (typeof (this.storage as any).getSync === "function") {
        const data = (this.storage as any).getSync(STORAGE_KEY);
        if (data) {
          if (process.env.NODE_ENV === "development") {
            console.log("📊 Analytics loaded (sync):", STORAGE_KEY, data);
          }
          return this.normalizeData(data);
        }
      }

      // Fallback to async
      const data = await this.storage.get(STORAGE_KEY);
      if (data) {
        if (process.env.NODE_ENV === "development") {
          console.log("📊 Analytics loaded (async):", STORAGE_KEY, data);
        }
        return this.normalizeData(data);
      }
    } catch (error) {
      console.error("❌ Failed to load analytics:", error);
    }

    // Return empty data structure
    if (process.env.NODE_ENV === "development") {
      console.log("📊 No analytics data found, returning empty structure");
    }
    return {
      dailyData: [],
      totalHomepageVisits: 0,
      totalReadButtonClicks: 0,
      lastUpdated: this.getDateKey(),
    };
  }

  /**
   * Normalize data structure to ensure compatibility
   */
  private normalizeData(data: any): UserAnalyticsData {
    // Ensure data has the correct structure
    const normalized: UserAnalyticsData = {
      dailyData: Array.isArray(data.dailyData) ? data.dailyData : [],
      totalHomepageVisits: typeof data.totalHomepageVisits === "number" ? data.totalHomepageVisits : 0,
      totalReadButtonClicks: typeof data.totalReadButtonClicks === "number" ? data.totalReadButtonClicks : 0,
      lastUpdated: data.lastUpdated || this.getDateKey(),
    };

    // Clean up old data (keep only last MAX_DAYS_TO_KEEP days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_TO_KEEP);
    const cutoffKey = cutoffDate.toISOString().split("T")[0];

    normalized.dailyData = normalized.dailyData.filter(
      (entry) => entry.date >= cutoffKey
    );

    return normalized;
  }

  /**
   * Save analytics data to storage
   */
  private async saveAnalytics(data: UserAnalyticsData): Promise<void> {
    try {
      data.lastUpdated = this.getDateKey();

      // Try sync first if available
      if (typeof (this.storage as any).setSync === "function") {
        (this.storage as any).setSync(STORAGE_KEY, data);
        if (process.env.NODE_ENV === "development") {
          console.log("💾 Analytics saved (sync):", STORAGE_KEY, {
            totalVisits: data.totalHomepageVisits,
            totalClicks: data.totalReadButtonClicks,
            dailyDataCount: data.dailyData.length,
          });
        }
        return;
      }

      // Fallback to async
      await this.storage.set(STORAGE_KEY, data);
      if (process.env.NODE_ENV === "development") {
        console.log("💾 Analytics saved (async):", STORAGE_KEY, {
          totalVisits: data.totalHomepageVisits,
          totalClicks: data.totalReadButtonClicks,
          dailyDataCount: data.dailyData.length,
        });
      }
    } catch (error) {
      console.error("❌ Failed to save analytics:", error);
      throw error; // Re-throw to help with debugging
    }
  }

  /**
   * Get or create daily entry for today
   */
  private getTodayEntry(data: UserAnalyticsData): DailyAnalytics {
    const today = this.getDateKey();
    let todayEntry = data.dailyData.find((entry) => entry.date === today);

    if (!todayEntry) {
      todayEntry = {
        date: today,
        homepageVisits: 0,
        readButtonClicks: 0,
      };
      data.dailyData.push(todayEntry);
      // Sort by date (newest first)
      data.dailyData.sort((a, b) => b.date.localeCompare(a.date));
    }

    return todayEntry;
  }

  /**
   * Track a homepage visit
   */
  async trackHomepageVisit(): Promise<void> {
    try {
      const data = await this.loadAnalytics();
      const todayEntry = this.getTodayEntry(data);
      todayEntry.homepageVisits += 1;
      data.totalHomepageVisits += 1;
      await this.saveAnalytics(data);
      
      // Debug log to verify tracking
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Homepage visit tracked:", {
          today: this.getDateKey(),
          todayVisits: todayEntry.homepageVisits,
          totalVisits: data.totalHomepageVisits,
        });
      }
    } catch (error) {
      console.error("❌ Failed to track homepage visit:", error);
    }
  }

  /**
   * Track a read button click
   */
  async trackReadButtonClick(): Promise<void> {
    try {
      const data = await this.loadAnalytics();
      const todayEntry = this.getTodayEntry(data);
      todayEntry.readButtonClicks += 1;
      data.totalReadButtonClicks += 1;
      await this.saveAnalytics(data);
      
      // Debug log to verify tracking
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Read button click tracked:", {
          today: this.getDateKey(),
          todayClicks: todayEntry.readButtonClicks,
          totalClicks: data.totalReadButtonClicks,
        });
      }
    } catch (error) {
      console.error("❌ Failed to track read button click:", error);
    }
  }

  /**
   * Get analytics data for a specific time range
   */
  async getAnalytics(timeRange: "7d" | "30d" | "90d" | "all" = "30d"): Promise<UserAnalyticsData> {
    const data = await this.loadAnalytics();
    const today = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
      case "all":
        // Return all data
        return data;
    }

    const cutoffKey = cutoffDate.toISOString().split("T")[0];
    const filteredData = {
      ...data,
      dailyData: data.dailyData.filter((entry) => entry.date >= cutoffKey),
    };

    // Recalculate totals for filtered data
    filteredData.totalHomepageVisits = filteredData.dailyData.reduce(
      (sum, entry) => sum + entry.homepageVisits,
      0
    );
    filteredData.totalReadButtonClicks = filteredData.dailyData.reduce(
      (sum, entry) => sum + entry.readButtonClicks,
      0
    );

    return filteredData;
  }

  /**
   * Get daily analytics data formatted for charts
   * Optimized to show data even with minimal visits/clicks (1-2 data points)
   */
  async getDailyChartData(timeRange: "7d" | "30d" | "90d" | "all" = "30d"): Promise<{
    homepageVisits: Array<{ date: string; visits: number }>;
    readButtonClicks: Array<{ date: string; clicks: number }>;
  }> {
    const data = await this.getAnalytics(timeRange);
    const today = new Date();
    let daysToShow = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;

    // Create a map of existing data
    const dataMap = new Map<string, DailyAnalytics>();
    data.dailyData.forEach((entry) => {
      dataMap.set(entry.date, entry);
    });

    // Find the earliest date with activity
    const datesWithActivity = data.dailyData
      .filter((entry) => entry.homepageVisits > 0 || entry.readButtonClicks > 0)
      .map((entry) => entry.date)
      .sort();

    // If we have activity, ensure we show at least 7 days around the activity
    if (datesWithActivity.length > 0 && daysToShow < 7) {
      daysToShow = 7;
    }

    // Fill in all dates in the range (even if no data exists)
    // This ensures charts always have a consistent date range
    const homepageVisits: Array<{ date: string; visits: number }> = [];
    const readButtonClicks: Array<{ date: string; clicks: number }> = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const entry = dataMap.get(dateKey);

      homepageVisits.push({
        date: dateKey,
        visits: entry?.homepageVisits || 0,
      });

      readButtonClicks.push({
        date: dateKey,
        clicks: entry?.readButtonClicks || 0,
      });
    }

    return { homepageVisits, readButtonClicks };
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<{
    totalHomepageVisits: number;
    totalReadButtonClicks: number;
    todayHomepageVisits: number;
    todayReadButtonClicks: number;
    averageDailyVisits: number;
    averageDailyClicks: number;
  }> {
    const data = await this.loadAnalytics();
    const today = this.getDateKey();
    const todayEntry = data.dailyData.find((entry) => entry.date === today);

    // Calculate averages for last 30 days
    const last30Days = data.dailyData
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - entryDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays < 30;
      })
      .slice(0, 30);

    const totalVisits30Days = last30Days.reduce((sum, entry) => sum + entry.homepageVisits, 0);
    const totalClicks30Days = last30Days.reduce((sum, entry) => sum + entry.readButtonClicks, 0);
    const daysWithData = Math.max(last30Days.length, 1);

    return {
      totalHomepageVisits: data.totalHomepageVisits,
      totalReadButtonClicks: data.totalReadButtonClicks,
      todayHomepageVisits: todayEntry?.homepageVisits || 0,
      todayReadButtonClicks: todayEntry?.readButtonClicks || 0,
      averageDailyVisits: Math.round(totalVisits30Days / daysWithData),
      averageDailyClicks: Math.round(totalClicks30Days / daysWithData),
    };
  }

  /**
   * Clear all analytics data
   */
  async clearAnalytics(): Promise<void> {
    try {
      if (typeof (this.storage as any).removeSync === "function") {
        (this.storage as any).removeSync(STORAGE_KEY);
        return;
      }
      if (this.storage.remove) {
        await this.storage.remove(STORAGE_KEY);
      } else {
        // Fallback: set to null/empty object
        await this.saveAnalytics({
          dailyData: [],
          totalHomepageVisits: 0,
          totalReadButtonClicks: 0,
          lastUpdated: this.getDateKey(),
        });
      }
    } catch (error) {
      console.error("Failed to clear analytics:", error);
    }
  }
}

