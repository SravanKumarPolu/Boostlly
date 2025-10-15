/**
 * Quotes slice for Zustand store
 * Manages today's quote, saved quotes, collections, and feedback
 */

import { StateCreator } from "zustand";
import type { Quote } from "../types";

export interface SavedQuote {
  id: string;
  text: string;
  author: string;
  category?: string;
  source?: string;
  createdAt?: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  quoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  // Enhanced visual organization
  color?: string; // Hex color code for collection
  icon?: string; // Icon name for collection
  category?: string; // Category type (Work, Personal, Inspiration, etc.)
  priority?: "high" | "medium" | "low"; // Priority level
  tags?: string[]; // Additional tags for filtering
  // Smart features and metadata
  metadata?: {
    reminder?: {
      type: "daily" | "weekly" | "monthly";
      time: string; // HH:MM format
      enabled: boolean;
      message?: string;
    };
    analytics?: {
      lastViewed?: Date;
      viewCount?: number;
      favoriteCount?: number;
    };
    archived?: boolean;
    archivedAt?: Date;
    [key: string]: any; // Allow for future metadata
  };
}

export interface QuoteFeedback {
  quoteId: string;
  liked: boolean;
  shared: boolean;
  timestamp: number;
}

export interface QuotesSlice {
  // State
  quotes: {
    today: Quote | null;
    saved: SavedQuote[];
    collections: Collection[];
    feedback: QuoteFeedback[];
    isLoading: boolean;
    lastUpdated: number | null;
  };

  // Actions
  setTodayQuote: (quote: Quote) => void;
  setSavedQuotes: (quotes: SavedQuote[]) => void;
  addSavedQuote: (quote: SavedQuote) => void;
  removeSavedQuote: (id: string) => void;
  updateSavedQuote: (id: string, updates: Partial<SavedQuote>) => void;

  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  addQuoteToCollection: (collectionId: string, quoteId: string) => void;
  removeQuoteFromCollection: (collectionId: string, quoteId: string) => void;

  setFeedback: (feedback: QuoteFeedback[]) => void;
  addFeedback: (feedback: QuoteFeedback) => void;
  updateFeedback: (quoteId: string, updates: Partial<QuoteFeedback>) => void;

  setLoading: (loading: boolean) => void;
  setLastUpdated: (timestamp: number) => void;

  // Computed actions
  refreshTodayQuote: () => void;
  clearAllData: () => void;
}

export const createQuotesSlice: StateCreator<QuotesSlice> = (set) => ({
  quotes: {
    today: null,
    saved: [],
    collections: [],
    feedback: [],
    isLoading: false,
    lastUpdated: null,
  },

  setTodayQuote: (quote) =>
    set((state) => ({
      quotes: { ...state.quotes, today: quote },
    })),

  setSavedQuotes: (quotes) =>
    set((state) => ({
      quotes: { ...state.quotes, saved: quotes },
    })),

  addSavedQuote: (quote) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        saved: [quote, ...(state.quotes.saved || [])],
      },
    })),

  removeSavedQuote: (id) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        saved: (state.quotes.saved || []).filter((q) => q.id !== id),
      },
    })),

  updateSavedQuote: (id, updates) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        saved: (state.quotes.saved || []).map((q) =>
          q.id === id ? { ...q, ...updates } : q,
        ),
      },
    })),

  setCollections: (collections) =>
    set((state) => ({
      quotes: { ...state.quotes, collections },
    })),

  addCollection: (collection) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        collections: [...(state.quotes.collections || []), collection],
      },
    })),

  updateCollection: (id, updates) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        collections: (state.quotes.collections || []).map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
        ),
      },
    })),

  removeCollection: (id) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        collections: (state.quotes.collections || []).filter(
          (c) => c.id !== id,
        ),
      },
    })),

  addQuoteToCollection: (collectionId, quoteId) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        collections: (state.quotes.collections || []).map((c) =>
          c.id === collectionId
            ? {
                ...c,
                quoteIds: [...new Set([...(c.quoteIds || []), quoteId])],
                updatedAt: new Date(),
              }
            : c,
        ),
      },
    })),

  removeQuoteFromCollection: (collectionId, quoteId) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        collections: (state.quotes.collections || []).map((c) =>
          c.id === collectionId
            ? {
                ...c,
                quoteIds: (c.quoteIds || []).filter((id) => id !== quoteId),
                updatedAt: new Date(),
              }
            : c,
        ),
      },
    })),

  setFeedback: (feedback) =>
    set((state) => ({
      quotes: { ...state.quotes, feedback },
    })),

  addFeedback: (feedback) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        feedback: [...(state.quotes.feedback || []), feedback],
      },
    })),

  updateFeedback: (quoteId, updates) =>
    set((state) => ({
      quotes: {
        ...state.quotes,
        feedback: (state.quotes.feedback || []).map((f) =>
          f.quoteId === quoteId ? { ...f, ...updates } : f,
        ),
      },
    })),

  setLoading: (loading) =>
    set((state) => ({
      quotes: { ...state.quotes, isLoading: loading },
    })),

  setLastUpdated: (timestamp) =>
    set((state) => ({
      quotes: { ...state.quotes, lastUpdated: timestamp },
    })),

  refreshTodayQuote: () => {
    // This will be implemented by the component using the store
    // It can trigger API calls and update the store
    set((state) => ({
      quotes: { ...state.quotes, isLoading: true },
    }));
  },

  clearAllData: () =>
    set(() => ({
      quotes: {
        today: null,
        saved: [],
        collections: [],
        feedback: [],
        isLoading: false,
        lastUpdated: null,
      },
    })),
});
