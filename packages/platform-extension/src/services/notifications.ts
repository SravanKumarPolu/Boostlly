import { NotificationService, NotificationOptions } from "@boostlly/platform";

export interface SmartNotificationOptions extends NotificationOptions {
  type?: "quote" | "reminder" | "achievement" | "community" | "custom";
  priority?: "low" | "normal" | "high";
  category?: string;
  scheduledFor?: Date;
  repeatInterval?: "daily" | "weekly" | "monthly" | "never";
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: {
    quoteId?: string;
    userId?: string;
    achievementId?: string;
    [key: string]: any;
  };
}

export class ExtensionNotificationService extends NotificationService {
  private scheduledNotifications: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  private notificationHistory: Array<{
    id: string;
    timestamp: Date;
    options: SmartNotificationOptions;
  }> = [];

  async requestPermission(): Promise<NotificationPermission> {
    // Chrome extensions have notification permissions by default
    return "granted";
  }

  async show(options: SmartNotificationOptions): Promise<void> {
    this.validateOptions(options);

    // Handle scheduled notifications
    if (options.scheduledFor) {
      return this.scheduleNotification(options);
    }

    // Handle immediate notifications
    return this.showImmediateNotification(options);
  }

  private async showImmediateNotification(
    options: SmartNotificationOptions,
  ): Promise<void> {
    const notificationOptions = {
      ...this.getDefaultOptions(),
      ...options,
    };

    const notificationId = this.generateNotificationId();

    return new Promise((resolve, reject) => {
      chrome.notifications.create(
        notificationId,
        {
          type: "basic",
          iconUrl: this.getNotificationIcon(options.type),
          title: notificationOptions.title,
          message: notificationOptions.message,
          requireInteraction: notificationOptions.requireInteraction || false,
          silent: notificationOptions.silent || false,
          buttons:
            options.actions?.map((action) => ({
              title: action.title,
              iconUrl: action.icon,
            })) || [],
        },
        (notificationId) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            // Store in history
            this.notificationHistory.push({
              id: notificationId || "unknown",
              timestamp: new Date(),
              options,
            });

            // Limit history size
            if (this.notificationHistory.length > 100) {
              this.notificationHistory.shift();
            }

            resolve();
          }
        },
      );
    });
  }

  private async scheduleNotification(
    options: SmartNotificationOptions,
  ): Promise<void> {
    const now = new Date();
    const scheduledTime = new Date(options.scheduledFor!);

    if (scheduledTime <= now) {
      // If scheduled time has passed, show immediately
      return this.showImmediateNotification(options);
    }

    const delayMs = scheduledTime.getTime() - now.getTime();
    const notificationId = this.generateNotificationId();

    // Schedule the notification
    const timeoutId = setTimeout(async () => {
      await this.showImmediateNotification(options);

      // Handle repeat scheduling
      if (options.repeatInterval && options.repeatInterval !== "never") {
        await this.scheduleRepeatingNotification(options);
      }

      this.scheduledNotifications.delete(notificationId);
    }, delayMs);

    this.scheduledNotifications.set(notificationId, timeoutId);
  }

  private async scheduleRepeatingNotification(
    options: SmartNotificationOptions,
  ): Promise<void> {
    const repeatOptions = { ...options };

    switch (options.repeatInterval) {
      case "daily":
        repeatOptions.scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        repeatOptions.scheduledFor = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );
        break;
      case "monthly":
        repeatOptions.scheduledFor = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        );
        break;
      default:
        return;
    }

    await this.scheduleNotification(repeatOptions);
  }

  // Smart notification methods
  async showDailyQuote(
    quote: { text: string; author: string },
    scheduledTime?: Date,
  ): Promise<void> {
    const time = scheduledTime || this.getDefaultQuoteTime();

    await this.show({
      title: "🌅 Daily Motivation",
      message: `"${quote.text}" — ${quote.author}`,
      type: "quote",
      priority: "high",
      category: "daily-quote",
      scheduledFor: time,
      repeatInterval: "daily",
      requireInteraction: false,
      silent: false,
      data: { quoteId: "daily" },
    });
  }

  async showAchievement(achievement: {
    name: string;
    description: string;
  }): Promise<void> {
    await this.show({
      title: "🏆 Achievement Unlocked!",
      message: `${achievement.name}: ${achievement.description}`,
      type: "achievement",
      priority: "high",
      category: "achievement",
      requireInteraction: true,
      silent: false,
      actions: [
        { action: "view", title: "View Details", icon: "trophy" },
        { action: "share", title: "Share", icon: "share" },
      ],
    });
  }

  async showCommunityActivity(activity: {
    type: string;
    message: string;
    userId: string;
  }): Promise<void> {
    await this.show({
      title: "👥 Community Update",
      message: activity.message,
      type: "community",
      priority: "normal",
      category: "community",
      requireInteraction: false,
      silent: true,
      data: { userId: activity.userId },
    });
  }

  async showReminder(
    message: string,
    scheduledTime: Date,
    repeat?: "daily" | "weekly" | "monthly",
  ): Promise<void> {
    await this.show({
      title: "⏰ Reminder",
      message,
      type: "reminder",
      priority: "normal",
      category: "reminder",
      scheduledFor: scheduledTime,
      repeatInterval: repeat || "never",
      requireInteraction: false,
      silent: false,
    });
  }

  // Utility methods
  private generateNotificationId(): string {
    return `boostlly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNotificationIcon(type?: string): string {
    switch (type) {
      case "quote":
        return "icon-48.png";
      case "achievement":
        return "icon-48.png";
      case "community":
        return "icon-48.png";
      case "reminder":
        return "icon-48.png";
      default:
        return "icon-48.png";
    }
  }

  private getDefaultQuoteTime(): Date {
    const now = new Date();
    // Default to 9:00 AM
    now.setHours(9, 0, 0, 0);

    // If it's already past 9 AM, schedule for tomorrow
    if (now <= new Date()) {
      now.setDate(now.getDate() + 1);
    }

    return now;
  }

  // Enhanced notification management
  async getNotificationHistory(): Promise<
    Array<{ id: string; timestamp: Date; options: SmartNotificationOptions }>
  > {
    return [...this.notificationHistory];
  }

  async clearScheduledNotifications(): Promise<void> {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  async getScheduledNotifications(): Promise<
    Array<{ id: string; scheduledFor: Date; options: SmartNotificationOptions }>
  > {
    const scheduled: Array<{
      id: string;
      scheduledFor: Date;
      options: SmartNotificationOptions;
    }> = [];

    this.scheduledNotifications.forEach((_timeoutId, id) => {
      // Note: This is a simplified version - in a real implementation,
      // you'd want to store the actual scheduled data
      scheduled.push({
        id,
        scheduledFor: new Date(Date.now() + 1000), // Placeholder
        options: {} as SmartNotificationOptions,
      });
    });

    return scheduled;
  }

  // Override base methods
  async close(tag?: string): Promise<void> {
    if (tag) {
      return new Promise((resolve, reject) => {
        chrome.notifications.clear(tag, (_wasCleared) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.notifications.getAll((notifications) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const promises = Object.keys(notifications).map(
            (id) =>
              new Promise<void>((resolve) => {
                chrome.notifications.clear(id, () => resolve());
              }),
          );
          Promise.all(promises).then(() => resolve());
        }
      });
    });
  }
}
