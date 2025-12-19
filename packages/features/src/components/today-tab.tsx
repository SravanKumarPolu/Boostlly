import { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo } from "react";
import {
  QuoteService,
  generateQuoteImage,
  downloadImage,
  useAutoTheme,
  accessibleTTS,
  announceToScreenReader,
  getOptimalTextColorForImageWithOverlays,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  calculateEffectiveBackground,
  UserAnalyticsService,
} from "@boostlly/core";
import { getDateKey } from "@boostlly/core/utils/date-utils";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
import { isQuoteFromAPI, getQuoteSourceLabel, getQuoteSourceIcon } from "@boostlly/core/utils/quote-source-utils";
import { Card, CardContent, Button, Badge } from "@boostlly/ui";
import {
  ThumbsUp,
  Heart,
  Share2,
  Copy,
  Sparkles,
  Image,
  Volume2,
} from "lucide-react";
import {
  useTodayQuote,
  useIsLoading,
  useSetTodayQuote,
  useAddSavedQuote,
  useRemoveSavedQuote,
  useUpdateReadingStreak,
  useUnlockBadge,
  useIncrementQuotesRead,
  useIncrementQuotesSaved,
} from "@boostlly/core";

interface TodayTabProps {
  storage?: any;
  onSavedChanged?: () => void;
  onLikedChanged?: () => void;
  onAddSavedImmediate?: (q: any) => void;
  onRemoveSavedImmediate?: (idOrQuote: any) => void;
  onAddLikedImmediate?: (q: any) => void;
  onRemoveLikedImmediate?: (idOrQuote: any) => void;
}

export const TodayTab = forwardRef<
  {
    refresh: () => void;
    getQuote: () => any;
    speak: () => void;
    getStatus: () => { quote: any; isSaved: boolean; isLiked: boolean };
  },
  TodayTabProps
