// Web platform implementations
import { WebStorageService } from "./services/storage";
import { WebNotificationService } from "./services/notifications";
import { WebAlarmService } from "./services/alarms";

export { WebStorageService, WebNotificationService, WebAlarmService };

// Default exports for convenience
export const StorageService = WebStorageService;
export const NotificationService = WebNotificationService;
export const AlarmService = WebAlarmService;
