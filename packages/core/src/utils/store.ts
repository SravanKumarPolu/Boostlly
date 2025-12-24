"use client";

import { logError, logDebug, logWarning } from "./logger";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createQuotesSlice, QuotesSlice } from "./quotes.slice";
import { createStreaksSlice, StreaksSlice } from "./streaks.slice";
import { createSettingsSlice, SettingsSlice } from "./settings.slice";
import { createProfileSlice, ProfileSlice } from "./profile.slice";
import { storageAdapter } from "./storageAdapter";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export type RootState = QuotesSlice &
  StreaksSlice &
  SettingsSlice &
  ProfileSlice;

const version = 1;

export const useStore = create<RootState>()(
  devtools(
    persist(
      (...a) => ({
        ...createQuotesSlice(...a),
        ...createStreaksSlice(...a),
        ...createSettingsSlice(...a),
        ...createProfileSlice(...a),
      }),
      {
        name: "boostlly.state",
        version,
        storage: isBrowser
          ? {
              getItem: async (name: string) => {
                const value = await storageAdapter.getItem(name);
                return value ? JSON.parse(value) : null;
              },
              setItem: async (name: string, value: any) => {
                await storageAdapter.setItem(name, JSON.stringify(value));
              },
              removeItem: async (name: string) => {
                await storageAdapter.removeItem(name);
              },
            }
          : undefined,
        partialize: (state) => ({
          // Only persist essential data, avoid transient UI flags
          quotes: state.quotes,
          streaks: state.streaks,
          settings: state.settings,
          profile: state.profile,
        }),
        migrate: (persisted: any, version: number) => {
          if (!persisted) return persisted;

          // Handle future migrations here
          if (version < 1) {
            // Example migration from v0 to v1
            return persisted;
          }

          return persisted;
        },
        onRehydrateStorage: () => (state) => {
          // Optional: Handle rehydration completion
          if (state) {
            logDebug("Store rehydrated successfully");
          }
        },
      },
    ),
    {
      name: "BoostllyStore",
      // Enable Redux DevTools integration
      enabled: process.env.NODE_ENV === "development" && isBrowser,
    },
  ),
);

// Safe store access hook
function useSafeStore<T>(selector: (state: RootState) => T): T {
  if (!isBrowser) {
    // Return default values during SSR
    return {} as T;
  }
  return useStore(selector);
}

// Convenience selectors for common state access
export const useQuotes = () => useSafeStore((state) => state.quotes);
export const useStreaks = () => useSafeStore((state) => state.streaks);
export const useSettings = () => useSafeStore((state) => state.settings);
export const useProfile = () => useSafeStore((state) => state.profile);

// Specific selectors to prevent unnecessary re-renders
export const useTodayQuote = () => useSafeStore((state) => state.quotes.today);
export const useSavedQuotes = () => useSafeStore((state) => state.quotes.saved);
export const useCollections = () =>
  useSafeStore((state) => state.quotes.collections);
export const useIsLoading = () =>
  useSafeStore((state) => state.quotes.isLoading);

export const useCurrentStreak = () =>
  useSafeStore((state) => state.streaks.reading.current);
export const useLongestStreak = () =>
  useSafeStore((state) => state.streaks.reading.longest);
export const useBadges = () => useSafeStore((state) => state.streaks.badges);

export const useThemeValue = () => useSafeStore((state) => state.settings.theme);
// Dynamic theme removed
// Note: For applying theme to document root, use useTheme from @boostlly/features
export const useNotifications = () =>
  useSafeStore((state) => state.settings.notifications);
export const useSoundSettings = () =>
  useSafeStore((state) => state.settings.sound);

export const useUserProfile = () => useSafeStore((state) => state.profile.user);
export const useProfileStats = () =>
  useSafeStore((state) => state.profile.user?.stats);

// Individual action selectors to prevent infinite loops
export const useSetTodayQuote = () =>
  useSafeStore((state) => state.setTodayQuote);
export const useAddSavedQuote = () =>
  useSafeStore((state) => state.addSavedQuote);
export const useRemoveSavedQuote = () =>
  useSafeStore((state) => state.removeSavedQuote);
