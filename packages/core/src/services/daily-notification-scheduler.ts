/**
 * Daily Notification Scheduler Service
 * 
 * Handles scheduling and managing daily quote notifications with:
 * - Persistent scheduling via service worker
 * - Time-based notifications
 * - Sound and vibration support
 * - Integration with notification settings
 */

import { logError, logDebug, logWarning } from "../utils/logger";
import { NotificationSettings } from "../utils/settings.slice";
import { QuoteService } from "./quote-service";

export interface DailyNotificationSchedulerOptions {
  storage: any;
  quoteService: QuoteService;
  onNotificationClick?: () => void;
}

export class DailyNotificationScheduler {
  private storage: any;
  private quoteService: QuoteService;
  private onNotificationClick?: () => void;
  private scheduledAlarmId: string | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor(options: DailyNotificationSchedulerOptions) {
    this.storage = options.storage;
    this.quoteService = options.quoteService;
    this.onNotificationClick = options.onNotificationClick;
  }

  /**
   * Initialize the scheduler
   * Registers service worker and sets up notification handlers
   */
  async initialize(): Promise<void> {
    try {
      // Register service worker if available
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        this.serviceWorkerRegistration = registration;
        logDebug("Service worker ready for notifications");
      }

      // Set up notification click handler
      if (this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration.addEventListener(
          "notificationclick",
          this.handleNotificationClick.bind(this)
        );
      }

      // Load and apply current settings
      await this.updateSchedule();
    } catch (error) {
      logError("Failed to initialize notification scheduler:", { error });
    }
  }

  /**
   * Update the notification schedule based on current settings
   */
  async updateSchedule(): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      
      // Clear existing schedule
      await this.clearSchedule();

      if (!settings.enabled) {
        logDebug("Notifications disabled, schedule cleared");
        return;
      }

      // Schedule the notification
      await this.scheduleNotification(settings);
      logDebug("Notification schedule updated", { settings });
    } catch (error) {
      logError("Failed to update notification schedule:", { error });
    }
  }

  /**
   * Schedule a daily notification
   */
  private async scheduleNotification(settings: NotificationSettings): Promise<void> {
    try {
      const [hours, minutes] = settings.time.split(":").map(Number);
      const nextTime = this.getNextNotificationTime(hours, minutes);

      // Calculate delay in milliseconds
      const delay = nextTime.getTime() - Date.now();

      if (delay < 0) {
        logWarning("Notification time is in the past, scheduling for tomorrow");
        // Schedule for tomorrow
        const tomorrow = new Date(nextTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        await this.scheduleForTime(tomorrow, settings);
        return;
      }

      await this.scheduleForTime(nextTime, settings);
    } catch (error) {
      logError("Failed to schedule notification:", { error });
    }
  }

  /**
   * Schedule notification for a specific time
   */
  private async scheduleForTime(time: Date, settings: NotificationSettings): Promise<void> {
    try {
      // Use service worker for persistent scheduling if available
      if (this.serviceWorkerRegistration?.active) {
        // Send message to service worker to schedule notification
        this.serviceWorkerRegistration.active.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          time: time.getTime(),
          settings: {
            sound: settings.sound,
            vibration: settings.vibration,
            tone: settings.tone,
          },
        });

        this.scheduledAlarmId = `daily-quote-${time.getTime()}`;
        logDebug("Scheduled notification via service worker", { time, settings });
      } else {
        // Fallback: Use setTimeout (less reliable, only works when tab is open)
        const delay = time.getTime() - Date.now();
        if (delay > 0) {
          this.scheduledAlarmId = `daily-quote-${time.getTime()}`;
          setTimeout(() => {
            this.showNotification(settings);
            // Schedule next day
            const nextDay = new Date(time);
            nextDay.setDate(nextDay.getDate() + 1);
            this.scheduleForTime(nextDay, settings);
          }, delay);
          logDebug("Scheduled notification via setTimeout", { time, delay });
        }
      }
    } catch (error) {
      logError("Failed to schedule notification for time:", { error, time });
    }
  }

  /**
   * Show the notification
   */
  private async showNotification(settings: NotificationSettings): Promise<void> {
    try {
      // Get today's quote
      const quote = await this.quoteService.getDailyQuoteAsync();
      if (!quote) {
        logWarning("No quote available for notification");
        return;
      }

      // Request permission if needed
      if (!("Notification" in window)) {
        logWarning("Notifications not supported");
        return;
      }

      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        logWarning("Notification permission not granted");
        return;
      }

      // Show notification
      const notificationOptions: NotificationOptions = {
        body: `"${quote.text}" — ${quote.author}`,
        icon: "/icon-192.png",
        badge: "/icon-48.png",
        tag: "daily-quote",
        requireInteraction: false,
        silent: !settings.sound,
        data: {
          quoteId: quote.id,
          type: "daily-quote",
        },
      };

      // Use service worker notification if available
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(
          "🌅 Daily Motivation",
          notificationOptions
        );
      } else {
        new Notification("🌅 Daily Motivation", notificationOptions);
      }

      // Play sound if enabled
      if (settings.sound) {
        this.playNotificationSound(settings.tone || "gentle");
      }

      // Trigger vibration if enabled and supported
      if (settings.vibration && "vibrate" in navigator) {
        navigator.vibrate(this.getVibrationPattern(settings.tone || "gentle"));
      }

      logDebug("Notification shown", { quote, settings });
    } catch (error) {
      logError("Failed to show notification:", { error });
    }
  }

  /**
   * Play notification sound based on tone
   */
  private playNotificationSound(tone: string): void {
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Different tones have different frequencies
      const frequencies: Record<string, number> = {
        gentle: 440, // A4
        calm: 330, // E4
        peaceful: 220, // A3
        energetic: 554, // C#5
        motivational: 523, // C5
      };

      const frequency = frequencies[tone] || frequencies.gentle;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      logWarning("Failed to play notification sound:", { error });
    }
  }

  /**
   * Get vibration pattern based on tone
   */
  private getVibrationPattern(tone: string): number[] {
    const patterns: Record<string, number[]> = {
      gentle: [100],
      calm: [50, 50, 50],
      peaceful: [30, 30, 30, 30],
      energetic: [200, 100, 200],
      motivational: [150, 50, 150],
    };

    return patterns[tone] || patterns.gentle;
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(event: any): Promise<void> {
    return new Promise((resolve) => {
      if (event?.notification) {
        event.notification.close();
      }

      if (this.onNotificationClick) {
        this.onNotificationClick();
        resolve();
      } else {
        // Default: focus the window (only in browser context)
        if (typeof window !== 'undefined' && window.focus) {
          window.focus();
        }
        resolve();
      }
    });
  }

  /**
   * Clear the current schedule
   */
  async clearSchedule(): Promise<void> {
    try {
      if (this.serviceWorkerRegistration?.active) {
        this.serviceWorkerRegistration.active.postMessage({
          type: "CLEAR_NOTIFICATION",
        });
      }
      this.scheduledAlarmId = null;
      logDebug("Notification schedule cleared");
    } catch (error) {
      logError("Failed to clear notification schedule:", { error });
    }
  }

  /**
   * Get next notification time based on hours and minutes
   */
  private getNextNotificationTime(hours: number, minutes: number): Date {
    const now = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Get notification settings from storage
   */
  private async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await this.storage.get("notificationSettings");
      if (settings) {
        return JSON.parse(settings);
      }
    } catch (error) {
      logWarning("Failed to load notification settings, using defaults", { error });
    }

    // Default settings
    return {
      enabled: false,
      type: "daily",
      time: "09:00",
      tone: "gentle",
      sound: true,
      vibration: false,
    };
  }

  /**
   * Test notification (for preview)
   */
  async testNotification(settings?: NotificationSettings): Promise<void> {
    const testSettings = settings || await this.getNotificationSettings();
    await this.showNotification(testSettings);
  }
}

