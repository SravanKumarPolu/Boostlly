/**
 * Notification Settings Component
 * 
 * Provides UI for configuring daily notifications:
 * - Enable/disable notifications
 * - Time picker for daily notification time
 * - Sound toggle
 * - Vibration toggle
 * - Reminder tone selector
 */

import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Switch } from "@boostlly/ui";
import { Bell, Clock, Volume2, Vibrate, Music } from "lucide-react";
import { NotificationSettings, ReminderTone } from "@boostlly/core";
import { DailyNotificationScheduler } from "@boostlly/core/services/daily-notification-scheduler";
import { QuoteService } from "@boostlly/core";

interface NotificationSettingsProps {
  storage: any;
  quoteService: QuoteService;
  scheduler?: DailyNotificationScheduler;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

const REMINDER_TONES: Array<{ value: ReminderTone; label: string; description: string }> = [
  { value: "gentle", label: "Gentle", description: "Soft and calming" },
  { value: "calm", label: "Calm", description: "Peaceful and soothing" },
  { value: "peaceful", label: "Peaceful", description: "Tranquil and serene" },
  { value: "energetic", label: "Energetic", description: "Upbeat and motivating" },
  { value: "motivational", label: "Motivational", description: "Inspiring and uplifting" },
];

export function NotificationSettingsComponent({
  storage,
  quoteService,
  scheduler,
  onSettingsChange,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    type: "daily",
    time: "09:00",
    tone: "gentle",
    sound: true,
    vibration: false,
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await storage.get("notificationSettings");
      if (saved) {
        const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
        setSettings(parsed);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  };

  const checkPermission = () => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      await storage.set("notificationSettings", JSON.stringify(updated));
      
      // Update scheduler if provided
      if (scheduler) {
        await scheduler.updateSchedule();
      }
      
      if (onSettingsChange) {
        onSettingsChange(updated);
      }
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported in this browser.");
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === "granted") {
        await saveSettings({ enabled: true });
      } else {
        await saveSettings({ enabled: false });
        alert("Notification permission denied. Please enable it in your browser settings.");
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableToggle = async (enabled: boolean) => {
    if (enabled && permissionStatus !== "granted") {
      await requestPermission();
      return;
    }
    
    await saveSettings({ enabled });
  };

  const handleTimeChange = (time: string) => {
    saveSettings({ time });
  };

  const handleTestNotification = async () => {
    if (permissionStatus !== "granted") {
      await requestPermission();
      return;
    }

    setTestNotificationLoading(true);
    try {
      if (scheduler) {
        await scheduler.testNotification(settings);
      } else {
        // Fallback: show notification directly
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🌅 Daily Motivation", {
            body: "This is a test notification. Your daily quote will appear here!",
            icon: "/icon-192.png",
            tag: "test-notification",
            silent: !settings.sound,
          });
        }
      }
    } catch (error) {
      console.error("Failed to show test notification:", error);
    } finally {
      setTestNotificationLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Daily Notifications
        </h3>
        <p className="text-sm text-muted-foreground">
          Get your daily motivation quote at a time that works for you
        </p>
      </div>

      {/* Enable Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium block">Enable Daily Notifications</span>
              <span className="text-xs text-muted-foreground">
                Receive a daily motivational quote notification
              </span>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleEnableToggle}
              disabled={isLoading || permissionStatus === "denied"}
            />
          </div>

          {permissionStatus === "denied" && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}

          {permissionStatus === "default" && !settings.enabled && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Click the toggle above to request notification permission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Picker */}
      {settings.enabled && permissionStatus === "granted" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Notification Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Daily notification time
              </label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Currently set to {formatTime(settings.time)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sound & Vibration */}
      {settings.enabled && permissionStatus === "granted" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sound & Vibration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium block">Sound</span>
                <span className="text-xs text-muted-foreground">
                  Play a sound when notification appears
                </span>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => saveSettings({ sound: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium block flex items-center gap-2">
                  <Vibrate className="w-4 h-4" />
                  Vibration
                </span>
                <span className="text-xs text-muted-foreground">
                  Vibrate device when notification appears (mobile only)
                </span>
              </div>
              <Switch
                checked={settings.vibration}
                onCheckedChange={(checked) => saveSettings({ vibration: checked })}
                disabled={!("vibrate" in navigator)}
              />
            </div>

            {!("vibrate" in navigator) && (
              <p className="text-xs text-muted-foreground">
                Vibration is not supported on this device
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reminder Tone */}
      {settings.enabled && permissionStatus === "granted" && settings.sound && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Reminder Tone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose the tone for your notification sound
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REMINDER_TONES.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => saveSettings({ tone: tone.value })}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${
                      settings.tone === tone.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                >
                  <div className="font-medium text-sm">{tone.label}</div>
                  <div className="text-xs text-muted-foreground">{tone.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Notification */}
      {settings.enabled && permissionStatus === "granted" && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleTestNotification}
              disabled={testNotificationLoading}
              variant="outline"
              className="w-full"
            >
              {testNotificationLoading ? (
                "Sending test notification..."
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notification
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Send a test notification to preview how it will look and sound
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

