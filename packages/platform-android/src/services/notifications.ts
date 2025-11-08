import * as Notifications from "expo-notifications";
import {
  NotificationService,
  NotificationOptions,
  NotificationPermission,
} from "@boostlly/platform";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Android Notification Service using Expo Notifications
 */
export class AndroidNotificationService extends NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    super();
    this.checkPermission();
  }

  private async checkPermission(): Promise<void> {
    const { status } = await Notifications.getPermissionsAsync();
    this.hasPermission = status === "granted";
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === "granted";

      return finalStatus === "granted" ? "granted" : "denied";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  async show(options: NotificationOptions): Promise<void> {
    this.validateOptions(options);
    try {
      if (!this.hasPermission) {
        const permission = await this.requestPermission();
        if (permission !== "granted") {
          throw new Error("Notification permission not granted");
        }
      }

      const notificationOptions = {
        ...this.getDefaultOptions(),
        ...options,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationOptions.title,
          body: notificationOptions.message,
          data: notificationOptions.data || {},
          sound: notificationOptions.silent ? false : true,
          badge: notificationOptions.badge ? parseInt(notificationOptions.badge) : undefined,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error showing notification:", error);
      throw error;
    }
  }

  async close(tag?: string): Promise<void> {
    try {
      if (tag) {
        await Notifications.dismissNotificationAsync(tag);
      } else {
        await Notifications.dismissAllNotificationsAsync();
      }
    } catch (error) {
      console.error("Error closing notification:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  }
}