>(
  (
    {
      storage,
      onSavedChanged,
      onLikedChanged,
      onAddSavedImmediate,
      onRemoveSavedImmediate,
      onAddLikedImmediate,
      onRemoveLikedImmediate,
    },
    ref,
  ) => {
    // Zustand store state
    const quote = useTodayQuote();
    const isLoading = useIsLoading();
    const setTodayQuote = useSetTodayQuote();
    const addSavedQuote = useAddSavedQuote();
    const removeSavedQuote = useRemoveSavedQuote();
    const updateReadingStreak = useUpdateReadingStreak();
    const unlockBadge = useUnlockBadge();
    const incrementQuotesRead = useIncrementQuotesRead();
    const incrementQuotesSaved = useIncrementQuotesSaved();

    // Auto-theme for Picsum background
    const { imageUrl, palette } = useAutoTheme();

    // Calculate optimal text color with WCAG AA/AAA compliance
    // Account for the dark overlays applied over background images
    // Mobile has stronger overlays (black/60-70%), desktop has lighter (background/30-50%)
    const [isMobile, setIsMobile] = useState(false);
    
    // Detect mobile on mount and window resize
    useEffect(() => {
      if (typeof window === "undefined") return;
      
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);
    
    // Define overlays based on device type
    // Since card is transparent and inherits page background, we need to account for:
    // 1. Page overlays (bg-black/30 on mobile, bg-background/10 on desktop)
    // 2. Card transparency (bg-hsl / 0.12)
    // For transparent cards over background images, we prefer white text with strong shadows
    // This ensures readability regardless of background image brightness
    const overlays = useMemo(() => {
      // Page has overlays: mobile = black/30 (0.3), desktop = background/10 (lighter)
      // Card is transparent, so we combine page overlay + card transparency effect
      // We calculate as if the card adds minimal additional darkening
      return isMobile
        ? [
            // Mobile: Page has bg-black/30, card adds minimal opacity
            // Combined effect approximates black/35-40 for text color calculation
            { color: "#000000", opacity: 0.4 },
          ]
        : [
            // Desktop: Page has lighter overlay, but we still need enough for white text
            // Combined effect approximates black/20-25 for text color calculation
            { color: "#000000", opacity: 0.25 },
          ];
    }, [isMobile]);
    
    // Get optimal text color for quote text (large text: 24px+ = 3:1 for AA)
    // For transparent glassmorphism cards over background images, we ALWAYS use white text
    // with strong text shadows for maximum readability and visual consistency
    // This ensures the text is always readable regardless of background image brightness
    const quoteTextColor = useMemo(() => {
      if (!palette?.bg) {
        return { color: "#ffffff", contrast: 21.0, meetsAA: true, meetsAAA: true };
      }
      
      // Calculate effective background with page overlays + card transparency
      // Page overlays: mobile = black/30, desktop = lighter
      // Card adds minimal opacity, so combined effect is darker
      const effectiveBg = calculateEffectiveBackground(
        palette.bg,
        "#000000",
        isMobile ? 0.45 : 0.30 // Combined page overlay + card transparency effect
      );
      
      // Always use white text for transparent cards - shadows provide the contrast
      const whiteContrast = getContrastRatio("#ffffff", effectiveBg);
      
      return {
        color: "#ffffff", // Always white for glassmorphism cards
        contrast: whiteContrast,
        meetsAA: whiteContrast >= 3.0, // Large text threshold
        meetsAAA: whiteContrast >= 4.5,
      };
    }, [palette?.bg, isMobile]);
    
    // Get optimal text color for author text
    // Also always white for consistency with quote text
    const authorTextColor = useMemo(() => {
      if (!palette?.bg) {
        return { color: "#ffffff", contrast: 21.0, meetsAA: true, meetsAAA: true };
      }
      
      // Calculate effective background
      const effectiveBg = calculateEffectiveBackground(
        palette.bg,
        "#000000",
        isMobile ? 0.45 : 0.30
      );
      
      // Always use white text for consistency
      const whiteContrast = getContrastRatio("#ffffff", effectiveBg);
      
      return {
        color: "#ffffff", // Always white for glassmorphism cards
        contrast: whiteContrast,
        meetsAA: whiteContrast >= 4.5, // Normal text threshold
        meetsAAA: whiteContrast >= 7.0,
      };
    }, [palette?.bg, isMobile]);
    
    // Verify contrast ratios meet WCAG standards
    // Note: All text in the glassmorphism card uses white (#ffffff) with strong shadows
    // This ensures readability on any background image brightness
    if (process.env.NODE_ENV === "development") {
      console.log("WCAG Contrast Verification:", {
        quoteText: {
          color: quoteTextColor.color,
          contrast: quoteTextColor.contrast.toFixed(2),
          meetsAA: quoteTextColor.meetsAA,
          meetsAAA: quoteTextColor.meetsAAA,
        },
        authorText: {
          color: authorTextColor.color,
          contrast: authorTextColor.contrast.toFixed(2),
          meetsAA: authorTextColor.meetsAA,
          meetsAAA: authorTextColor.meetsAAA,
        },
      });
    }
    
    // Adaptive button style - Refined for professional appearance
    // Uses CSS variables set by applyColorPalette which automatically adapt to daily background
    // These variables are set dynamically based on the background image colors
    // Enhanced glassmorphism with refined transparency and blur
    const adaptiveButtonStyle: React.CSSProperties = {
      color: "hsl(var(--fg-hsl))",
      backgroundColor: "hsl(var(--bg-hsl) / 0.55)",
      border: "1.5px solid hsl(var(--fg-hsl) / 0.25)",
      borderColor: "hsl(var(--fg-hsl) / 0.25)",
      backdropFilter: "blur(20px) saturate(150%)",
      WebkitBackdropFilter: "blur(20px) saturate(150%)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };
    
    // Store base styles as strings for hover handlers - Refined opacity values
    const adaptiveBgColor = "hsl(var(--bg-hsl) / 0.55)";
    const adaptiveBorderColor = "hsl(var(--fg-hsl) / 0.25)";
    const adaptiveTextColor = "hsl(var(--fg-hsl))";
    const adaptiveHoverBgColor = "hsl(var(--bg-hsl) / 0.70)";
    const adaptiveHoverBorderColor = "hsl(var(--fg-hsl) / 0.35)";
    const adaptiveActiveBgColor = "hsl(var(--bg-hsl) / 0.80)";
    const adaptiveActiveBorderColor = "hsl(var(--fg-hsl) / 0.45)";
    
    // Helper function to apply glassmorphism styles consistently
    const applyGlassmorphism = (element: HTMLElement) => {
      element.style.backdropFilter = "blur(20px) saturate(150%)";
      (element.style as any).WebkitBackdropFilter = "blur(20px) saturate(150%)";
    };
    
    // Helper function for button hover state
    const applyButtonHover = (element: HTMLElement, bgColor: string, borderColor: string) => {
      element.style.backgroundColor = bgColor;
      element.style.borderColor = borderColor;
      element.style.color = adaptiveTextColor;
      applyGlassmorphism(element);
    };

    const chipStyle = {
      color: "hsl(var(--fg-hsl))",
      backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
      borderColor: "hsl(var(--fg-hsl) / 0.3)",
    } as const;

    // Local state for backward compatibility
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAuthor, setShowAuthor] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    
    // CRITICAL: Clear stale quote cache SYNCHRONOUSLY before creating QuoteService
    // This must happen before any quote loading to prevent showing yesterday's quote
    if (storage && typeof window !== "undefined") {
      try {
        const today = getDateKey();
        // Check unified cache key first, then legacy keys for backward compatibility
        const storedDate = storage.getSync?.("dailyQuoteDate") || storage.getSync?.("dayBasedQuoteDate");
        
        // If stored date exists and doesn't match today, clear it IMMEDIATELY
        if (storedDate && storedDate !== today) {
          console.log(`[TodayTab] 🚨 IMMEDIATE CACHE CLEAR: Stored date "${storedDate}" ≠ Today "${today}"`);
          // Clear unified cache keys
          storage.setSync("dailyQuote", null);
          storage.setSync("dailyQuoteDate", null);
          // Also clear legacy keys for backward compatibility
          storage.setSync("dayBasedQuote", null);
          storage.setSync("dayBasedQuoteDate", null);
          console.log(`[TodayTab] ✅ Cache cleared synchronously. Fresh quote will load for ${today}`);
        }
      } catch (error) {
        console.error("[TodayTab] Error in synchronous cache clear:", error);
      }
    }
    
    const quoteService = storage ? new QuoteService(storage) : null;

    // Set hydrated flag after mount to prevent hydration mismatch
    useEffect(() => {
      setIsHydrated(true);
    }, []);

    // Track homepage visit when TodayTab mounts
    useEffect(() => {
      if (!storage || !isHydrated) {
        if (process.env.NODE_ENV === "development") {
          console.log("⏸️ Homepage visit tracking skipped:", { storage: !!storage, isHydrated });
        }
        return;
      }
      
      try {
        const analyticsService = new UserAnalyticsService(storage as any);
        console.log("🏠 Tracking homepage visit...");
        analyticsService.trackHomepageVisit()
          .then(() => {
            console.log("✅ Homepage visit tracked successfully");
          })
          .catch((error) => {
            console.error("❌ Failed to track homepage visit:", error);
          });
      } catch (error) {
        console.error("❌ Failed to initialize analytics service:", error);
      }
    }, [storage, isHydrated]);

    // CRITICAL: Clear stale quote cache immediately on mount if date has changed
    // This must run BEFORE any quote loading to ensure we get today's quote
    useEffect(() => {
      if (!storage || typeof window === "undefined") return;
      
      try {
        const today = getDateKey();
        const storedDate = storage.getSync?.("dailyQuoteDate") || storage.getSync?.("dayBasedQuoteDate");
        
        // If stored date exists and doesn't match today, clear it immediately
        if (storedDate && storedDate !== today) {
          console.log(`[TodayTab] ⚠️ Stale quote detected! Stored date: ${storedDate}, Today: ${today}. Clearing cache...`);
          storage.setSync("dailyQuote", null);
          storage.setSync("dailyQuoteDate", null);
          storage.setSync("dayBasedQuote", null);
          storage.setSync("dayBasedQuoteDate", null);
          console.log(`[TodayTab] ✅ Cache cleared. Will load fresh quote for ${today}`);
        } else if (!storedDate) {
          console.log(`[TodayTab] No stored quote date found. Will load fresh quote for ${today}`);
        } else {
          console.log(`[TodayTab] Stored quote date matches today (${today}). Using cached quote.`);
        }
      } catch (error) {
        console.error("[TodayTab] Error checking quote date:", error);
      }
    }, [storage]);

    // Define helper functions
    const quoteEquals = useCallback((a: any, b: any): boolean => {
      if (!a || !b) return false;

      // Normalize text and author for comparison
      const normalizeText = (text: string) => (text || "").trim().toLowerCase();
      const normalizeAuthor = (author: string) =>
        (author || "").trim().toLowerCase();

      // Compare by id if both have
      if (a.id && b.id && a.id === b.id) return true;

      // Compare by text and author (case-insensitive)
      const aText = normalizeText(a.text);
      const bText = normalizeText(b.text);
      const aAuthor = normalizeAuthor(a.author);
      const bAuthor = normalizeAuthor(b.author);

      return aText === bText && aAuthor === bAuthor;
    }, []);

    const initializeQuoteStates = useCallback(async (currentQuote: any) => {
      try {
        console.log("Initializing quote states for:", currentQuote);
        if (!storage || !currentQuote) {
          console.log("No storage service or quote provided");
          setIsLiked(false);
          setIsSaved(false);
          return;
        }

        const savedQuotes = (await storage.get("savedQuotes")) || [];
        const likedQuotes = (await storage.get("likedQuotes")) || [];
        console.log("Loaded saved quotes from storage:", savedQuotes);
        console.log("Loaded liked quotes from storage:", likedQuotes);

        // Check if current quote exists in saved quotes
        const isSaved =
          Array.isArray(savedQuotes) &&
          savedQuotes.some((q: any) => quoteEquals(q, currentQuote));
        // Check if current quote exists in liked quotes
        const isLiked =
          Array.isArray(likedQuotes) &&
          likedQuotes.some((q: any) => quoteEquals(q, currentQuote));

        console.log("Quote exists in saved quotes:", isSaved);
        console.log("Quote exists in liked quotes:", isLiked);

        // Update states independently
        setIsSaved(Boolean(isSaved));
        setIsLiked(Boolean(isLiked));
        console.log(
          "Set isSaved to:",
          Boolean(isSaved),
          "and isLiked to:",
          Boolean(isLiked),
        );
      } catch (e) {
        console.error("Failed to read quote states:", e);
        // Set to false on error to be safe
        setIsLiked(false);
        setIsSaved(false);
      }
    }, [storage, quoteEquals]);

    useEffect(() => {
      if (quoteService && !quote) {
        const loadDailyQuote = async () => {
          try {
            try {
              quoteService.logDetectedEnv?.();
            } catch {}
            const force =
              typeof window !== "undefined" &&
              window.location.search.includes("force=1");
            // Use day-based quote selection
            const dailyQuote =
              (await (quoteService as any).getQuoteByDay?.(force)) ||
              quoteService.getDailyQuote();
            console.log("Loaded daily quote (day-based):", dailyQuote);
            setTodayQuote(dailyQuote);
            initializeQuoteStates(dailyQuote);
            updateReadingStreak();
            incrementQuotesRead();
          } catch (error) {
            console.error("Error loading daily quote:", error);
            // Fallback to a default quote if loading fails
            const fallbackQuote = quoteService.getRandomQuote();
            setTodayQuote(fallbackQuote);
            initializeQuoteStates(fallbackQuote);
          }
        };
        loadDailyQuote();
      }
    }, [
      quoteService,
      quote,
      setTodayQuote,
      updateReadingStreak,
      incrementQuotesRead,
    ]);

    // Auto-refresh quote every 24 hours (client-side only to prevent hydration mismatch)
    useEffect(() => {
      // Only run on client side after hydration to prevent hydration mismatch
      if (!quoteService || typeof window === "undefined" || !isHydrated) return;

      const checkAndRefreshQuote = async () => {
        try {
          // Use getDateKey for consistent date comparison (local timezone)
          const today = getDateKey();
          // Check both possible date keys (legacy and current)
          const storedDate = storage?.getSync?.("dailyQuoteDate") || storage?.getSync?.("dayBasedQuoteDate");
          
          // If the date has changed (new day), fetch a new quote
          if (storedDate !== today) {
            console.log(`[TodayTab] Date changed: ${storedDate} -> ${today}, fetching fresh quote`);
            const force =
              typeof window !== "undefined" &&
              window.location.search.includes("force=1");
            const dailyQuote =
              (await (quoteService as any).getQuoteByDay?.(force)) ||
              quoteService.getDailyQuote();
            
            setTodayQuote(dailyQuote);
            initializeQuoteStates(dailyQuote);
            updateReadingStreak();
            incrementQuotesRead();
          }
        } catch (error) {
          console.error("Error in auto-refresh:", error);
        }
      };

      // Small delay to ensure hydration is complete
      const timer = setTimeout(() => {
        checkAndRefreshQuote();
      }, 100);

      // Set up interval to check every hour (to catch the day change at midnight)
      const intervalId = setInterval(checkAndRefreshQuote, 60 * 60 * 1000);

      // Also check when the page becomes visible (user might have switched tabs overnight)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log("[TodayTab] Page visible, checking for date change...");
          checkAndRefreshQuote();
        }
      };

      // Check on focus (user returns to tab)
      const handleFocus = () => {
        console.log("[TodayTab] Window focused, checking for date change...");
        checkAndRefreshQuote();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }, [quoteService, storage, setTodayQuote, updateReadingStreak, incrementQuotesRead, initializeQuoteStates, isHydrated]);

    // Initialize quote states whenever quote changes
    useEffect(() => {
      if (quote) {
        initializeQuoteStates(quote);
      }
    }, [quote]);

    // Load preference for showing author
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const pref = await storage?.get?.("showAuthor");
          if (!cancelled) {
            setShowAuthor(pref === undefined || pref === null ? true : !!pref);
          }
        } catch {
          if (!cancelled) setShowAuthor(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [storage]);

    // Listen for voice events like read/next/save/like/share
    useEffect(() => {
      const onVoice = (evt: any) => {
        const action = evt?.detail?.action;
        switch (action) {
          case "read":
            handleSpeak();
            break;
          case "next":
            if (quoteService) {
              try {
                const newQuote = quoteService.getRandomQuote();
                setTodayQuote(newQuote);
                initializeQuoteStates(newQuote);
                updateReadingStreak();
                incrementQuotesRead();
              } catch (error) {
                console.error("Error refreshing quote via voice:", error);
              }
            }
            break;
          case "save":
            handleSave();
            break;
          case "like":
            handleLike();
            break;
          case "share":
            handleShare();
            break;
          default:
            break;
        }
      };

      window.addEventListener("boostlly:voice", onVoice as any);
      return () => window.removeEventListener("boostlly:voice", onVoice as any);
    }, [quoteService, setTodayQuote, updateReadingStreak, incrementQuotesRead]);



    const handleLike = async () => {
      try {
        if (!quote) {
          setIsLiked((prev) => !prev);
          return;
        }

        const toLike = {
          id: quote.id || Math.random().toString(36).slice(2, 10),
          text: quote.text,
          author: quote.author,
          category: quote.category || "Custom",
          createdAt: Date.now(),
        };

        if (isLiked) {
          // Remove from liked quotes
          if (storage) {
            const existing = (await storage.get("likedQuotes")) || [];
            const updated = existing.filter((q: any) => {
              if (q.id === toLike.id) return false;
              return !quoteEquals(q, toLike);
            });
            await storage.set("likedQuotes", updated);
            // Trigger event to update UI
            window.dispatchEvent(
              new CustomEvent("boostlly:likedQuotesChanged", {
                detail: { quote: toLike, action: "remove" },
              }),
            );
            try {
              (window as any).chrome?.runtime?.sendMessage?.({
                type: "boostlly:likedQuotesChanged",
              });
            } catch {}
            try {
              onLikedChanged?.();
            } catch {}
            console.log("Removed quote from liked quotes");
          }
          try {
            console.log("TodayTab:onRemoveLikedImmediate", toLike.id);
            onRemoveLikedImmediate?.(toLike.id);
          } catch {}
          setIsLiked(false);
        } else {
          // Add to liked quotes
          if (storage) {
            const existing = (await storage.get("likedQuotes")) || [];
            // Check if quote already exists to prevent duplicates
            const alreadyExists = existing.some((q: any) =>
              quoteEquals(q, toLike),
            );

            if (!alreadyExists) {
              const updated = [toLike, ...existing];
              await storage.set("likedQuotes", updated);
              // Trigger event to update UI
              window.dispatchEvent(
                new CustomEvent("boostlly:likedQuotesChanged", {
                  detail: { quote: toLike, action: "add" },
                }),
              );
              try {
                (window as any).chrome?.runtime?.sendMessage?.({
                  type: "boostlly:likedQuotesChanged",
                });
              } catch {}
              try {
                onLikedChanged?.();
              } catch {}
              console.log("Added quote to liked quotes");
            }
          }
          try {
            console.log("TodayTab:onAddLikedImmediate", toLike);
            onAddLikedImmediate?.(toLike);
          } catch {}
          setIsLiked(true);
        }

        // Microinteraction pulse
        const button = document.querySelector(".like-button");
        if (button) {
          button.classList.add("animate-pulse");
          setTimeout(() => button.classList.remove("animate-pulse"), 300);
        }
      } catch (e) {
        console.error("Failed to toggle like:", e);
      }
    };

    const handleSave = async () => {
      try {
        console.log("handleSave called, quote:", quote, "isSaved:", isSaved);

        if (!quote) {
          console.log("No quote available, toggling saved state");
          setIsSaved((prev) => !prev);
          return;
        }

        const toSave = {
          id: quote.id || Math.random().toString(36).slice(2, 10),
          text: quote.text,
          author: quote.author || "Unknown",
          category: quote.category || "Custom",
          createdAt: Date.now(),
        };

        console.log("Quote to save:", toSave);

        if (isSaved) {
          console.log("Removing quote from saved");
          removeSavedQuote(toSave.id);
          try {
            console.log("TodayTab:onRemoveSavedImmediate", toSave.id);
            onRemoveSavedImmediate?.(toSave.id);
          } catch {}
          setIsSaved(false);

          // Also remove from storage for backward compatibility
          if (storage) {
            const existing = (await storage.get("savedQuotes")) || [];
            console.log("Existing saved quotes:", existing);
            // Remove by ID or by content matching
            const updated = existing.filter((q: any) => {
              if (q.id === toSave.id) return false;
              return !quoteEquals(q, toSave);
            });
            console.log("Updated saved quotes after removal:", updated);
            await storage.set("savedQuotes", updated);
            // Trigger event to update UI
            window.dispatchEvent(
              new CustomEvent("boostlly:savedQuotesChanged", {
                detail: { quote: toSave, action: "remove" },
              }),
            );
            try {
              (window as any).chrome?.runtime?.sendMessage?.({
                type: "boostlly:savedQuotesChanged",
                action: "remove",
                quote: toSave,
              });
            } catch {}
            try {
              onSavedChanged?.();
            } catch {}
            console.log("Removed quote and triggered event");
          }
        } else {
          console.log("Adding quote to saved");

          // Check if quote already exists to prevent duplicates
          if (storage) {
            const existing = (await storage.get("savedQuotes")) || [];
            const alreadyExists = existing.some((q: any) =>
              quoteEquals(q, toSave),
            );

            if (alreadyExists) {
              console.log(
                "Quote already exists in saved quotes, just updating state",
              );
              setIsSaved(true);
              return;
            }
          }

          addSavedQuote(toSave);
          try {
            console.log("TodayTab:onAddSavedImmediate", toSave);
            onAddSavedImmediate?.(toSave);
          } catch {}
          setIsSaved(true);
          incrementQuotesSaved();
          // Unlock badge if this is the first quote saved
          unlockBadge("first-quote");

          // Also save to storage for backward compatibility
          if (storage) {
            const existing = (await storage.get("savedQuotes")) || [];
            console.log("Existing saved quotes:", existing);
            const updated = [toSave, ...existing];
            console.log("Updated saved quotes after adding:", updated);
            await storage.set("savedQuotes", updated);
            // Trigger event to update UI
            window.dispatchEvent(
              new CustomEvent("boostlly:savedQuotesChanged", {
                detail: { quote: toSave, action: "add" },
              }),
            );
            try {
              (window as any).chrome?.runtime?.sendMessage?.({
                type: "boostlly:savedQuotesChanged",
                action: "add",
                quote: toSave,
              });
            } catch {}
            try {
              onSavedChanged?.();
            } catch {}
            console.log("Added quote and triggered event");
          }
        }

        // Microinteraction pulse
        const button = document.querySelector(".save-button");
        if (button) {
          button.classList.add("animate-pulse");
          setTimeout(() => button.classList.remove("animate-pulse"), 300);
        }
      } catch (e) {
        console.error("Failed to toggle save:", e);
      }
    };

    const handleSpeak = async () => {
      // Track read button click
      if (storage) {
        try {
          const analyticsService = new UserAnalyticsService(storage as any);
          analyticsService.trackReadButtonClick().catch((error) => {
            console.error("Failed to track read button click:", error);
          });
        } catch (error) {
          console.error("Failed to initialize analytics service for read tracking:", error);
        }
      }
      try {
        if (!quote) return;

        // Read TTS settings from storage with improved defaults
        let enabled = true;
        let rate = 1.0; // Default to 1.0 for more natural pace
        let volumePct = 90; // Higher default volume for clarity

        if (storage) {
          try {
            // Try sync first, then async fallback
            enabled = storage.getSync?.("textToSpeech") ?? true;
            rate = storage.getSync?.("speechRate") ?? 1.0;
            volumePct = storage.getSync?.("speechVolume") ?? 90;

            // If sync returned null/undefined, try async
            if (enabled === null || enabled === undefined) {
              enabled = (await storage.get("textToSpeech")) ?? true;
            }
            if (rate === null || rate === undefined) {
              rate = (await storage.get("speechRate")) ?? 1.0;
            }
            if (volumePct === null || volumePct === undefined) {
              volumePct = (await storage.get("speechVolume")) ?? 90;
            }
          } catch (error) {
            console.warn("Failed to read TTS settings, using defaults:", error);
          }
        }

        if (enabled === false) return;

        // Use the accessible TTS utility with improved settings
        // Now async - waits for voices to be ready before speaking
        await accessibleTTS.speak(`"${quote.text}" by ${quote.author}`, {
          rate: typeof rate === "number" ? Math.max(0.5, Math.min(2, rate)) : 1.0,
          volume: Math.max(
            0,
            Math.min(1, (typeof volumePct === "number" ? volumePct : 90) / 100),
          ),
          pitch: 1.0, // Neutral pitch for clarity
          onError: (error) => {
            console.error("Failed to speak quote:", error);
            announceToScreenReader(
              "Failed to start speech synthesis",
              "assertive",
            );
          },
        });
      } catch (e) {
        console.error("Failed to speak quote:", e);
        announceToScreenReader("Failed to start speech synthesis", "assertive");
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        // Auto-refresh is now handled automatically every 24 hours
        // This method is kept for backward compatibility
        console.log("Manual refresh requested, but auto-refresh is enabled");
      },
      getQuote: () => quote,
      speak: () => handleSpeak(),
      getStatus: () => ({ quote, isSaved, isLiked }),
    }));

    const handleShare = async () => {
      try {
        if (!quote) {
          return;
        }

        if (navigator.share) {
          await navigator.share({
            title: "Boostlly - Daily Motivation",
            text: `"${quote.text}" — ${quote.author}`,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          const textToShare = `"${quote.text}" — ${quote.author}`;
          await navigator.clipboard.writeText(textToShare);

          // Add success feedback
          const button = document.querySelector(".share-button");
          if (button) {
            button.classList.add("animate-pulse");
            setTimeout(() => button.classList.remove("animate-pulse"), 300);
          }
        }
      } catch (error) {
        console.error("Failed to share quote:", error);
      }
    };

    const handleCopy = async () => {
      try {
        if (!quote) {
          return;
        }

        await navigator.clipboard.writeText(
          `"${quote.text}" — ${quote.author}`,
        );

        // Add success feedback
        const button = document.querySelector(".copy-button");
        if (button) {
          button.classList.add("animate-pulse");
          setTimeout(() => button.classList.remove("animate-pulse"), 300);
        }
      } catch (error) {
        console.error("Failed to copy quote:", error);
      }
    };

    const handleSaveAsImage = async () => {
      try {
        if (!quote) {
          return;
        }

        const dataUrl = await generateQuoteImage(
          quote.text,
          quote.author || "Unknown",
        );
        const filename = `boostlly-quote-${Date.now()}.png`;
        downloadImage(dataUrl, filename);
      } catch (error) {
        console.error("Failed to generate image:", error);
      }
    };

    if (!quoteService) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Storage service not provided
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-400 animate-spin duration-2s" />
              </div>
              <div className="h-4 bg-accent/40 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-accent/40 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-accent/40 rounded w-2/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!quote) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No quote available
            </div>
          </CardContent>
        </Card>
      );
    }

    // Apply background image to card if available
    const cardBackgroundStyle = imageUrl
      ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "local",
        }
      : {};

    return (
      <article 
        className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto relative overflow-hidden rounded-3xl shadow-2xl border border-border/20 backdrop-blur-xl backdrop-saturate-150"
        aria-label="Today's motivational quote"
        style={{
          ...cardBackgroundStyle,
          backgroundColor: imageUrl 
            ? "hsl(var(--bg-hsl) / 0.10)" // More transparent when image is present to show it better
            : "hsl(var(--bg-hsl) / 0.12)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 24px -6px rgba(0, 0, 0, 0.15)",
          willChange: "transform, opacity",
        }}
      >
        {/* Subtle overlay for text readability - light enough to show background image */}
        {imageUrl && (
          <div 
            className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.15)", // Light overlay - text shadows handle most contrast
            }}
          />
        )}
        {/* Content Card - Refined spacing and structure */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          {/* Category Badge - Only show if category exists */}
          {quote.category && (
            <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
              <Badge
                variant="glass"
                className="text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-xl shadow-md border font-medium"
                style={{
                  color: "hsl(var(--fg-hsl))",
                  backgroundColor: "hsl(var(--bg-hsl) / 0.55)",
                  borderColor: "hsl(var(--fg-hsl) / 0.25)",
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                }}
              >
                {getCategoryDisplay(quote.category)}
              </Badge>
            </div>
          )}

          {/* Quote Display - Enhanced typography and spacing */}
          <div className="relative mb-8 sm:mb-10 md:mb-12">
            {/* Decorative quotation marks - more subtle and refined */}
            <div
              className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif leading-none opacity-20 select-none pointer-events-none"
              style={{
                color: `hsl(var(--fg-hsl))`,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}
            >
              "
            </div>
            <div
              className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif leading-none opacity-20 select-none pointer-events-none"
              style={{
                color: `hsl(var(--fg-hsl))`,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}
            >
              "
            </div>
            <blockquote
              className="quote-text-professional text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-[1.4] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25] pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-10 lg:px-12 text-center transition-opacity duration-500 ease-in-out"
              data-current-quote={quote.text}
              style={{ 
                color: "#ffffff", // Always white for glassmorphism cards
                textShadow: isMobile 
                  ? "0 5px 24px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.85), 0 3px 10px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.55)"
                  : "0 4px 20px rgba(0,0,0,0.75), 0 3px 12px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.45)",
                WebkitTextStroke: "0.5px rgba(0,0,0,0.3)", // Subtle stroke for additional contrast
                willChange: "opacity, transform",
              }}
            >
              {quote.text}
            </blockquote>
          </div>

          {/* Author Section - Refined presentation */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {showAuthor && (
              <div className="inline-flex items-center gap-3">
                <div 
                  className="h-px flex-1 max-w-16 opacity-30"
                  style={{ backgroundColor: `hsl(var(--fg-hsl) / 0.5)` }}
                />
                <p
                  className="quote-author-professional text-sm sm:text-base md:text-lg font-medium leading-normal tracking-wide px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full backdrop-blur-xl border shadow-md transition-opacity duration-500 ease-in-out"
                  style={{
                    color: "#ffffff", // Always white for glassmorphism cards
                    backgroundColor: "hsl(var(--bg-hsl) / 0.6)",
                    borderColor: "hsl(var(--fg-hsl) / 0.25)",
                    textShadow: isMobile 
                      ? "0 4px 16px rgba(0,0,0,0.85), 0 3px 10px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.55)"
                      : "0 3px 12px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.5)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(20px) saturate(150%)",
                    WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  }}
                >
                  — {quote.author || "Unknown"}
                </p>
                <div 
                  className="h-px flex-1 max-w-16 opacity-30"
                  style={{ backgroundColor: `hsl(var(--fg-hsl) / 0.5)` }}
                />
              </div>
            )}
            {/* Quote Source Indicator - Shows API or Local */}
            {quote && (
              <div className="flex flex-col items-center justify-center mt-3 gap-2">
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md font-medium shadow-lg"
                  style={{
                    color: isQuoteFromAPI(quote) 
                      ? "hsl(142, 71%, 45%)" // Green for API
                      : "hsl(38, 92%, 50%)", // Orange for Local
                    backgroundColor: isQuoteFromAPI(quote)
                      ? "hsl(142, 71%, 45% / 0.15)"
                      : "hsl(38, 92%, 50% / 0.15)",
                    borderColor: isQuoteFromAPI(quote)
                      ? "hsl(142, 71%, 45% / 0.4)"
                      : "hsl(38, 92%, 50% / 0.4)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {getQuoteSourceIcon(quote)} {getQuoteSourceLabel(quote)}
                </Badge>
                <p
                  className="text-xs opacity-70"
                  style={{
                    color: "hsl(var(--fg-hsl))",
                    textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  }}
                >
                  {isQuoteFromAPI(quote) 
                    ? `✓ Connected to ${quote.source} API`
                    : "📦 Using local quotes (offline mode)"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons - Professional organization and styling */}
          <div className="space-y-4 sm:space-y-5">
            {/* Primary Actions - Main interactions */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 md:gap-3">
              <button
                onClick={handleLike}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={
                isLiked
                  ? {
                      backgroundColor: "hsl(var(--destructive))",
                      color: "hsl(var(--destructive-foreground))",
                      border: "2px solid hsl(var(--destructive) / 0.5)",
                    }
                  : {
                      ...adaptiveButtonStyle,
                    }
              }
              onMouseEnter={(e) => {
                if (!isLiked) {
                  applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor);
                }
              }}
              onMouseLeave={(e) => {
                if (!isLiked) {
                  applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor);
                }
              }}
              onMouseDown={(e) => {
                if (!isLiked) {
                  applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor);
                }
              }}
              onMouseUp={(e) => {
                if (!isLiked) {
                  applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor);
                }
              }}
              aria-label={isLiked ? "Unlike this quote" : "Like this quote"}
              aria-pressed={isLiked}
              title={
                isLiked
                  ? "Remove like from this quote"
                  : "Add like to this quote"
              }
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              <span className="font-medium">{isLiked ? "Liked" : "Like"}</span>
            </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              style={
                isSaved
                  ? {
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      border: "2px solid hsl(var(--primary) / 0.5)",
                    }
                  : {
                      ...adaptiveButtonStyle,
                    }
              }
              onMouseEnter={(e) => {
                if (!isSaved) {
                  applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor);
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaved) {
                  applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor);
                }
              }}
              onMouseDown={(e) => {
                if (!isSaved) {
                  applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor);
                }
              }}
              onMouseUp={(e) => {
                if (!isSaved) {
                  applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor);
                }
              }}
              aria-label={
                isSaved
                  ? "Remove quote from saved quotes"
                  : "Save quote to favorites"
              }
              aria-pressed={isSaved}
              title={
                isSaved
                  ? "Remove this quote from your saved quotes"
                  : "Save this quote to your favorites"
              }
            >
              <ThumbsUp
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              <span className="font-medium">{isSaved ? "Saved" : "Save"}</span>
            </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={adaptiveButtonStyle}
              onMouseEnter={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              onMouseLeave={(e) => applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor)}
              onMouseDown={(e) => applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor)}
              onMouseUp={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              aria-label="Share this quote"
              title="Share this quote using your device's sharing options"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="font-medium">Share</span>
            </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={adaptiveButtonStyle}
              onMouseEnter={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              onMouseLeave={(e) => applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor)}
              onMouseDown={(e) => applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor)}
              onMouseUp={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              aria-label="Copy quote text to clipboard"
              title="Copy this quote to your clipboard"
            >
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="font-medium">Copy</span>
            </button>

              <button
                onClick={handleSpeak}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={adaptiveButtonStyle}
              onMouseEnter={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              onMouseLeave={(e) => applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor)}
              onMouseDown={(e) => applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor)}
              onMouseUp={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              aria-label="Speak quote aloud using text-to-speech"
              aria-describedby="tts-description"
              title="Listen to this quote using text-to-speech"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span className="font-medium">Read</span>
              <span id="tts-description" className="sr-only">
                Click to hear this quote read aloud using text-to-speech
              </span>
            </button>

            </div>
            
            {/* Secondary Action - Image generation */}
            <div className="flex justify-center">
              <button
                onClick={handleSaveAsImage}
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 md:px-8 rounded-xl text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] min-h-[44px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={adaptiveButtonStyle}
              onMouseEnter={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              onMouseLeave={(e) => applyButtonHover(e.currentTarget, adaptiveBgColor, adaptiveBorderColor)}
              onMouseDown={(e) => applyButtonHover(e.currentTarget, adaptiveActiveBgColor, adaptiveActiveBorderColor)}
              onMouseUp={(e) => applyButtonHover(e.currentTarget, adaptiveHoverBgColor, adaptiveHoverBorderColor)}
              aria-label="Generate and download quote as image"
              title="Create a beautiful image of this quote and download it"
            >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                <span>Generate Image</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  },
);