export const useRefreshTodayQuote = () =>
  useSafeStore((state) => state.refreshTodayQuote);
export const useAddCollection = () =>
  useSafeStore((state) => state.addCollection);
export const useUpdateCollection = () =>
  useSafeStore((state) => state.updateCollection);
export const useRemoveCollection = () =>
  useSafeStore((state) => state.removeCollection);
export const useAddQuoteToCollection = () =>
  useSafeStore((state) => state.addQuoteToCollection);
export const useRemoveQuoteFromCollection = () =>
  useSafeStore((state) => state.removeQuoteFromCollection);

export const useUpdateReadingStreak = () =>
  useSafeStore((state) => state.updateReadingStreak);
export const useUpdateSharingStreak = () =>
  useSafeStore((state) => state.updateSharingStreak);
export const useUpdateCollectionsStreak = () =>
  useSafeStore((state) => state.updateCollectionsStreak);
export const useUnlockBadge = () => useSafeStore((state) => state.unlockBadge);
export const useUpdateBadgeProgress = () =>
  useSafeStore((state) => state.updateBadgeProgress);

export const useSetTheme = () => useSafeStore((state) => state.setTheme);
// Dynamic theme removed
export const useSetNotifications = () =>
  useSafeStore((state) => state.setNotifications);
export const useSetSoundSettings = () =>
  useSafeStore((state) => state.setSoundSettings);
export const useToggleNotifications = () =>
  useSafeStore((state) => state.toggleNotifications);
export const useToggleSoundEffects = () =>
  useSafeStore((state) => state.toggleSoundEffects);
export const useToggleSpeech = () =>
  useSafeStore((state) => state.toggleSpeech);

export const useSetProfile = () => useSafeStore((state) => state.setProfile);
export const useUpdateProfile = () =>
  useSafeStore((state) => state.updateProfile);
export const useCreateProfile = () =>
  useSafeStore((state) => state.createProfile);
export const useIncrementQuotesRead = () =>
  useSafeStore((state) => state.incrementQuotesRead);
export const useIncrementQuotesSaved = () =>
  useSafeStore((state) => state.incrementQuotesSaved);
export const useIncrementCollections = () =>
  useSafeStore((state) => state.incrementCollections);
export const useIncrementShares = () =>
  useSafeStore((state) => state.incrementShares);

// Legacy action selectors for backward compatibility (deprecated)
export const useQuoteActions = () =>
  useSafeStore((state) => ({
    setTodayQuote: state.setTodayQuote,
    addSavedQuote: state.addSavedQuote,
    removeSavedQuote: state.removeSavedQuote,
    refreshTodayQuote: state.refreshTodayQuote,
    addCollection: state.addCollection,
    updateCollection: state.updateCollection,
    removeCollection: state.removeCollection,
    addQuoteToCollection: state.addQuoteToCollection,
    removeQuoteFromCollection: state.removeQuoteFromCollection,
  }));

export const useStreakActions = () =>
  useSafeStore((state) => ({
    updateReadingStreak: state.updateReadingStreak,
    updateSharingStreak: state.updateSharingStreak,
    updateCollectionsStreak: state.updateCollectionsStreak,
    unlockBadge: state.unlockBadge,
    updateBadgeProgress: state.updateBadgeProgress,
  }));

export const useSettingsActions = () =>
  useSafeStore((state) => ({
    setTheme: state.setTheme,
    setNotifications: state.setNotifications,
    setSoundSettings: state.setSoundSettings,
    toggleNotifications: state.toggleNotifications,
    toggleSoundEffects: state.toggleSoundEffects,
    toggleSpeech: state.toggleSpeech,
  }));

export const useProfileActions = () =>
  useSafeStore((state) => ({
    setProfile: state.setProfile,
    updateProfile: state.updateProfile,
    createProfile: state.createProfile,
    incrementQuotesRead: state.incrementQuotesRead,
    incrementQuotesSaved: state.incrementQuotesSaved,
    incrementCollections: state.incrementCollections,
    incrementShares: state.incrementShares,
  }));
