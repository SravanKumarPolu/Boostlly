/**
 * Streaks slice for Zustand store
 * Manages user streaks, badges, and achievement tracking
 */

import { StateCreator } from "zustand";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  maxProgress: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastSeen: number | null;
  startDate: number | null;
}

export interface StreaksSlice {
  // State
  streaks: {
    reading: Streak;
    sharing: Streak;
    collections: Streak;
    badges: Badge[];
  };

  // Actions
  updateReadingStreak: (date?: number) => void;
  updateSharingStreak: (date?: number) => void;
  updateCollectionsStreak: (date?: number) => void;

  setBadges: (badges: Badge[]) => void;
  unlockBadge: (badgeId: string) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;

  // Computed actions
  resetStreaks: () => void;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
}

const DEFAULT_BADGES: Badge[] = [
  {
    id: "first-quote",
    name: "First Quote",
    description: "Read your first quote",
    icon: "🌟",
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "week-streak",
    name: "Week Warrior",
    description: "Read quotes for 7 days in a row",
    icon: "🔥",
    unlockedAt: null,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: "month-streak",
    name: "Monthly Master",
    description: "Read quotes for 30 days in a row",
    icon: "👑",
    unlockedAt: null,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: "quote-collector",
    name: "Quote Collector",
    description: "Save 10 quotes",
    icon: "📚",
    unlockedAt: null,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "sharing-champion",
    name: "Sharing Champion",
    description: "Share 5 quotes",
    icon: "📤",
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
];

const createStreak = (): Streak => ({
  current: 0,
  longest: 0,
  lastSeen: null,
  startDate: null,
});

export const createStreaksSlice: StateCreator<StreaksSlice> = (set, get) => ({
  streaks: {
    reading: createStreak(),
    sharing: createStreak(),
    collections: createStreak(),
    badges: DEFAULT_BADGES,
  },

  updateReadingStreak: (date = Date.now()) =>
    set((state) => {
      const streak = state.streaks.reading;
      const today = new Date(date).setHours(0, 0, 0, 0);
      const lastSeen = streak.lastSeen
        ? new Date(streak.lastSeen).setHours(0, 0, 0, 0)
        : null;

      let newStreak = { ...streak };

      if (!lastSeen || today > lastSeen) {
        if (lastSeen && today - lastSeen === 86400000) {
          // Consecutive day
          newStreak.current += 1;
          newStreak.longest = Math.max(newStreak.current, newStreak.longest);
        } else if (!lastSeen || today - lastSeen > 86400000) {
          // New streak or broken streak
          newStreak.current = 1;
          newStreak.startDate = today;
        }

        newStreak.lastSeen = date;
      }

      return {
        streaks: { ...state.streaks, reading: newStreak },
      };
    }),

  updateSharingStreak: (date = Date.now()) =>
    set((state) => {
      const streak = state.streaks.sharing;
      const today = new Date(date).setHours(0, 0, 0, 0);
      const lastSeen = streak.lastSeen
        ? new Date(streak.lastSeen).setHours(0, 0, 0, 0)
        : null;

      let newStreak = { ...streak };

      if (!lastSeen || today > lastSeen) {
        if (lastSeen && today - lastSeen === 86400000) {
          newStreak.current += 1;
          newStreak.longest = Math.max(newStreak.current, newStreak.longest);
        } else if (!lastSeen || today - lastSeen > 86400000) {
          newStreak.current = 1;
          newStreak.startDate = today;
        }

        newStreak.lastSeen = date;
      }

      return {
        streaks: { ...state.streaks, sharing: newStreak },
      };
    }),

  updateCollectionsStreak: (date = Date.now()) =>
    set((state) => {
      const streak = state.streaks.collections;
      const today = new Date(date).setHours(0, 0, 0, 0);
      const lastSeen = streak.lastSeen
        ? new Date(streak.lastSeen).setHours(0, 0, 0, 0)
        : null;

      let newStreak = { ...streak };

      if (!lastSeen || today > lastSeen) {
        if (lastSeen && today - lastSeen === 86400000) {
          newStreak.current += 1;
          newStreak.longest = Math.max(newStreak.current, newStreak.longest);
        } else if (!lastSeen || today - lastSeen > 86400000) {
          newStreak.current = 1;
          newStreak.startDate = today;
        }

        newStreak.lastSeen = date;
      }

      return {
        streaks: { ...state.streaks, collections: newStreak },
      };
    }),

  setBadges: (badges) =>
    set((state) => ({
      streaks: { ...state.streaks, badges },
    })),

  unlockBadge: (badgeId) =>
    set((state) => ({
      streaks: {
        ...state.streaks,
        badges: state.streaks.badges.map((badge) =>
          badge.id === badgeId ? { ...badge, unlockedAt: Date.now() } : badge,
        ),
      },
    })),

  updateBadgeProgress: (badgeId, progress) =>
    set((state) => ({
      streaks: {
        ...state.streaks,
        badges: state.streaks.badges.map((badge) =>
          badge.id === badgeId
            ? {
                ...badge,
                progress: Math.min(progress, badge.maxProgress),
                unlockedAt:
                  progress >= badge.maxProgress && !badge.unlockedAt
                    ? Date.now()
                    : badge.unlockedAt,
              }
            : badge,
        ),
      },
    })),

  resetStreaks: () =>
    set((state) => ({
      streaks: {
        ...state.streaks,
        reading: createStreak(),
        sharing: createStreak(),
        collections: createStreak(),
      },
    })),

  getCurrentStreak: () => {
    const state = get();
    return state.streaks.reading.current;
  },

  getLongestStreak: () => {
    const state = get();
    return state.streaks.reading.longest;
  },
});
