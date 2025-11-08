import * as Notifications from "expo-notifications";
import {
  AlarmService,
  AlarmOptions,
  AlarmInfo,
} from "@boostlly/platform";

/**
 * Android Alarm Service using Expo Notifications
 * 
 * Uses scheduled notifications to implement alarm functionality
 */
export class AndroidAlarmService extends AlarmService {
  private alarmCallbacks: Map<string, (alarm: AlarmInfo) => void> = new Map();
  private scheduledAlarms: Map<string, AlarmInfo> = new Map();

  constructor() {
    super();
    this.setupNotificationHandlers();
  }

  private setupNotificationHandlers(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      const alarmName = notification.request.content.data?.alarmName as string;
      if (alarmName && this.alarmCallbacks.has(alarmName)) {
        const alarmInfo = this.scheduledAlarms.get(alarmName);
        if (alarmInfo) {
          const callback = this.alarmCallbacks.get(alarmName);
          if (callback) {
            callback(alarmInfo);
          }
        }
      }
    });

    // Handle notification response (user interaction)
    Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const alarmName = response.notification.request.content.data?.alarmName as string;
      if (alarmName && this.alarmCallbacks.has(alarmName)) {
        const alarmInfo = this.scheduledAlarms.get(alarmName);
        if (alarmInfo) {
          const callback = this.alarmCallbacks.get(alarmName);
          if (callback) {
            callback(alarmInfo);
          }
        }
      }
    });
  }

  async create(name: string, options: AlarmOptions): Promise<void> {
    this.validateOptions(options);
    try {
      let trigger: Date | number;

      if (options.when) {
        trigger = new Date(options.when);
      } else if (options.delayInMinutes) {
        trigger = new Date(Date.now() + options.delayInMinutes * 60 * 1000);
      } else {
        throw new Error("Either 'when' or 'delayInMinutes' must be provided");
      }

      const alarmInfo: AlarmInfo = {
        name,
        scheduledTime: trigger.getTime(),
        periodInMinutes: options.periodInMinutes,
      };

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Boostlly Reminder",
          body: "Time for your daily motivation!",
          data: { alarmName: name },
          sound: true,
        },
        trigger: trigger,
      });

      // Store alarm info with notification ID
      this.scheduledAlarms.set(name, {
        ...alarmInfo,
        name: `${name}_${notificationId}`,
      });

      // If it's a repeating alarm, schedule the next occurrence
      if (options.periodInMinutes) {
        // Note: Expo doesn't support repeating notifications directly
        // You would need to reschedule after each trigger
        // For now, we'll just store the period for future rescheduling
      }
    } catch (error) {
      console.error(`Error creating alarm ${name}:`, error);
      throw error;
    }
  }

  async get(name: string): Promise<AlarmInfo | null> {
    return this.scheduledAlarms.get(name) || null;
  }

  async getAll(): Promise<AlarmInfo[]> {
    return Array.from(this.scheduledAlarms.values());
  }

  async clear(name: string): Promise<void> {
    try {
      const alarmInfo = this.scheduledAlarms.get(name);
      if (alarmInfo) {
        // Extract notification ID from stored name if needed
        // For now, we'll cancel all and recreate
        await Notifications.cancelAllScheduledNotificationsAsync();
        this.scheduledAlarms.delete(name);
      }
    } catch (error) {
      console.error(`Error clearing alarm ${name}:`, error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledAlarms.clear();
    } catch (error) {
      console.error("Error clearing all alarms:", error);
      throw error;
    }
  }

  onAlarm(callback: (alarm: AlarmInfo) => void): void {
    super.onAlarm(callback);
    // Store callback for all alarms
    // In a more sophisticated implementation, you'd map specific alarms
    this.alarmCallbacks.set("default", callback);
  }
}

