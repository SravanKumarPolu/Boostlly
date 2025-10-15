/**
 * Profile slice for Zustand store
 * Manages user profile data (local-only, no backend)
 */

import { StateCreator } from "zustand";

export interface UserProfile {
  displayName: string;
  avatar: string;
  bio: string;
  joinDate: number;
  lastActive: number;
  preferences: {
    favoriteCategories: string[];
    readingGoal: number; // quotes per day
    privacyLevel: "public" | "private";
  };
  stats: {
    totalQuotesRead: number;
    totalQuotesSaved: number;
    totalCollections: number;
    totalShares: number;
    favoriteQuote: string | null;
  };
}

export interface ProfileSlice {
  // State
  profile: {
    user: UserProfile | null;
    isLoaded: boolean;
    lastUpdated: number | null;
  };

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserProfile["preferences"]>) => void;
  updateStats: (updates: Partial<UserProfile["stats"]>) => void;

  // Computed actions
  createProfile: (displayName: string, avatar?: string) => void;
  resetProfile: () => void;
  incrementQuotesRead: () => void;
  incrementQuotesSaved: () => void;
  incrementCollections: () => void;
  incrementShares: () => void;
  setFavoriteQuote: (quoteId: string | null) => void;
  addFavoriteCategory: (category: string) => void;
  removeFavoriteCategory: (category: string) => void;
}

const DEFAULT_PREFERENCES = {
  favoriteCategories: ["motivation", "inspiration"],
  readingGoal: 1,
  privacyLevel: "private" as const,
};

const DEFAULT_STATS = {
  totalQuotesRead: 0,
  totalQuotesSaved: 0,
  totalCollections: 0,
  totalShares: 0,
  favoriteQuote: null,
};

export const createProfileSlice: StateCreator<ProfileSlice> = (set) => ({
  profile: {
    user: null,
    isLoaded: false,
    lastUpdated: null,
  },

  setProfile: (profile) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: profile,
        isLoaded: true,
        lastUpdated: Date.now(),
      },
    })),

  updateProfile: (updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user ? { ...state.profile.user, ...updates } : null,
        lastUpdated: Date.now(),
      },
    })),

  updatePreferences: (updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              preferences: { ...state.profile.user.preferences, ...updates },
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  updateStats: (updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: { ...state.profile.user.stats, ...updates },
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  createProfile: (displayName, avatar = "👤") =>
    set(() => ({
      profile: {
        user: {
          displayName,
          avatar,
          bio: "",
          joinDate: Date.now(),
          lastActive: Date.now(),
          preferences: DEFAULT_PREFERENCES,
          stats: DEFAULT_STATS,
        },
        isLoaded: true,
        lastUpdated: Date.now(),
      },
    })),

  resetProfile: () =>
    set(() => ({
      profile: {
        user: null,
        isLoaded: false,
        lastUpdated: Date.now(),
      },
    })),

  incrementQuotesRead: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: {
                ...state.profile.user.stats,
                totalQuotesRead: state.profile.user.stats.totalQuotesRead + 1,
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  incrementQuotesSaved: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: {
                ...state.profile.user.stats,
                totalQuotesSaved: state.profile.user.stats.totalQuotesSaved + 1,
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  incrementCollections: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: {
                ...state.profile.user.stats,
                totalCollections: state.profile.user.stats.totalCollections + 1,
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  incrementShares: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: {
                ...state.profile.user.stats,
                totalShares: state.profile.user.stats.totalShares + 1,
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  setFavoriteQuote: (quoteId) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              stats: {
                ...state.profile.user.stats,
                favoriteQuote: quoteId,
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  addFavoriteCategory: (category) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              preferences: {
                ...state.profile.user.preferences,
                favoriteCategories: [
                  ...new Set([
                    ...state.profile.user.preferences.favoriteCategories,
                    category,
                  ]),
                ],
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),

  removeFavoriteCategory: (category) =>
    set((state) => ({
      profile: {
        ...state.profile,
        user: state.profile.user
          ? {
              ...state.profile.user,
              preferences: {
                ...state.profile.user.preferences,
                favoriteCategories:
                  state.profile.user.preferences.favoriteCategories.filter(
                    (c) => c !== category,
                  ),
              },
              lastActive: Date.now(),
            }
          : null,
        lastUpdated: Date.now(),
      },
    })),
});
