/**
 * Unified App State Hook
 * 
 * Manages the main application state for the unified app
 */

import { useState, useEffect, useMemo } from 'react';
import { CollectionService, logError, logDebug, logWarning } from '@boostlly/core';
import { StorageLike, SavedQuote, AppState } from '../types';

export function useUnifiedAppState(storage: StorageLike | null) {
  const [activeTab, setActiveTab] = useState<string>("today");
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<SavedQuote[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedQuoteForCollection, setSelectedQuoteForCollection] = useState<SavedQuote | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Motivation");
  const [savedFilter, setSavedFilter] = useState<"all" | "saved" | "liked">("all");
  const [savedSearch, setSavedSearch] = useState("");
  const [savedSort, setSavedSort] = useState<"recent" | "az" | "za">("recent");
  // simpleMode is now permanently true - advanced features removed
  const [simpleMode] = useState<boolean>(true);

  const collectionService = useMemo(() => {
    if (!storage) return null;
    return new CollectionService(storage as any);
  }, [storage]);

  // Initialize data from storage
  useEffect(() => {
    if (!storage || !collectionService) return;
    (async () => {
      try {
        const existing = await (storage as any).get("savedQuotes");
        if (Array.isArray(existing)) {
          logDebug("UnifiedApp:init savedQuotes", { existing: existing });
          setSavedQuotes(existing);
        }
        const existingLiked = await (storage as any).get("likedQuotes");
        if (Array.isArray(existingLiked)) {
          logDebug("UnifiedApp:init likedQuotes", {
            existingLiked: existingLiked,
          });
          setLikedQuotes(existingLiked);
        }
        const allCollections = await (
          collectionService as any
        ).getAllCollections();
        setCollections(allCollections);

        // Simple mode is now permanently enabled - advanced features removed
        // Always save simpleMode as true to ensure consistency
        await (storage as any).set("simpleMode", true);
      } catch (error) {
        logError("Failed to load data:", { error: error });
      }
    })();
  }, [storage, collectionService]);

  // Defensive refresh: whenever navigating to Saved tab, reload from storage
  useEffect(() => {
    if (!storage) return;
    if (activeTab !== "saved") return;
    (async () => {
      try {
        const [saved, liked] = await Promise.all([
          (storage as any).get("savedQuotes"),
          (storage as any).get("likedQuotes"),
        ]);
        if (Array.isArray(saved)) setSavedQuotes(saved);
        if (Array.isArray(liked)) setLikedQuotes(liked);
      } catch (err) {
        logWarning("Failed to refresh lists on Saved tab open", { error: err });
      }
    })();
  }, [activeTab, storage]);

  // Keep saved/liked lists in sync when other components update storage
  useEffect(() => {
    if (!storage) return;

    const refreshSaved = async () => {
      try {
        const list = await (storage as any).get("savedQuotes");
        logDebug("UnifiedApp:refreshSaved ->", { list: list });
        if (Array.isArray(list)) {
          setSavedQuotes((prev) => {
            const map = new Map<string, any>();
            [...prev, ...list].forEach((q: any) => map.set(q.id, q));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        logWarning("Failed to refresh saved quotes", { error: err });
      }
    };

    const refreshLiked = async () => {
      try {
        const list = await (storage as any).get("likedQuotes");
        logDebug("UnifiedApp:refreshLiked ->", { list: list });
        if (Array.isArray(list)) {
          setLikedQuotes((prev) => {
            const map = new Map<string, any>();
            [...prev, ...list].forEach((q: any) => map.set(q.id, q));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        logWarning("Failed to refresh liked quotes", { error: err });
      }
    };

    // Listen to custom events dispatched by other views (e.g., Today tab)
    const onSavedChanged = (e?: any) => {
      const detail = e?.detail || {};
      logDebug("UnifiedApp:event boostlly:savedQuotesChanged", {
        detail: detail,
      });
      // Apply change immediately based on payload if present
      const quote = detail?.quote as any;
      if (quote && typeof quote?.id === "string") {
        setSavedQuotes((prev) => {
          if (detail?.action === "remove") {
            return prev.filter((q) => q.id !== quote.id);
          }
          const exists = prev.some((q) => q.id === quote.id);
          return exists ? prev : [quote, ...prev];
        });
      }
      void refreshSaved();
    };
    const onLikedChanged = (e?: any) => {
      const detail = e?.detail || {};
      logDebug("UnifiedApp:event boostlly:likedQuotesChanged", {
        detail: detail,
      });
      const quote = detail?.quote as any;
      if (quote && typeof quote?.id === "string") {
        setLikedQuotes((prev) => {
          if (detail?.action === "remove") {
            return prev.filter((q) => q.id !== quote.id);
          }
          const exists = prev.some((q) => q.id === quote.id);
          return exists ? prev : [quote, ...prev];
        });
      }
      void refreshLiked();
    };
    window.addEventListener(
      "boostlly:savedQuotesChanged",
      onSavedChanged as any,
    );
    window.addEventListener(
      "boostlly:likedQuotesChanged",
      onLikedChanged as any,
    );

    // In extension popups, also listen to runtime messages (cross-view)
    const chromeOnMessage = (msg: any) => {
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "boostlly:savedQuotesChanged") onSavedChanged();
      if (msg.type === "boostlly:likedQuotesChanged") onLikedChanged();
    };
    try {
      (window as any).chrome?.runtime?.onMessage?.addListener?.(
        chromeOnMessage,
      );
    } catch {}

    // Also listen to platform storage change events if available
    const unsubscribeStorage = (storage as any).onChanged?.addListener
      ? (storage as any).onChanged.addListener((changes: any) => {
          if (changes.savedQuotes) refreshSaved();
          if (changes.likedQuotes) refreshLiked();
        })
      : null;

    return () => {
      window.removeEventListener(
        "boostlly:savedQuotesChanged",
        onSavedChanged as any,
      );
      window.removeEventListener(
        "boostlly:likedQuotesChanged",
        onLikedChanged as any,
      );
      try {
        (window as any).chrome?.runtime?.onMessage?.removeListener?.(
          chromeOnMessage,
        );
      } catch {}
      // Some storage implementations don't return a remover; best-effort cleanup
      if ((storage as any).onChanged?.removeListener && unsubscribeStorage) {
        try {
          (storage as any).onChanged.removeListener(unsubscribeStorage);
        } catch {}
      }
    };
  }, [storage]);

  // Simple mode is now permanently enabled - no need to listen for changes
  // Ensure simpleMode is always true in storage
  useEffect(() => {
    if (!storage) return;
    (async () => {
      try {
        await (storage as any).set("simpleMode", true);
      } catch (error) {
        logError("Failed to set simple mode:", { error: error });
      }
    })();
  }, [storage]);

  async function saveSavedQuotes(next: SavedQuote[]) {
    setSavedQuotes(next);
    if (storage) {
      await (storage as any).set("savedQuotes", next);
      try {
        window.dispatchEvent(new CustomEvent("boostlly:savedQuotesChanged"));
      } catch {}
    }
  }

  async function saveLikedQuotes(next: SavedQuote[]) {
    setLikedQuotes(next);
    if (storage) {
      await (storage as any).set("likedQuotes", next);
      try {
        window.dispatchEvent(new CustomEvent("boostlly:likedQuotesChanged"));
      } catch {}
    }
  }

  async function forceRefreshLists() {
    if (!storage) return;
    try {
      const [saved, liked] = await Promise.all([
        (storage as any).get("savedQuotes"),
        (storage as any).get("likedQuotes"),
      ]);
      logDebug("UnifiedApp:forceRefreshLists", { saved, liked });
      if (Array.isArray(saved)) {
        setSavedQuotes((prev) => {
          const map = new Map<string, any>();
          [...prev, ...saved].forEach((q: any) => map.set(q.id, q));
          return Array.from(map.values());
        });
      }
      if (Array.isArray(liked)) {
        setLikedQuotes((prev) => {
          const map = new Map<string, any>();
          [...prev, ...liked].forEach((q: any) => map.set(q.id, q));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      logWarning("forceRefreshLists failed", { error: err });
    }
  }

  return {
    activeTab,
    setActiveTab,
    savedQuotes,
    setSavedQuotes,
    likedQuotes,
    setLikedQuotes,
    collections,
    setCollections,
    showAddToCollection,
    setShowAddToCollection,
    selectedQuoteForCollection,
    setSelectedQuoteForCollection,
    showCreate,
    setShowCreate,
    newText,
    setNewText,
    newAuthor,
    setNewAuthor,
    newCategory,
    setNewCategory,
    savedFilter,
    setSavedFilter,
    savedSearch,
    setSavedSearch,
    savedSort,
    setSavedSort,
    simpleMode,
    collectionService,
    saveSavedQuotes,
    saveLikedQuotes,
    forceRefreshLists,
  };
}
