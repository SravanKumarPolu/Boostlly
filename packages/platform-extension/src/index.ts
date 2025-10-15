// Chrome extension platform implementations
import { ExtensionStorageService } from "./services/storage";
import {
  ExtensionNotificationService,
  SmartNotificationOptions,
} from "./services/notifications";
import { ExtensionAlarmService } from "./services/alarms";

export {
  ExtensionStorageService,
  ExtensionNotificationService,
  ExtensionAlarmService,
};
export type { SmartNotificationOptions };

// Default exports for convenience
export const StorageService = ExtensionStorageService;
export const NotificationService = ExtensionNotificationService;
export const AlarmService = ExtensionAlarmService;
