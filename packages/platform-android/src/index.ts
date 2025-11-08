// Android platform implementations
import { AndroidStorageService } from "./services/storage";
import { AndroidNotificationService } from "./services/notifications";
import { AndroidAlarmService } from "./services/alarms";

export {
  AndroidStorageService,
  AndroidNotificationService,
  AndroidAlarmService,
};

// Default exports for convenience
export const StorageService = AndroidStorageService;
export const NotificationService = AndroidNotificationService;
export const AlarmService = AndroidAlarmService;

