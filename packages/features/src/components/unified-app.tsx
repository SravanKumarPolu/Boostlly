import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  ErrorBoundary,
  Input,
  TabSkeleton,
  CollectionsSkeleton,
  SearchSkeleton,
} from "@boostlly/ui";
import {
  CollectionService,
  downloadImage,
  generateQuoteImage,
  useAutoTheme,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";

// Reuse feature components from this package
import { TodayTab } from "./today-tab";
import { CollectionsTab } from "./collections-tab";
import { AdvancedSearch } from "./advanced-search";
import { APIExplorer } from "./api-explorer";
import { EnhancedSettings } from "./enhanced-settings";
import { VoiceCommands } from "./voice-commands";
import { GlobalVoiceListener } from "./global-voice-listener";
import { SimpleAnalytics } from "./simple-analytics";
// Removed DynamicThemeProvider
// Removed DynamicBackground

import {
  Home,
  Search,
  // Users,
  FolderOpen,
  Globe,
  Heart,
  BarChart3,
  TrendingUp,
  Volume2,
  Share2,
  Image,
  Settings as SettingsIcon,
  X,
  Timer,
  Plus,
  Mic,
  MicOff,
  Clock,
  Calendar,
  BookOpen,
  Mail,
} from "lucide-react";

type Variant = "web" | "popup";

type StorageLike = {
  get: <T = any>(key: string) => Promise<T | null>;
  set: <T = any>(key: string, value: T) => Promise<void>;
};

function isExtensionEnv(): boolean {
  return (
    typeof window !== "undefined" && !!(window as any).chrome?.storage?.local
  );
}

async function createPlatformStorage(): Promise<StorageLike> {
  try {
    if (isExtensionEnv()) {
      const mod = await import("@boostlly/platform-extension");
      const Service = mod.ExtensionStorageService;
      const storage = new Service();
      return storage;
    } else {
      const mod = await import("@boostlly/platform-web");
      const Service = mod.StorageService;
      const storage = new Service();
      return storage;
    }
  } catch (error) {
    logError("Failed to load platform storage:", { error: error });
    // Fallback to a simple in-memory storage
    return {
      get: async () => null,
      set: async () => {},
    };
  }
}

function openInOptionsPage(): void {
  try {
    const chromeObj = (window as any).chrome;
    if (chromeObj?.runtime?.openOptionsPage) {
      chromeObj.runtime.openOptionsPage();
      return;
    }
  } catch {}
  try {
    // Fallback: attempt to open options route within the extension bundle
    window.open("/options/index.html", "_blank", "noopener,noreferrer");
  } catch {}
}

interface SavedQuote {
  id: string;
  text: string;
  author: string;
  category?: string;
  source?: string;
}

interface UnifiedAppProps {
  variant?: Variant;
}

export function UnifiedApp({ variant = "web" }: UnifiedAppProps) {
  logDebug("🚀 UnifiedApp component mounting with variant:", {
    variant: variant,
  });

  const [storage, setStorage] = useState<StorageLike | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [, setLiveTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<
    "off" | "ready" | "listening" | "error"
  >("off");

  // Time and date state for navbar display
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeDate, setShowTimeDate] = useState(true); // Default to true to show time and date
  const [timeFormat, setTimeFormat] = useState<"12" | "24">("12");
  const [dateFormat, setDateFormat] = useState<"full" | "compact">("full");
  const [isClient, setIsClient] = useState(false);

  // Auto-theme functionality for Picsum backgrounds
  const { loadTodayImage, imageUrl, isLoading, error, palette } =
    useAutoTheme();

  logDebug("🎨 useAutoTheme hook result:", { imageUrl, isLoading, error });

  useEffect(() => {
    let mounted = true;
    createPlatformStorage()
      .then((s) => {
        if (mounted) {
          setStorage(s);
        }
      })
      .catch((error) => {
        logError("UnifiedApp: Failed to initialize storage:", { error: error });
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load today's Picsum background image (both web and popup)
  useEffect(() => {
    logDebug("🌅 Loading today's Picsum image for variant:", {
      variant: variant,
    });
    logDebug("🌅 loadTodayImage function:", { value: typeof loadTodayImage });
    try {
      loadTodayImage();
      logDebug("🌅 loadTodayImage called successfully");
    } catch (error) {
      logError("🌅 Error calling loadTodayImage:", { error: error });
    }
  }, [loadTodayImage, variant]);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Real-time clock updates (only on client)
  useEffect(() => {
    if (!isClient) return;

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Load preferences for time and date display
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("showTimeDate");
        if (!cancelled) {
          // Default to true if not set, respect user preference if set
          setShowTimeDate(pref === undefined || pref === null ? true : !!pref);
        }
      } catch {
        if (!cancelled) setShowTimeDate(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Load time format preference
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("timeFormat");
        if (!cancelled) {
          setTimeFormat(pref === "24" ? "24" : "12");
        }
      } catch {
        if (!cancelled) setTimeFormat("12");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Load date format preference
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pref = await storage?.get?.("dateFormat");
        if (!cancelled) {
          setDateFormat(pref === "compact" ? "compact" : "full");
        }
      } catch {
        if (!cancelled) setDateFormat("full");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // Persist voice settings updates coming from VoiceCommands/GlobalListener
  useEffect(() => {
    const onSettingsUpdate = async (e: any) => {
      try {
        const detail = e?.detail || {};
        if (!storage) return;

        // Handle speech rate updates
        if (typeof detail.speechRate === "number") {
          await (storage as any).set("speechRate", detail.speechRate);
        } else if (
          detail.speechRate === "INCREMENT" ||
          detail.speechRate === "DECREMENT"
        ) {
          const current = (await (storage as any).get("speechRate")) ?? 0.8;
          const delta = detail.speechRate === "INCREMENT" ? 0.1 : -0.1;
          const next = Math.max(
            0.5,
            Math.min(2, Number((current + delta).toFixed(1))),
          );
          await (storage as any).set("speechRate", next);
        }

        // Handle speech volume updates (stored as 0-100 integer)
        if (typeof detail.speechVolume === "number") {
          await (storage as any).set(
            "speechVolume",
            Math.max(0, Math.min(100, detail.speechVolume)),
          );
        } else if (
          detail.speechVolume === "INCREMENT" ||
          detail.speechVolume === "DECREMENT"
        ) {
          const currentRaw = await (storage as any).get("speechVolume");
          const current = typeof currentRaw === "number" ? currentRaw : 80;
          const delta = detail.speechVolume === "INCREMENT" ? 10 : -10;
          const next = Math.max(0, Math.min(100, current + delta));
          await (storage as any).set("speechVolume", next);
        }

        if (typeof detail.textToSpeech === "boolean") {
          await (storage as any).set("textToSpeech", detail.textToSpeech);
        }
      } catch (err) {
        logWarning("Failed to persist settings", { error: err });
      }
    };
    window.addEventListener(
      "boostlly:settings:update",
      onSettingsUpdate as any,
    );
    // Respond to settings seed requests from child components (e.g., Voice tab)
    const onRequest = async () => {
      try {
        if (!storage) return;
        const seedRate = (await (storage as any).get("speechRate")) ?? 0.8;
        const seedVol = (await (storage as any).get("speechVolume")) ?? 80;
        const seedTts = await (storage as any).get("textToSpeech");
        window.dispatchEvent(
          new CustomEvent("boostlly:settings:update", {
            detail: {
              speechRate: typeof seedRate === "number" ? seedRate : 0.8,
              speechVolume: typeof seedVol === "number" ? seedVol : 80,
              ...(typeof seedTts === "boolean"
                ? { textToSpeech: seedTts }
                : {}),
            },
          }),
        );
      } catch {}
    };
    window.addEventListener("boostlly:settings:request", onRequest as any);
    return () => {
      window.removeEventListener(
        "boostlly:settings:update",
        onSettingsUpdate as any,
      );
      window.removeEventListener("boostlly:settings:request", onRequest as any);
    };
  }, [storage]);

  // moved defensive refresh below activeTab initialization

  // Initialize global voice listener enable state
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("boostlly:voice:enable", {
          detail: { enabled: voiceEnabled },
        }),
      );
    } catch {}
    setVoiceStatus(voiceEnabled ? "ready" : "off");
  }, [voiceEnabled]);

  // Listen for navigation voice events
  useEffect(() => {
    const onVoice = (evt: any) => {
      const { action, tab } = evt?.detail || {};
      if (action === "navigate" && typeof tab === "string") {
        setActiveTab(tab);
      }
    };
    window.addEventListener("boostlly:voice", onVoice as any);
    return () => window.removeEventListener("boostlly:voice", onVoice as any);
  }, []);

  // Listen for live transcript updates
  useEffect(() => {
    const onTranscript = (e: any) => {
      const text = e?.detail?.text || "";
      setLiveTranscript(text);
      // Clear transcript shortly after final result
      if (e?.detail?.isFinal) {
        setTimeout(() => setLiveTranscript(""), 1200);
      }
    };
    window.addEventListener("boostlly:voice:transcript", onTranscript as any);
    return () =>
      window.removeEventListener(
        "boostlly:voice:transcript",
        onTranscript as any,
      );
  }, []);

  // Listen for status updates
  useEffect(() => {
    const onStatus = (e: any) => {
      const state = e?.detail?.state;
      if (state === "listening" || state === "ready" || state === "error") {
        setVoiceStatus(state);
      }
    };
    window.addEventListener("boostlly:voice:status", onStatus as any);
    return () =>
      window.removeEventListener("boostlly:voice:status", onStatus as any);
  }, []);

  const [activeTab, setActiveTab] = useState<string>("today");
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<SavedQuote[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedQuoteForCollection, setSelectedQuoteForCollection] =
    useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Motivation");
  const [savedFilter, setSavedFilter] = useState<"all" | "saved" | "liked">(
    "all",
  );
  const [savedSearch, setSavedSearch] = useState("");
  const [savedSort, setSavedSort] = useState<"recent" | "az" | "za">("recent");
  const [simpleMode, setSimpleMode] = useState<boolean>(false);

  const collectionService = useMemo(() => {
    if (!storage) return null;
    return new CollectionService(storage as any);
  }, [storage]);

  const todayTabRef = useRef<{
    refresh: () => void;
    getQuote: () => any;
    speak: () => void;
    getStatus?: () => any;
  }>(null);

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

        // Load simple mode setting
        const simpleModeSetting = await (storage as any).get("simpleMode");
        setSimpleMode(
          typeof simpleModeSetting === "boolean" ? simpleModeSetting : true,
        );

        // Seed voice settings to listeners so UIs start in sync
        try {
          const seedRate = (await (storage as any).get("speechRate")) ?? 0.8;
          const seedVol = (await (storage as any).get("speechVolume")) ?? 80;
          const seedTts = await (storage as any).get("textToSpeech");
          window.dispatchEvent(
            new CustomEvent("boostlly:settings:update", {
              detail: {
                speechRate: typeof seedRate === "number" ? seedRate : 0.8,
                speechVolume: typeof seedVol === "number" ? seedVol : 80,
                ...(typeof seedTts === "boolean"
                  ? { textToSpeech: seedTts }
                  : {}),
              },
            }),
          );
        } catch {}
      } catch (error) {
        logError("Failed to load data:", { error: error });
      }
    })();
  }, [storage, collectionService]);

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

  // Listen for simple mode changes
  useEffect(() => {
    const onSimpleModeChange = async () => {
      if (!storage) return;
      try {
        const simpleModeSetting = await (storage as any).get("simpleMode");
        setSimpleMode(
          typeof simpleModeSetting === "boolean" ? simpleModeSetting : true,
        );
      } catch (error) {
        logError("Failed to load simple mode setting:", { error: error });
      }
    };

    // Listen for storage changes (for cross-tab sync)
    if (storage && typeof (storage as any).onChanged === "function") {
      (storage as any).onChanged.addListener((changes: any) => {
        if (changes.simpleMode) {
          setSimpleMode(changes.simpleMode.newValue || false);
        }
      });
    }

    // Also listen for custom events
    window.addEventListener("boostlly:simpleMode:changed", onSimpleModeChange);

    return () => {
      window.removeEventListener(
        "boostlly:simpleMode:changed",
        onSimpleModeChange,
      );
    };
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

  function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  async function handleCreateQuote() {
    if (!newText.trim() || !newAuthor.trim()) return;
    const created: SavedQuote = {
      id: generateId(),
      text: newText.trim(),
      author: newAuthor.trim(),
      category: newCategory.trim() || "Custom",
    };
    const next = [created, ...savedQuotes];
    await saveSavedQuotes(next);
    setShowCreate(false);
    setNewText("");
    setNewAuthor("");
  }

  async function handleRemoveSaved(id: string) {
    const next = savedQuotes.filter((q) => q.id !== id);
    await saveSavedQuotes(next);
  }

  const allSavedQuotes = useMemo(() => {
    const map = new Map<string, SavedQuote>();
    for (const q of savedQuotes) map.set(q.id, q);
    for (const q of likedQuotes) map.set(q.id, q);
    return Array.from(map.values());
  }, [savedQuotes, likedQuotes]);

  const filteredSavedQuotes = useMemo(() => {
    let list = allSavedQuotes;
    if (savedFilter === "saved")
      list = list.filter((q) => savedQuotes.some((s) => s.id === q.id));
    if (savedFilter === "liked")
      list = list.filter((q) => likedQuotes.some((l) => l.id === q.id));
    const q = savedSearch.trim().toLowerCase();
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
      savedSort === "az" ? byAZ : savedSort === "za" ? byZA : byRecent;
    return [...list].sort(sorter);
  }, [
    allSavedQuotes,
    savedQuotes,
    likedQuotes,
    savedFilter,
    savedSearch,
    savedSort,
  ]);

  async function speakQuote(q: SavedQuote) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      // Respect stored settings if available
      const enabled = await (storage as any)?.get?.("textToSpeech");
      if (enabled === false) return;
      const rate = (await (storage as any)?.get?.("speechRate")) ?? 0.8;
      const volumePct = (await (storage as any)?.get?.("speechVolume")) ?? 80;
      const utter = new SpeechSynthesisUtterance(`"${q.text}" by ${q.author}`);
      utter.rate = typeof rate === "number" ? rate : 0.8;
      utter.volume = Math.max(
        0,
        Math.min(1, (typeof volumePct === "number" ? volumePct : 80) / 100),
      );
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  }

  async function saveQuoteAsImage(q: SavedQuote) {
    try {
      const dataUrl = await generateQuoteImage(q.text, q.author);
      const filename = `boostlly-quote-${q.id}-${Date.now()}.png`;
      downloadImage(dataUrl, filename);
    } catch (error) {
      logError("Failed to generate image:", { error: error });
    }
  }

  const allNavigationTabs = [
    { id: "today", label: "Today", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "collections", label: "Collections", icon: FolderOpen },
    { id: "articles", label: "Articles", icon: BookOpen },
    { id: "newsletter", label: "Newsletter", icon: Mail },
    { id: "api", label: "API", icon: Globe },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "create", label: "Your Quotes", icon: Plus },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "voice", label: "Voice", icon: Volume2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // Filter tabs based on simple mode
  const navigationTabs = simpleMode
    ? allNavigationTabs.filter((tab) =>
        [
          "today",
          "search",
          "collections",
          "saved",
          "create",
          "voice",
          "stats",
          "settings",
        ].includes(tab.id),
      )
    : allNavigationTabs;

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

  const containerClass =
    variant === "popup"
      ? "w-[600px] h-[600px] text-foreground p-4 overflow-y-auto relative"
      : "min-h-screen text-foreground p-4 lg:p-8 overflow-y-auto relative";

  // Background image styling (apply to all variants when available)
  const [showBackground, setShowBackground] = useState<boolean>(true);
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
        // Ensure Simple Mode defaults to ON for first-run (persist if missing)
        const simple = await (storage as any)?.get?.("simpleMode");
        if (simple === undefined || simple === null) {
          try {
            await (storage as any)?.set?.("simpleMode", true);
            setSimpleMode(true);
          } catch {}
        }
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

  const backgroundStyle =
    imageUrl && showBackground
      ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : {};

  // Debug logging
  useEffect(() => {
    logDebug("🎨 Background state:", {
      imageUrl,
      isLoading,
      error,
      variant,
    });
    if (imageUrl) {
      logDebug("🖼️ Applying background image:", { imageUrl: imageUrl });
      logDebug("🎨 Background style object:", {
        backgroundStyle: backgroundStyle,
      });
    } else {
      logDebug("⚠️ No imageUrl available yet");
    }
  }, [imageUrl, isLoading, error, variant, backgroundStyle]);

  return (
    <div
      className={variant === "web" ? "min-h-screen" : ""}
      style={backgroundStyle}
    >
      <GlobalVoiceListener />
      {/* Reduced overlay for better background visibility */}
      {imageUrl && showBackground && (
        <div
          className={
            variant === "popup"
              ? "absolute inset-0 bg-background/10 z-0"
              : "fixed inset-0 bg-background/10 z-0"
          }
        />
      )}
      <div className={containerClass}>
        {/* Remove decorative backdrop so only API image shows */}
        <div className="relative z-10">
          <header className={variant === "popup" ? "mb-4" : "mb-8"}>
            <div
              className={
                variant === "popup" ? "mb-4" : "container mx-auto px-4 mb-4"
              }
            >
              <div
                className={
                  variant === "popup"
                    ? "flex items-center justify-between"
                    : "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                }
              >
                {/* Logo and Title Section */}
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <div
                    className={
                      variant === "popup"
                        ? "flex items-center gap-2"
                        : "flex items-center gap-2 sm:gap-3"
                    }
                  >
                    <img
                      src="/boostlly-logo.png"
                      alt="Boostlly Logo"
                      className={
                        variant === "popup"
                          ? "w-8 h-8 rounded-lg"
                          : "w-8 sm:w-10 h-8 sm:h-10 rounded-lg"
                      }
                    />
                    <div>
                      <h1
                        className={
                          variant === "popup"
                            ? "text-lg font-bold"
                            : "text-xl sm:text-2xl md:text-3xl font-bold"
                        }
                        style={{ color: palette?.fg || "hsl(var(--foreground))" }}
                      >
                        Boostlly
                      </h1>
                      <p
                        className={
                          variant === "popup"
                            ? "text-xs font-medium"
                            : "text-xs sm:text-sm md:text-base font-medium"
                        }
                        style={{ color: palette?.fg || "hsl(var(--foreground))" }}
                      >
                        Tiny words. Big impact.
                      </p>
                    </div>
                  </div>
                  
                  {/* Mic button - mobile only (right side of logo/title) */}
                  <div className="sm:hidden">
                    <Button
                      variant={voiceEnabled ? "default" : "outline"}
                      size="icon"
                      title={
                        voiceEnabled
                          ? "Voice listening: on"
                          : "Voice listening: off"
                      }
                      aria-pressed={voiceEnabled}
                      onClick={async () => {
                        if (!voiceEnabled) {
                          try {
                            // Check if we're in an extension context
                            const isExtension =
                              typeof window !== "undefined" &&
                              !!(window as any).chrome?.storage?.local;

                            if (isExtension) {
                              // For extensions, show a helpful message
                              alert(
                                "Voice features are limited in browser extensions due to security restrictions. Please use the web app at boostlly.com for full voice functionality.",
                              );
                              return;
                            }

                            // Check if getUserMedia is available
                            if (
                              !navigator.mediaDevices ||
                              !navigator.mediaDevices.getUserMedia
                            ) {
                              alert(
                                "Voice features are not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.",
                              );
                              return;
                            }

                            // Prompt for mic permission on user gesture (Chrome requirement)
                            const stream =
                              await navigator.mediaDevices.getUserMedia({
                                audio: true,
                              });
                            stream.getTracks().forEach((track) => track.stop());
                            setVoiceEnabled(true);
                            setVoiceStatus("ready");
                          } catch (error: any) {
                            if (error.name === "NotAllowedError") {
                              alert(
                                "Microphone permission denied. Please enable microphone access in your browser settings and try again.",
                              );
                            } else {
                              alert(
                                `Failed to enable voice: ${error.message || "Unknown error"}`,
                              );
                            }
                          }
                        } else {
                          setVoiceEnabled(false);
                          setVoiceStatus("off");
                        }
                      }}
                      className={
                        variant === "popup"
                          ? "text-foreground h-7 w-7"
                          : "text-foreground"
                      }
                      style={{
                        backgroundColor: voiceEnabled
                          ? palette?.bg
                          : "transparent",
                        color: palette?.fg || "hsl(var(--foreground))",
                        borderColor: palette?.fg || "hsl(var(--foreground))",
                      }}
                    >
                      {voiceEnabled ? (
                        <Mic className="w-3 h-3" />
                      ) : (
                        <MicOff className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Time and Date Display - Large Desktop only (center of header) */}
                {isClient && (
                  <div
                    className="hidden lg:flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-md border"
                    style={{
                      color: palette?.fg || "hsl(var(--foreground))",
                      backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                      borderColor: "hsl(var(--fg-hsl) / 0.3)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-medium">
                        {currentTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: timeFormat === "12",
                        })}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-current opacity-30"></div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-medium">
                        {dateFormat === "compact"
                          ? currentTime.toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : currentTime.toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mic toggle placed in the header top-right - Desktop only */}
                <div className="hidden sm:flex items-center gap-2">
                  {voiceEnabled && (
                    <span className="text-[11px] text-muted-foreground max-w-[40vw] truncate">
                      {voiceStatus === "listening"
                        ? "Listening..."
                        : voiceStatus === "ready"
                          ? "Ready"
                          : voiceStatus === "error"
                            ? "Mic error"
                            : "Off"}
                    </span>
                  )}
                  <Button
                    variant={voiceEnabled ? "default" : "outline"}
                    size="icon"
                    title={
                      voiceEnabled
                        ? "Voice listening: on"
                        : "Voice listening: off"
                    }
                    aria-pressed={voiceEnabled}
                    onClick={async () => {
                      if (!voiceEnabled) {
                        try {
                          // Check if we're in an extension context
                          const isExtension =
                            typeof window !== "undefined" &&
                            !!(window as any).chrome?.storage?.local;

                          if (isExtension) {
                            // For extensions, show a helpful message
                            alert(
                              "Voice features are limited in browser extensions due to security restrictions. Please use the web app at boostlly.com for full voice functionality.",
                            );
                            return;
                          }

                          // Check if getUserMedia is available
                          if (
                            !navigator.mediaDevices ||
                            !navigator.mediaDevices.getUserMedia
                          ) {
                            alert(
                              "Voice features are not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.",
                            );
                            return;
                          }

                          // Prompt for mic permission on user gesture (Chrome requirement)
                          const stream =
                            await navigator.mediaDevices.getUserMedia({
                              audio: true,
                            });

                          // Immediately stop the stream - we just needed permission
                          if (stream) {
                            stream.getTracks().forEach((track) => track.stop());
                          }
                        } catch (error: any) {
                          const errorName = error?.name || "";
                          const errorMessage = error?.message || "";

                          logError("Microphone access denied:", {
                            error: error,
                            name: errorName,
                            message: errorMessage,
                          });

                          // Provide Chrome-specific help
                          const isChrome =
                            /Chrome/.test(navigator.userAgent) &&
                            /Google Inc/.test(navigator.vendor);

                          if (
                            errorName === "NotAllowedError" ||
                            errorName === "PermissionDeniedError"
                          ) {
                            if (isChrome) {
                              alert(
                                "Microphone blocked!\n\n" +
                                  "To fix in Chrome:\n" +
                                  "1. Click the 🔒 lock icon in the address bar\n" +
                                  "2. Find 'Microphone' and set to 'Allow'\n" +
                                  "3. Click 'Reload' or refresh the page\n" +
                                  "4. Try the microphone button again",
                              );
                            } else {
                              alert(
                                "Microphone access was denied.\n\n" +
                                  "Please allow microphone access when prompted and try again.",
                              );
                            }
                          } else if (errorName === "NotFoundError") {
                            alert(
                              "No microphone found!\n\n" +
                                "Please connect a microphone and try again.",
                            );
                          } else if (errorName === "NotReadableError") {
                            alert(
                              "Microphone is being used by another application.\n\n" +
                                "Please close other apps using the microphone and try again.",
                            );
                          } else {
                            alert(
                              "Cannot access microphone.\n\n" +
                                "Error: " +
                                errorMessage +
                                "\n\n" +
                                (isChrome
                                  ? "Check Chrome settings: chrome://settings/content/microphone"
                                  : "Please check your browser's microphone settings."),
                            );
                          }
                          return;
                        }
                      }
                      const next = !voiceEnabled;
                      setVoiceEnabled(next);
                      if (next) {
                        try {
                          window.dispatchEvent(
                            new CustomEvent("boostlly:voice:user-gesture"),
                          );
                        } catch {}
                      }
                    }}
                    className={`rounded-2xl border backdrop-blur-md ${voiceEnabled ? "shadow-md" : "opacity-90"}`}
                    style={{
                      backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                      color: "hsl(var(--fg-hsl))",
                      borderColor: "hsl(var(--fg-hsl) / 0.3)",
                    }}
                  >
                    {voiceEnabled ? (
                      <Mic
                        className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                      />
                    ) : (
                      <MicOff
                        className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Time/Date Bar - Shows below header on mobile and tablet */}
          {isClient && (
            <div className="lg:hidden container mx-auto px-4 pt-2 pb-3">
              <div
                className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg backdrop-blur-md border"
                style={{
                  color: palette?.fg || "hsl(var(--foreground))",
                  backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                  borderColor: "hsl(var(--fg-hsl) / 0.3)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: timeFormat === "12",
                    })}
                  </span>
                </div>
                <div className="w-px h-4 bg-current opacity-30"></div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {currentTime.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <nav
            className={
              variant === "popup" ? "mb-4" : "container mx-auto px-4 mb-8"
            }
          >
            <div
              className={
                variant === "popup"
                  ? "flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto elevation-1 hover-soft scrollbar-hide"
                  : "flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-2xl p-2 border border-border/20 overflow-x-auto shadow-2xl"
              }
            >
              {navigationTabs.map((tab) => {
                const Icon = tab.icon as any;
                return (
                  <button
                    key={tab.id}
                    onClick={async () => {
                      if (tab.id === "saved") {
                        // Fallback: inject current TodayTab quote if already saved/liked
                        try {
                          const status = todayTabRef.current?.getStatus?.();
                          if (status?.quote && status?.isSaved) {
                            setSavedQuotes((prev) => {
                              const exists = prev.some(
                                (q) => q.id === status.quote.id,
                              );
                              return exists ? prev : [status.quote, ...prev];
                            });
                          }
                          if (status?.quote && status?.isLiked) {
                            setLikedQuotes((prev) => {
                              const exists = prev.some(
                                (q) => q.id === status.quote.id,
                              );
                              return exists ? prev : [status.quote, ...prev];
                            });
                          }
                        } catch {}
                        await forceRefreshLists();
                        // slight delay to allow pending writes to land
                        setTimeout(() => forceRefreshLists(), 50);
                        setSavedFilter("all");
                      }
                      setActiveTab(tab.id);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && setActiveTab(tab.id)}
                    aria-label={`Navigate to ${tab.label} tab`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={
                      activeTab === tab.id
                        ? variant === "popup"
                          ? "flex items-center gap-1 px-2 py-1.5 rounded-md shadow-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors backdrop-blur-md border-2"
                          : "group relative flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors font-semibold backdrop-blur-md border-2"
                        : variant === "popup"
                          ? "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors backdrop-blur-sm hover:backdrop-blur-md"
                          : "group relative flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors font-medium backdrop-blur-sm hover:backdrop-blur-md"
                    }
                    style={
                      activeTab === tab.id
                        ? {
                            backgroundColor: "hsl(var(--bg-hsl) / 0.6)",
                            color: "hsl(var(--fg-hsl))",
                            borderColor: "hsl(var(--fg-hsl) / 0.6)",
                            textShadow:
                              "0 1px 3px rgba(0,0,0,0.4), 0 0 12px rgba(0,0,0,0.3)",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "hsl(var(--fg-hsl) / 0.85)",
                            borderColor: "transparent",
                            textShadow:
                              "0 1px 2px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.4)",
                          }
                    }
                  >
                    <Icon
                      className={variant === "popup" ? "w-3 h-3" : "w-4 h-4"}
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                      }}
                    />
                    <span className={variant === "popup" ? "" : "font-medium"}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div
            className={
              variant === "popup" ? "space-y-4" : "container mx-auto px-4 py-8"
            }
          >
            <ErrorBoundary>
              {(() => {
                switch (activeTab) {
                  case "today":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2
                              className={`${variant === "popup" ? "text-lg" : "text-2xl"} font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border`}
                              style={{
                                color: "hsl(var(--fg-hsl))",
                                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                              }}
                            >
                              Today&apos;s Boost
                            </h2>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Open Pomodoro timer"
                              title="Pomodoro"
                              className="rounded-2xl border backdrop-blur-md"
                              style={{
                                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                color: "hsl(var(--fg-hsl))",
                                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                              }}
                              onClick={() =>
                                window.open(
                                  "https://chronobloom.netlify.app/",
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <Timer
                                className={
                                  variant === "popup" ? "w-4 h-4" : "w-5 h-5"
                                }
                              />
                            </Button>
                          </div>
                          {storage && (
                            <TodayTab
                              ref={todayTabRef as any}
                              storage={storage as any}
                              onAddSavedImmediate={(q: any) => {
                                setSavedQuotes((prev) => {
                                  const exists = prev.some(
                                    (p) => p.id === q.id,
                                  );
                                  return exists ? prev : [q, ...prev];
                                });
                              }}
                              onRemoveSavedImmediate={(id: any) => {
                                setSavedQuotes((prev) =>
                                  prev.filter((p) => p.id !== id),
                                );
                              }}
                              onAddLikedImmediate={(q: any) => {
                                setLikedQuotes((prev) => {
                                  const exists = prev.some(
                                    (p) => p.id === q.id,
                                  );
                                  return exists ? prev : [q, ...prev];
                                });
                              }}
                              onRemoveLikedImmediate={(id: any) => {
                                setLikedQuotes((prev) =>
                                  prev.filter((p) => p.id !== id),
                                );
                              }}
                              onSavedChanged={async () => {
                                try {
                                  const list = await (storage as any).get(
                                    "savedQuotes",
                                  );
                                  if (Array.isArray(list)) setSavedQuotes(list);
                                } catch {}
                              }}
                              onLikedChanged={async () => {
                                try {
                                  const list = await (storage as any).get(
                                    "likedQuotes",
                                  );
                                  if (Array.isArray(list)) setLikedQuotes(list);
                                } catch {}
                              }}
                            />
                          )}
                        </div>
                      </Suspense>
                    );
                  case "search":
                    return (
                      <Suspense fallback={<SearchSkeleton />}>
                        <div className="space-y-4">
                          <AdvancedSearch
                            savedQuotes={savedQuotes}
                            collections={collections}
                            onRemoveQuote={handleRemoveSaved}
                            onSpeakQuote={speakQuote}
                            onSaveAsImage={saveQuoteAsImage}
                            onAddToCollection={(quote) => {
                              setSelectedQuoteForCollection(quote);
                              setShowAddToCollection(true);
                            }}
                          />
                        </div>
                      </Suspense>
                    );
                  case "community":
                    return null;
                  case "collections":
                    return (
                      <Suspense fallback={<CollectionsSkeleton />}>
                        <div className="space-y-4">
                          {storage && (
                            <CollectionsTab
                              storage={storage as any}
                              savedQuotes={savedQuotes}
                              likedQuotes={likedQuotes}
                            />
                          )}
                        </div>
                      </Suspense>
                    );
                  case "api":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2
                                className={
                                  variant === "popup"
                                    ? "text-lg font-bold"
                                    : "text-2xl font-bold"
                                }
                              >
                                API Explorer
                              </h2>
                              <p className="text-xs text-muted-foreground">
                                Enhanced external sources
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="glass" className="text-xs">
                                6 APIs
                              </Badge>
                              {variant === "popup" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={openInOptionsPage}
                                >
                                  Open in Options
                                </Button>
                              )}
                            </div>
                          </div>
                          {storage && <APIExplorer storage={storage as any} />}
                        </div>
                      </Suspense>
                    );
                  case "saved":
                    return variant === "popup" ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold">Saved</h2>
                          <Badge variant="glass" className="text-xs">
                            {savedQuotes.length} saved
                          </Badge>
                        </div>
                        {savedQuotes.length === 0 ? (
                          <div className="p-10 text-center bg-card rounded-xl border border-border elevation-1">
                            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                            <p className="text-foreground font-medium">
                              No items yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Save quotes to see them here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {savedQuotes.map((quote) => (
                              <div
                                key={quote.id}
                                className="p-4 bg-card rounded-xl border border-border elevation-1 hover-soft"
                              >
                                <p className="text-sm italic mb-3 leading-relaxed">
                                  &ldquo;{quote.text}&rdquo;
                                </p>
                                <div className="flex items-center justify-between">
                                  <Badge variant="glass" className="text-xs">
                                    {quote.category || "Custom"}
                                  </Badge>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() =>
                                        handleRemoveSaved(quote.id)
                                      }
                                      aria-label={`Remove quote`}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              color: palette?.fg || "hsl(var(--foreground))",
                            }}
                          >
                            Saved
                          </h2>
                          <div className="flex items-center gap-2">
                            <div className="bg-card rounded-lg border border-border p-0.5 elevation-1">
                              <button
                                onClick={() => setSavedFilter("all")}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                              >
                                All
                              </button>
                              <button
                                onClick={() => setSavedFilter("saved")}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "saved" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                              >
                                Saved
                              </button>
                              <button
                                onClick={() => setSavedFilter("liked")}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "liked" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                              >
                                Liked
                              </button>
                            </div>
                            <div
                              className="hidden sm:flex items-center gap-2 rounded-lg border p-1 backdrop-blur-md"
                              style={{
                                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                color: "hsl(var(--fg-hsl))",
                              }}
                            >
                              <input
                                value={savedSearch}
                                onChange={(e) => setSavedSearch(e.target.value)}
                                placeholder="Search saved..."
                                className="bg-transparent px-2 py-1 text-sm outline-none"
                              />
                              <select
                                value={savedSort}
                                onChange={(e) =>
                                  setSavedSort(e.target.value as any)
                                }
                                className="bg-transparent text-sm outline-none"
                              >
                                <option value="recent">Recent</option>
                                <option value="az">Author A–Z</option>
                                <option value="za">Author Z–A</option>
                              </select>
                            </div>
                            <Badge variant="glass" className="text-xs">
                              {filteredSavedQuotes.length} items
                            </Badge>
                          </div>
                        </div>
                        {filteredSavedQuotes.length === 0 ? (
                          <div className="p-10 text-center bg-card rounded-xl border border-border elevation-1">
                            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                            <p className="text-foreground font-medium">
                              No items yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Save or like quotes to see them here.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredSavedQuotes.map((quote) => (
                              <div
                                key={quote.id}
                                className="p-4 bg-card rounded-xl border border-border elevation-1 hover-soft"
                              >
                                <p
                                  className="text-sm italic mb-3 leading-relaxed"
                                  onClick={() => {
                                    const isSaved = savedQuotes.some(
                                      (q) => q.id === quote.id,
                                    );
                                    const isLiked = likedQuotes.some(
                                      (q) => q.id === quote.id,
                                    );
                                    if (isSaved) {
                                      const next = savedQuotes.filter(
                                        (q) => q.id !== quote.id,
                                      );
                                      void saveSavedQuotes(next);
                                    }
                                    if (isLiked) {
                                      const next = likedQuotes.filter(
                                        (q) => q.id !== quote.id,
                                      );
                                      void saveLikedQuotes(next);
                                    }
                                  }}
                                  aria-label={`Remove this quote`}
                                  title="Remove"
                                >
                                  &ldquo;{quote.text}&rdquo;
                                </p>
                                {/* Author and Source Information */}
                                <div className="mb-3 space-y-2">
                                  {quote.author && (
                                    <p className="text-xs text-foreground/80 font-medium">
                                      — {quote.author}
                                    </p>
                                  )}
                                  {quote.source && (
                                    <div className="flex items-center">
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-1 bg-background/20 border-border/50 text-foreground/80"
                                      >
                                        🌐 {quote.source}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge variant="glass" className="text-xs">
                                    {quote.category || "Custom"}
                                  </Badge>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => {
                                        setSelectedQuoteForCollection(quote);
                                        setShowAddToCollection(true);
                                      }}
                                      aria-label={`Add quote to collection`}
                                    >
                                      <FolderOpen className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => {
                                        const isSaved = savedQuotes.some(
                                          (q) => q.id === quote.id,
                                        );
                                        const isLiked = likedQuotes.some(
                                          (q) => q.id === quote.id,
                                        );
                                        if (isSaved) {
                                          const next = savedQuotes.filter(
                                            (q) => q.id !== quote.id,
                                          );
                                          saveSavedQuotes(next);
                                        }
                                        if (isLiked) {
                                          const next = likedQuotes.filter(
                                            (q) => q.id !== quote.id,
                                          );
                                          saveLikedQuotes(next);
                                        }
                                      }}
                                      aria-label={`Remove quote`}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => speakQuote(quote)}
                                      aria-label={`Speak quote aloud`}
                                    >
                                      <Volume2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => saveQuoteAsImage(quote)}
                                      aria-label={`Save quote as image`}
                                    >
                                      <Image className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6"
                                      onClick={() => {
                                        if (navigator.share) {
                                          navigator
                                            .share({
                                              title: "Boostlly Quote",
                                              text: `"${quote.text}" — ${quote.author}`,
                                              url: window.location.href,
                                            })
                                            .catch((err) =>
                                              logError(err, {}, "ShareAPI"),
                                            );
                                        } else {
                                          const textToShare = `"${quote.text}" — ${quote.author}`;
                                          navigator.clipboard
                                            .writeText(textToShare)
                                            .catch(() =>
                                              logError("Failed to copy quote"),
                                            );
                                        }
                                      }}
                                      aria-label={`Share quote`}
                                    >
                                      <Share2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  case "create":
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2
                            className={
                              variant === "popup"
                                ? "text-lg font-bold"
                                : "text-2xl font-bold"
                            }
                            style={{
                              color: palette?.fg || "hsl(var(--foreground))",
                            }}
                          >
                            Your Quotes
                          </h2>
                          <Button
                            variant="gradient"
                            size={variant === "popup" ? "sm" : "default"}
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Quote</span>
                          </Button>
                        </div>

                        {/* Filter custom quotes only */}
                        {(() => {
                          const customQuotes = savedQuotes.filter(
                            (q) =>
                              q.category === "Custom" ||
                              q.source === "custom" ||
                              !q.source,
                          );

                          if (customQuotes.length === 0) {
                            return (
                              <div className="p-10 text-center bg-card rounded-xl border border-border elevation-1">
                                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                  <Plus className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-foreground font-medium mb-2">
                                  No custom quotes yet
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Create your own personalized quotes and
                                  they'll appear here and in your daily
                                  rotation.
                                </p>
                                <Button
                                  variant="gradient"
                                  onClick={() => setShowCreate(true)}
                                  className="flex items-center gap-2 mx-auto"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Create Your First Quote</span>
                                </Button>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {customQuotes.map((quote) => (
                                <div
                                  key={quote.id}
                                  className="p-4 bg-card rounded-xl border border-border elevation-1 hover-soft group relative"
                                >
                                  <p className="text-sm italic mb-3 leading-relaxed">
                                    &ldquo;{quote.text}&rdquo;
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="text-xs font-medium"
                                        style={{
                                          color:
                                            palette?.fg ||
                                            "hsl(var(--foreground))",
                                        }}
                                      >
                                        — {quote.author}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => speakQuote(quote)}
                                        aria-label={`Speak quote aloud`}
                                      >
                                        <Volume2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => saveQuoteAsImage(quote)}
                                        aria-label={`Save quote as image`}
                                      >
                                        <Image className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6"
                                        onClick={() =>
                                          handleRemoveSaved(quote.id)
                                        }
                                        aria-label={`Delete quote`}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  case "stats":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2
                                className={`${variant === "popup" ? "text-lg" : "text-2xl"} font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border`}
                                style={{
                                  color: "hsl(var(--fg-hsl))",
                                  backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                  borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                                }}
                              >
                                {simpleMode ? "Statistics" : "Analytics"}
                              </h2>
                              <p
                                className="text-xs mt-1 inline-flex px-2 py-0.5 rounded-lg backdrop-blur-md border"
                                style={{
                                  color: "hsl(var(--fg-hsl))",
                                  backgroundColor: "hsl(var(--bg-hsl) / 0.3)",
                                  borderColor: "hsl(var(--fg-hsl) / 0.25)",
                                  textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                                }}
                              >
                                {simpleMode
                                  ? "Simple statistics"
                                  : "Enhanced insights & statistics"}
                              </p>
                            </div>
                            {variant === "popup" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={openInOptionsPage}
                              >
                                Open in Options
                              </Button>
                            )}
                          </div>
                          {simpleMode ? (
                            <SimpleAnalytics variant={variant} />
                          ) : (
                            <>
                              {/* Analytics removed for privacy-first approach */}
                            </>
                          )}
                        </div>
                      </Suspense>
                    );
                  case "smart":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          {/* Advanced features removed */}
                        </div>
                      </Suspense>
                    );
                  case "analytics":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2
                                className={`${variant === "popup" ? "text-lg" : "text-2xl"} font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border`}
                                style={{
                                  color: "hsl(var(--fg-hsl))",
                                  backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                  borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                                }}
                              >
                                {simpleMode ? "Analytics" : "Advanced Analytics"}
                              </h2>
                              <p
                                className="text-xs mt-1 inline-flex px-2 py-0.5 rounded-lg backdrop-blur-md border"
                                style={{
                                  color: "hsl(var(--fg-hsl))",
                                  backgroundColor: "hsl(var(--bg-hsl) / 0.3)",
                                  borderColor: "hsl(var(--fg-hsl) / 0.25)",
                                  textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                                }}
                              >
                                {simpleMode
                                  ? "Simple statistics"
                                  : "Deep insights & pattern analysis"}
                              </p>
                            </div>
                          </div>
                          {simpleMode ? (
                            <SimpleAnalytics variant={variant} />
                          ) : (
                            <>
                              {/* Advanced analytics removed for privacy-first approach */}
                            </>
                          )}
                        </div>
                      </Suspense>
                    );
                  case "categorization":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          {/* Advanced features removed */}
                        </div>
                      </Suspense>
                    );
                  case "patterns":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          {/* Advanced features removed */}
                        </div>
                      </Suspense>
                    );
                  case "settings":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2
                                className={
                                  variant === "popup"
                                    ? "text-lg font-bold"
                                    : "text-2xl font-bold"
                                }
                                style={{
                                  color:
                                    palette?.fg || "hsl(var(--foreground))",
                                }}
                              >
                                Settings
                              </h2>
                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    palette?.fg || "hsl(var(--foreground))",
                                }}
                              >
                                Enhanced customization & preferences
                              </p>
                            </div>
                          </div>
                          {storage && (
                            <EnhancedSettings storage={storage as any} />
                          )}
                        </div>
                      </Suspense>
                    );
                  case "voice":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2
                                className={
                                  variant === "popup"
                                    ? "text-lg font-bold"
                                    : "text-2xl font-bold"
                                }
                                style={{
                                  color:
                                    palette?.fg || "hsl(var(--foreground))",
                                }}
                              >
                                Voice Commands & Speech
                              </h2>
                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    palette?.fg || "hsl(var(--foreground))",
                                }}
                              >
                                Control with voice & text-to-speech
                              </p>
                            </div>
                          </div>
                          <VoiceCommands
                            userQuotes={savedQuotes.map((q) => ({
                              id: q.id,
                              text: q.text,
                              author: q.author,
                              category: q.category || "Uncategorized",
                              tags: [],
                            }))}
                            userPreferences={{
                              theme: "auto",
                              customColors: {
                                primary: "#7C3AED",
                                secondary: "#A78BFA",
                                accent: "#9333EA",
                              },
                              fontSize: "medium",
                              animations: true,
                              compactMode: false,
                              textToSpeech: true,
                              speechRate: 0.8,
                              speechVolume: 80,
                              notificationSounds: true,
                              soundVolume: 70,
                              dataSharing: false,
                              analyticsEnabled: true,
                              profileVisibility: "public",
                              highContrast: false,
                              screenReader: false,
                              reducedMotion: false,
                              pushNotifications: true,
                              dailyReminder: true,
                              achievementAlerts: true,
                              autoSync: true,
                              offlineMode: false,
                              cacheEnabled: true,
                              notifications: true,
                              categories: ["motivation", "success", "wisdom"],
                              language: "en",
                            }}
                            onQuoteSelect={() => {}}
                            onNavigate={(tab) => setActiveTab(tab)}
                          />
                        </div>
                      </Suspense>
                    );
                  case "predictions":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          {/* Advanced features removed */}
                        </div>
                      </Suspense>
                    );
                  case "articles":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2
                              className={`${variant === "popup" ? "text-lg" : "text-2xl"} font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border`}
                              style={{
                                color: "hsl(var(--fg-hsl))",
                                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                              }}
                            >
                              <BookOpen className="w-5 h-5 mr-2" />
                              Motivational Articles
                            </h2>
                          </div>
                          <div className="text-center py-8">
                            <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Discover Inspiring Articles</h3>
                            <p className="text-gray-500 mb-6">Access our library of motivational articles on discipline, productivity, and personal growth.</p>
                            <Button asChild>
                              <a href="/articles" target="_blank" rel="noopener noreferrer">
                                Browse Articles
                              </a>
                            </Button>
                          </div>
                        </div>
                      </Suspense>
                    );
                  case "newsletter":
                    return (
                      <Suspense fallback={<TabSkeleton />}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h2
                              className={`${variant === "popup" ? "text-lg" : "text-2xl"} font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border`}
                              style={{
                                color: "hsl(var(--fg-hsl))",
                                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                              }}
                            >
                              <Mail className="w-5 h-5 mr-2" />
                              Daily Newsletter
                            </h2>
                          </div>
                          <div className="text-center py-8">
                            <Mail className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Get Daily Motivation</h3>
                            <p className="text-gray-500 mb-6">Subscribe to receive inspiring quotes and motivational articles delivered to your inbox daily.</p>
                            <Button asChild>
                              <a href="/newsletter" target="_blank" rel="noopener noreferrer">
                                Subscribe to Newsletter
                              </a>
                            </Button>
                          </div>
                        </div>
                      </Suspense>
                    );
                  case "social":
                    return null;
                  default:
                    return null;
                }
              })()}
            </ErrorBoundary>
          </div>
        </div>

        {/* Popups (only for popup variant) intentionally kept inside this component for parity */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div
              className={`w-full p-6 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl ${
                variant === "popup" ? "max-w-sm" : "max-w-md"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`${variant === "popup" ? "text-sm" : "text-lg"} font-semibold text-foreground`}
                >
                  Create Your Quote
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close create quote dialog"
                >
                  <X className={variant === "popup" ? "w-4 h-4" : "w-5 h-5"} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="quote-text"
                  >
                    Quote Text
                  </label>
                  <Input
                    id="quote-text"
                    placeholder="Enter your inspiring quote..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="quote-author"
                  >
                    Author
                  </label>
                  <Input
                    id="quote-author"
                    placeholder="Who said this?"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="quote-category"
                  >
                    Category (optional)
                  </label>
                  <Input
                    id="quote-category"
                    placeholder="e.g., Motivation, Success, Wisdom"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  size={variant === "popup" ? "sm" : "default"}
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size={variant === "popup" ? "sm" : "default"}
                  onClick={handleCreateQuote}
                  disabled={!newText.trim() || !newAuthor.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Quote
                </Button>
              </div>
            </div>
          </div>
        )}

        {variant === "popup" &&
          showAddToCollection &&
          selectedQuoteForCollection && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
              <div className="w-full max-w-sm p-4 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Add to Collection
                  </h3>
                  <button
                    onClick={() => setShowAddToCollection(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close add to collection dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Select a collection:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        className="w-full p-2 text-left rounded-lg border border-border hover:bg-accent transition-colors"
                        onClick={async () => {
                          if (!collectionService) return;
                          await (collectionService as any).addQuoteToCollection(
                            collection.id,
                            selectedQuoteForCollection.id,
                          );
                          setShowAddToCollection(false);
                          setSelectedQuoteForCollection(null);
                        }}
                        aria-label={`Add quote to ${collection.name} collection`}
                      >
                        <div className="font-medium text-foreground text-xs">
                          {collection.name}
                        </div>
                        {collection.description && (
                          <div className="text-xs text-muted-foreground">
                            {collection.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default UnifiedApp;
