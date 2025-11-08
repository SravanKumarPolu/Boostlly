import {
  NotificationService as INotificationService,
  NotificationOptions,
  NotificationPermission,
} from "../interfaces/notifications";

export abstract class NotificationService implements INotificationService {
  abstract requestPermission(): Promise<NotificationPermission>;
  abstract show(options: NotificationOptions): Promise<void>;
  abstract close(tag?: string): Promise<void>;
  abstract clear(): Promise<void>;

  protected validateOptions(options: NotificationOptions): void {
    if (!options.title || !options.message) {
      throw new Error("Notification title and message are required");
    }
  }

  protected getDefaultOptions(): Partial<NotificationOptions> {
    return {
      requireInteraction: false,
      silent: false,
      actions: [],
    };
  }
}
