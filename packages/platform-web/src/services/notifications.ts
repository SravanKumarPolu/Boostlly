import { NotificationService, NotificationOptions } from "@boostlly/platform";
import { logDebug } from "@boostlly/core";

export class WebNotificationService extends NotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async show(options: NotificationOptions): Promise<void> {
    this.validateOptions(options);

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const notificationOptions = {
      ...this.getDefaultOptions(),
      ...options,
    };

    new Notification(notificationOptions.title, {
      body: notificationOptions.message,
      icon: notificationOptions.icon,
      badge: notificationOptions.badge,
      tag: notificationOptions.tag,
      data: notificationOptions.data,
      requireInteraction: notificationOptions.requireInteraction,
      silent: notificationOptions.silent,
    });
  }

  async close(tag?: string): Promise<void> {
    // Browser notifications are automatically closed
    // This is mainly for API compatibility
    logDebug("Closing notification", { tag });
  }

  async clear(): Promise<void> {
    // Browser notifications are automatically cleared
    // This is mainly for API compatibility
    logDebug("Clearing all notifications");
  }
}
