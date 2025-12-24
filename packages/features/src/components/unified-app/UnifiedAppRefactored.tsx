/**
 * Unified App Component - Refactored
 * 
 * Main orchestrator component that uses all extracted pieces.
 * This replaces the original 2395-line unified-app.tsx file.
 * 
 * The original file has been split into:
 * - Hooks: useUnifiedAppState, useVoiceState, useTimeDate, useStorageSync
 * - Components: AppHeader, Navigation, TabContent, SavedTab, CreateQuoteModal, AddToCollectionModal, TimeDateDisplay
 * - Utils: platform-utils, quote-actions, storage-utils
 * - Types: All types and interfaces in types.ts
 * 
 * All functionality from the original file is preserved.
 */

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "@boostlly/ui";
import {
  useAutoTheme,
  logDebug,
} from "@boostlly/core";
import {
  Home,
  Search,
  FolderOpen,
  Heart,
  BarChart3,
  Volume2,
  Settings as SettingsIcon,
  Plus,
} from "lucide-react";
import { GlobalVoiceListener } from "../global-voice-listener";
import { Navigation } from "./components/Navigation";
import { AppHeader } from "./components/AppHeader";
import { TabContent } from "./TabContent";
import { CreateQuoteModal } from "./components/CreateQuoteModal";
import { AddToCollectionModal } from "./components/AddToCollectionModal";
import { MobileTimeDateDisplay } from "./components/TimeDateDisplay";
import { useUnifiedAppState } from "./hooks/useUnifiedAppState";
import { useVoiceState } from "./hooks/useVoiceState";
import { useTimeDate } from "./hooks/useTimeDate";
import { useStorageSync } from "./hooks/useStorageSync";
import { createPlatformStorage, openInOptionsPage } from "./utils/platform-utils";
import { generateId } from "./utils/quote-actions";
import { Variant, SavedQuote, StorageLike, NavigationTab } from "./types";
import { QuickOnboarding } from "../onboarding";
import { useOnboarding } from "../../hooks/useOnboarding";
import { QuoteService, DailyNotificationScheduler } from "@boostlly/core";

interface UnifiedAppProps {
  variant?: Variant;
}

