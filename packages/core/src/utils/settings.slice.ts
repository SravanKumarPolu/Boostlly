/**
 * Settings slice for Zustand store
 * Manages user preferences, theme, sound effects, and notifications
 */

import { StateCreator } from "zustand";
import { Theme, DynamicTheme } from "../types";

export type NotificationType = "daily" | "weekly" | "never";
export type ReminderTone = "gentle" | "energetic" | "calm" | "motivational" | "peaceful";

export interface NotificationSettings {
  enabled: boolean;
  type: NotificationType;
  time: string; // HH:MM format
  tone?: ReminderTone; // Reminder tone/vibe
  sound: boolean;
  vibration: boolean;
}

export interface SoundSettings {
  effects: boolean;
  volume: number; // 0-100
  speech: boolean;
  speechRate: number; // 0.1-2.0
  speechVolume: number; // 0-100
}

export interface SettingsSlice {
  // State
  settings: {
    theme: Theme;
    dynamicTheme: DynamicTheme;
    notifications: NotificationSettings;
    sound: SoundSettings;
    language: string;
    timezone: string;
    autoSave: boolean;
    showTutorial: boolean;
    lastUpdated: number | null;
  };

  // Actions
  setTheme: (theme: Theme) => void;
  setDynamicTheme: (dynamicTheme: Partial<DynamicTheme>) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setSoundSettings: (settings: Partial<SoundSettings>) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setShowTutorial: (show: boolean) => void;

  // Computed actions
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  toggleSpeech: () => void;
  resetSettings: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  type: "daily",
  time: "09:00",
  tone: "gentle",
  sound: true,
  vibration: false,
};

const DEFAULT_SOUND: SoundSettings = {
  effects: true,
  volume: 80,
  speech: true,
  speechRate: 0.8,
  speechVolume: 80,
};

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: {
    theme: "auto",
    dynamicTheme: {
      isDark: false,
      accent: "#7C3AED",
      brightness: 180,
      dominantColor: "#f0f0f0",
      isAnalyzing: false,
    },
        notifications: {
          ...DEFAULT_NOTIFICATIONS,
          tone: "gentle" as ReminderTone,
        },
    sound: DEFAULT_SOUND,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    autoSave: true,
    showTutorial: true,
    lastUpdated: null,
  },

  setTheme: (theme) =>
    set((state) => ({
      settings: {
        ...state.settings,
        theme,
        lastUpdated: Date.now(),
      },
    })),

  setDynamicTheme: (dynamicTheme) =>
    set((state) => ({
      settings: {
        ...state.settings,
        dynamicTheme: { ...state.settings.dynamicTheme, ...dynamicTheme },
        lastUpdated: Date.now(),
      },
    })),

  setNotifications: (settings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: { ...state.settings.notifications, ...settings },
        lastUpdated: Date.now(),
      },
    })),

  setSoundSettings: (settings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        sound: { ...state.settings.sound, ...settings },
        lastUpdated: Date.now(),
      },
    })),

  setLanguage: (language) =>
    set((state) => ({
      settings: {
        ...state.settings,
        language,
        lastUpdated: Date.now(),
      },
    })),

  setTimezone: (timezone) =>
    set((state) => ({
      settings: {
        ...state.settings,
        timezone,
        lastUpdated: Date.now(),
      },
    })),

  setAutoSave: (enabled) =>
    set((state) => ({
      settings: {
        ...state.settings,
        autoSave: enabled,
        lastUpdated: Date.now(),
      },
    })),

  setShowTutorial: (show) =>
    set((state) => ({
      settings: {
        ...state.settings,
        showTutorial: show,
        lastUpdated: Date.now(),
      },
    })),

  toggleNotifications: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          enabled: !state.settings.notifications.enabled,
        },
        lastUpdated: Date.now(),
      },
    })),

  toggleSoundEffects: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        sound: {
          ...state.settings.sound,
          effects: !state.settings.sound.effects,
        },
        lastUpdated: Date.now(),
      },
    })),

  toggleSpeech: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        sound: {
          ...state.settings.sound,
          speech: !state.settings.sound.speech,
        },
        lastUpdated: Date.now(),
      },
    })),

  resetSettings: () =>
    set(() => ({
      settings: {
        theme: "auto",
        dynamicTheme: {
          isDark: false,
          accent: "#7C3AED",
          brightness: 180,
          dominantColor: "#f0f0f0",
          isAnalyzing: false,
        },
        notifications: {
          ...DEFAULT_NOTIFICATIONS,
          tone: "gentle" as ReminderTone,
        },
        sound: DEFAULT_SOUND,
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        autoSave: true,
        showTutorial: true,
        lastUpdated: Date.now(),
      },
    })),
});
