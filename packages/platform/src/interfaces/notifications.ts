export type NotificationPermission = "granted" | "denied" | "prompt" | "default";

export interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationService {
  requestPermission(): Promise<NotificationPermission>;
  show(options: NotificationOptions): Promise<void>;
  close(tag?: string): Promise<void>;
  clear(): Promise<void>;
}