export function UnifiedApp({ variant = "web" }: UnifiedAppProps) {
  logDebug("🚀 UnifiedApp component mounting with variant:", {
    variant: variant,
  });

  const [storage, setStorage] = useState<StorageLike | null>(null);
  const [showBackground, setShowBackground] = useState<boolean>(true);
  const [notificationScheduler, setNotificationScheduler] = useState<DailyNotificationScheduler | null>(null);

  // Onboarding state
  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading, markAsCompleted } = useOnboarding(storage);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-theme functionality for Picsum backgrounds
  const { loadTodayImage, imageUrl, isLoading, error, palette } =
    useAutoTheme();

  logDebug("🎨 useAutoTheme hook result:", { imageUrl, isLoading, error });

  // Initialize storage
  useEffect(() => {
    let mounted = true;
    createPlatformStorage()
      .then((s) => {
        if (mounted) {
          setStorage(s);
        }
      })
      .catch((error) => {
        logDebug("UnifiedApp: Failed to initialize storage:", { error: error });
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize notification scheduler when storage is available
  useEffect(() => {
    if (storage && !notificationScheduler) {
      // QuoteService requires StorageService, but we have StorageLike
      // The storage adapter should work, but we need to ensure compatibility
      try {
        const quoteService = new QuoteService(storage as any);
        const scheduler = new DailyNotificationScheduler({
          storage: storage,
          quoteService,
          onNotificationClick: () => {
            if (typeof window !== 'undefined') {
              window.focus();
            }
          },
        });
        
        scheduler.initialize().catch((error) => {
          logDebug("Failed to initialize notification scheduler:", { error });
        });
        setNotificationScheduler(scheduler);
      } catch (error) {
        logDebug("Failed to create notification scheduler:", { error });
      }
    }
  }, [storage, notificationScheduler]);

  // Show onboarding for first-time users
  useEffect(() => {
    if (!onboardingLoading && storage && !onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [onboardingLoading, storage, onboardingCompleted]);

  // Load today's Picsum background image
  useEffect(() => {
    logDebug("🌅 Loading today's Picsum image for variant:", {
      variant: variant,
    });
    try {
      loadTodayImage();
      logDebug("🌅 loadTodayImage called successfully");
    } catch (error) {
      logDebug("🌅 Error calling loadTodayImage:", { error: error });
    }
  }, [loadTodayImage, variant]);

  // Load background preference
  useEffect(() => {
    (async () => {
      try {
        const pref = await (storage as any)?.get?.("showBackground");
        setShowBackground(pref === undefined || pref === null ? true : !!pref);
        // Seed proxy preference to window for core network utils
        const proxyPref = await (storage as any)?.get?.("apiProxy");
        try {
          (window as any).__BOOSTLLY_PROXY__ = proxyPref ?? true;
        } catch {}
      } catch {}
    })();
  }, [storage]);

  useEffect(() => {
    const onPrefs = (e: any) => {
      const v = e?.detail?.showBackground;
      if (typeof v === "boolean") setShowBackground(v);
    };
    window.addEventListener("boostlly:preferences:update", onPrefs as any);
    return () =>
      window.removeEventListener("boostlly:preferences:update", onPrefs as any);
  }, []);

  // Custom hooks for state management
  const appState = useUnifiedAppState(storage);
  const voiceState = useVoiceState();
  const timeDate = useTimeDate(storage);
  useStorageSync(storage);

  // Listen for voice navigation events
  useEffect(() => {
    const onVoiceNavigate = (e: any) => {
      const tab = e?.detail?.tab;
      if (typeof tab === "string") {
        appState.setActiveTab(tab);
      }
    };
    window.addEventListener("boostlly:voice:navigate", onVoiceNavigate as any);
    return () =>
      window.removeEventListener("boostlly:voice:navigate", onVoiceNavigate as any);
  }, [appState]);

  // Handle quote injection events
  useEffect(() => {
    const onInjectSaved = (e: any) => {
      const quote = e?.detail?.quote;
      if (quote) {
        appState.setSavedQuotes((prev) => {
          const exists = prev.some((q) => q.id === quote.id);
          return exists ? prev : [quote, ...prev];
        });
      }
    };
    const onInjectLiked = (e: any) => {
      const quote = e?.detail?.quote;
      if (quote) {
        appState.setLikedQuotes((prev) => {
          const exists = prev.some((q) => q.id === quote.id);
          return exists ? prev : [quote, ...prev];
        });
      }
    };
    window.addEventListener("boostlly:injectSavedQuote", onInjectSaved as any);
    window.addEventListener("boostlly:injectLikedQuote", onInjectLiked as any);
    return () => {
      window.removeEventListener("boostlly:injectSavedQuote", onInjectSaved as any);
      window.removeEventListener("boostlly:injectLikedQuote", onInjectLiked as any);
    };
  }, [appState]);

  // Handle saved filter/search/sort changes
  useEffect(() => {
    const onFilterChange = (e: any) => {
      appState.setSavedFilter(e?.detail?.filter || "all");
    };
    const onSearchChange = (e: any) => {
      appState.setSavedSearch(e?.detail?.search || "");
    };
    const onSortChange = (e: any) => {
      appState.setSavedSort(e?.detail?.sort || "recent");
    };
    window.addEventListener("boostlly:savedFilter:change", onFilterChange as any);
    window.addEventListener("boostlly:savedSearch:change", onSearchChange as any);
    window.addEventListener("boostlly:savedSort:change", onSortChange as any);
    return () => {
      window.removeEventListener("boostlly:savedFilter:change", onFilterChange as any);
      window.removeEventListener("boostlly:savedSearch:change", onSearchChange as any);
      window.removeEventListener("boostlly:savedSort:change", onSortChange as any);
    };
  }, [appState]);

  const todayTabRef = useRef<{
    refresh: () => void;
    getQuote: () => any;
    speak: () => void;
    getStatus?: () => any;
  }>(null);

  // Compute filtered quotes
  const allSavedQuotes = useMemo(() => {
    const map = new Map<string, SavedQuote>();
    for (const q of appState.savedQuotes) map.set(q.id, q);
    for (const q of appState.likedQuotes) map.set(q.id, q);
    return Array.from(map.values());
  }, [appState.savedQuotes, appState.likedQuotes]);

  const filteredSavedQuotes = useMemo(() => {
    let list = allSavedQuotes;
    if (appState.savedFilter === "saved")
      list = list.filter((q) => appState.savedQuotes.some((s) => s.id === q.id));
    if (appState.savedFilter === "liked")
      list = list.filter((q) => appState.likedQuotes.some((l) => l.id === q.id));
    const q = appState.savedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q),
      );
    }
    const byRecent = (a: SavedQuote, b: SavedQuote) =>
      (b as any)._ts - (a as any)._ts;
    const byAZ = (a: SavedQuote, b: SavedQuote) =>
      a.author.localeCompare(b.author);
    const byZA = (a: SavedQuote, b: SavedQuote) =>
      b.author.localeCompare(a.author);
    const sorter =
      appState.savedSort === "az" ? byAZ : appState.savedSort === "za" ? byZA : byRecent;
    return [...list].sort(sorter);
  }, [
    allSavedQuotes,
    appState.savedQuotes,
    appState.likedQuotes,
    appState.savedFilter,
    appState.savedSearch,
    appState.savedSort,
  ]);

  // Navigation tabs - only core features, no advanced features
  const navigationTabs: NavigationTab[] = [
    { id: "today", label: "Today", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "collections", label: "Collections", icon: FolderOpen },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "create", label: "Your Quotes", icon: Plus },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "voice", label: "Voice", icon: Volume2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // Handle create quote
  async function handleCreateQuote() {
    if (!appState.newText.trim() || !appState.newAuthor.trim()) return;
    const created: SavedQuote = {
      id: generateId(),
      text: appState.newText.trim(),
      author: appState.newAuthor.trim(),
      category: appState.newCategory.trim() || "Custom",
    };
    const next = [created, ...appState.savedQuotes];
    await appState.saveSavedQuotes(next);
    appState.setShowCreate(false);
    appState.setNewText("");
    appState.setNewAuthor("");
  }

  // Handle remove quote
  async function handleRemoveQuote(id: string) {
    const next = appState.savedQuotes.filter((q) => q.id !== id);
    await appState.saveSavedQuotes(next);
  }

  // Handle add to collection
  async function handleAddToCollection(collectionId: string, quoteId: string) {
    if (!appState.collectionService) return;
    await (appState.collectionService as any).addQuoteToCollection(
      collectionId,
      quoteId,
    );
    appState.setShowAddToCollection(false);
    appState.setSelectedQuoteForCollection(null);
  }

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: any) => {
    await markAsCompleted(data);
    
    // Initialize notification scheduler if reminders are enabled
    if (data.reminderEnabled && notificationScheduler) {
      try {
        await notificationScheduler.updateSchedule();
      } catch (error) {
        logDebug('Failed to initialize notification scheduler after onboarding:', { error });
      }
    }
    
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await markAsCompleted({
      categories: [],
      reminderEnabled: false,
      reminderTime: '09:00',
      reminderTone: 'gentle',
    });
    setShowOnboarding(false);
  };

  const containerClass =
    variant === "popup"
      ? "w-[600px] h-[600px] text-foreground p-4 overflow-y-auto relative"
      : "min-h-screen text-foreground p-4 lg:p-8 overflow-y-auto relative";

  const backgroundStyle =
    imageUrl && showBackground
      ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : {};

  // Show onboarding overlay if needed
  if (showOnboarding && storage) {
    return (
      <ErrorBoundary>
        <QuickOnboarding
          storage={storage}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div
      className={variant === "web" ? "min-h-screen" : ""}
      style={backgroundStyle}
    >
      <GlobalVoiceListener />
      {/* Responsive overlay for better text contrast - darker on mobile */}
      {imageUrl && showBackground && (
        <>
          {/* Main overlay - responsive opacity based on screen size */}
        <div
          className={
            variant === "popup"
                ? "absolute inset-0 bg-black/20 md:bg-background/10 z-0"
                : "fixed inset-0 bg-black/30 md:bg-black/20 lg:bg-background/10 z-0"
          }
        />
          {/* Additional gradient overlays for better text readability on mobile */}
          {variant !== "popup" && (
            <>
              {/* Top gradient overlay - stronger on mobile */}
              <div className="fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 via-black/30 to-transparent md:from-black/30 md:via-black/20 md:to-transparent lg:hidden z-0 pointer-events-none" />
              {/* Bottom gradient overlay - stronger on mobile */}
              <div className="fixed inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 via-black/30 to-transparent md:from-black/30 md:via-black/20 md:to-transparent lg:hidden z-0 pointer-events-none" />
            </>
          )}
        </>
      )}
      <div className={containerClass}>
        <div className="relative z-10">
          <AppHeader
            variant={variant}
            timeDate={timeDate}
            voiceEnabled={voiceState.voiceEnabled}
            voiceStatus={voiceState.voiceStatus}
            palette={palette || undefined}
            onVoiceToggle={voiceState.toggleVoice}
          />

          {/* Mobile Time/Date Bar - Shows below header on mobile and tablet */}
          <MobileTimeDateDisplay timeDate={timeDate} variant={variant} palette={palette || undefined} />

          <Navigation
            variant={variant}
            tabs={navigationTabs}
            activeTab={appState.activeTab}
            simpleMode={true}
            onTabChange={appState.setActiveTab}
            todayTabRef={todayTabRef}
            forceRefreshLists={appState.forceRefreshLists}
            setSavedFilter={appState.setSavedFilter}
          />

          <div
            className={
              variant === "popup" 
                ? "space-y-4" 
                : "container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 max-w-7xl"
            }
          >
            <ErrorBoundary>
              <TabContent
                activeTab={appState.activeTab}
                variant={variant}
                storage={storage}
                savedQuotes={appState.savedQuotes}
                likedQuotes={appState.likedQuotes}
                collections={appState.collections}
                savedFilter={appState.savedFilter}
                savedSearch={appState.savedSearch}
                savedSort={appState.savedSort}
                filteredSavedQuotes={filteredSavedQuotes}
                simpleMode={true}
                palette={palette || undefined}
                todayTabRef={todayTabRef}
                onRemoveQuote={handleRemoveQuote}
                onAddToCollection={(quote) => {
                  appState.setSelectedQuoteForCollection(quote);
                  appState.setShowAddToCollection(true);
                }}
                onSetSavedFilter={appState.setSavedFilter}
                onSetSavedSearch={appState.setSavedSearch}
                onSetSavedSort={appState.setSavedSort}
                onSetShowCreate={appState.setShowCreate}
                onSetShowAddToCollection={appState.setShowAddToCollection}
                onSetSelectedQuoteForCollection={appState.setSelectedQuoteForCollection}
                onSetActiveTab={appState.setActiveTab}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Modals */}
        <CreateQuoteModal
          variant={variant}
          show={appState.showCreate}
          newText={appState.newText}
          newAuthor={appState.newAuthor}
          newCategory={appState.newCategory}
          onTextChange={appState.setNewText}
          onAuthorChange={appState.setNewAuthor}
          onCategoryChange={appState.setNewCategory}
          onClose={() => appState.setShowCreate(false)}
          onCreate={handleCreateQuote}
        />

        {variant === "popup" &&
          appState.showAddToCollection &&
          appState.selectedQuoteForCollection && (
            <AddToCollectionModal
              variant={variant}
              show={appState.showAddToCollection}
              collections={appState.collections}
              selectedQuote={appState.selectedQuoteForCollection}
              collectionService={appState.collectionService}
              onClose={() => {
                appState.setShowAddToCollection(false);
                appState.setSelectedQuoteForCollection(null);
              }}
              onAdd={handleAddToCollection}
            />
          )}
      </div>
    </div>
  );
}

export default UnifiedApp;
