import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import {
  QuoteService,
  generateQuoteImage,
  downloadImage,
  useAutoTheme,
  accessibleTTS,
  announceToScreenReader,
} from "@boostlly/core";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
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

    // Get contrast-safe colors from the palette
    const textColor = palette?.fg || "hsl(var(--foreground))";

    // Dynamically scale decorative quote opacity based on background brightness
    const computeLuminance = (hex?: string): number => {
      if (!hex || !hex.startsWith("#")) return 0.5;
      const clean = hex.replace("#", "");
      const bigint = parseInt(
        clean.length === 3
          ? clean
              .split("")
              .map((c) => c + c)
              .join("")
          : clean,
        16,
      );
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;
      const toLin = (c: number) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      const [rl, gl, bl] = [toLin(r), toLin(g), toLin(b)];
      return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    };
    const bgLuma = computeLuminance(palette?.bg);
    const quoteOpacity =
      bgLuma > 0.7 ? 0.28 : bgLuma > 0.5 ? 0.24 : bgLuma > 0.3 ? 0.2 : 0.18;
    const chipStyle = {
      color: "hsl(var(--fg-hsl))",
      backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
      borderColor: "hsl(var(--fg-hsl) / 0.3)",
    } as const;

    // Local state for backward compatibility
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAuthor, setShowAuthor] = useState(true);
    const quoteService = storage ? new QuoteService(storage) : null;

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
      // Only run on client side to prevent hydration mismatch
      if (!quoteService || typeof window === "undefined") return;

      const checkAndRefreshQuote = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const lastFetchDate = storage?.getSync?.("dayBasedQuoteDate");
          
          // If the date has changed (new day), fetch a new quote
          if (lastFetchDate !== today) {
            console.log("New day detected, fetching fresh quote");
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

      // Set up interval to check every hour (to catch the day change)
      const intervalId = setInterval(checkAndRefreshQuote, 60 * 60 * 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }, [quoteService, storage, setTodayQuote, updateReadingStreak, incrementQuotesRead, initializeQuoteStates]);

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
      try {
        if (!quote) return;

        // Read TTS settings from storage with defaults
        let enabled = true;
        let rate = 0.8;
        let volumePct = 80;

        if (storage) {
          try {
            // Try sync first, then async fallback
            enabled = storage.getSync?.("textToSpeech") ?? true;
            rate = storage.getSync?.("speechRate") ?? 0.8;
            volumePct = storage.getSync?.("speechVolume") ?? 80;

            // If sync returned null/undefined, try async
            if (enabled === null || enabled === undefined) {
              enabled = (await storage.get("textToSpeech")) ?? true;
            }
            if (rate === null || rate === undefined) {
              rate = (await storage.get("speechRate")) ?? 0.8;
            }
            if (volumePct === null || volumePct === undefined) {
              volumePct = (await storage.get("speechVolume")) ?? 80;
            }
          } catch (error) {
            console.warn("Failed to read TTS settings, using defaults:", error);
          }
        }

        if (enabled === false) return;

        // Use the accessible TTS utility
        accessibleTTS.speak(`"${quote.text}" by ${quote.author}`, {
          rate: typeof rate === "number" ? rate : 0.8,
          volume: Math.max(
            0,
            Math.min(1, (typeof volumePct === "number" ? volumePct : 80) / 100),
          ),
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

    return (
      <div className="w-full max-w-2xl mx-auto relative overflow-hidden rounded-xl shadow-2xl">
        {/* Picsum Background Image */}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
          />
        )}

        {/* Slightly stronger overlay to ensure contrast over bright images */}
        <div className="absolute inset-0 bg-background/25" />
        {/* Top gradient wash for header readability over busy images */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/35 to-transparent" />

        {/* Content Card */}
        <div className="relative z-10 p-4 sm:p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-8">
            <h2
              className="text-lg sm:text-2xl font-bold flex items-center px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl backdrop-blur-md border w-fit max-w-full"
              style={{
                color: textColor,
                backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                borderColor: "hsl(var(--fg-hsl) / 0.3)",
                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
              }}
            >
              <span className="whitespace-nowrap">Today's Boost</span>
            </h2>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {quote.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-md"
                  style={{
                    color: "hsl(var(--fg-hsl))",
                    backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                    borderColor: "hsl(var(--fg-hsl) / 0.3)",
                  }}
                >
                  {getCategoryDisplay(quote.category)}
                </Badge>
              )}
            </div>
          </div>

          {/* Quote Display */}
          <div className="relative mb-8">
            <div
              className="absolute top-0 left-0 text-5xl sm:text-6xl md:text-8xl font-serif leading-none"
              style={{
                color: `hsl(var(--fg-hsl) / ${quoteOpacity})`,
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              "
            </div>
            <div
              className="absolute bottom-0 right-0 text-5xl sm:text-6xl md:text-8xl font-serif leading-none"
              style={{
                color: `hsl(var(--fg-hsl) / ${quoteOpacity})`,
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              "
            </div>
            <blockquote
              className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 sm:px-8 text-center italic today-quote-text"
              data-current-quote={quote.text}
              style={{ color: textColor }}
            >
              {quote.text}
            </blockquote>
          </div>

          {/* Author (toggleable) */}
          <div className="text-center mb-8">
            {showAuthor && (
              <p
                className="inline-block text-base sm:text-lg md:text-xl font-medium px-3 py-1 rounded-full backdrop-blur-md"
                style={{
                  color: "hsl(var(--fg-hsl))",
                  backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                  border: "1px solid",
                  borderColor: "hsl(var(--fg-hsl) / 0.3)",
                }}
              >
                — {quote.author || "Unknown"}
              </p>
            )}
            {/* Source section hidden per user request */}
            {/* {quote.source && (
              <div className="flex flex-col items-center justify-center mt-3 gap-2">
                <Badge
                  variant="outline"
                  className="text-sm px-4 py-2 rounded-full backdrop-blur-md font-semibold shadow-lg"
                  style={{
                    color: "hsl(var(--fg-hsl))",
                    backgroundColor: "hsl(var(--bg-hsl) / 0.45)",
                    borderColor: "hsl(var(--fg-hsl) / 0.4)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  🌐 {quote.source}
                </Badge>
                <p
                  className="text-xs opacity-80"
                  style={{
                    color: "hsl(var(--fg-hsl))",
                    textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  }}
                >
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}'s Provider
                </p>
              </div>
            )} */}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLike}
              className={`${
                isLiked
                  ? "rounded-2xl border shadow bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "rounded-2xl border backdrop-blur-md"
              } transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              style={
                isLiked
                  ? ({
                      backgroundColor: "hsl(var(--destructive))",
                      color: "hsl(var(--destructive-foreground))",
                      borderColor: "hsl(var(--fg-hsl) / 0.3)",
                    } as any)
                  : (chipStyle as any as any)
              }
              aria-label={isLiked ? "Unlike this quote" : "Like this quote"}
              aria-pressed={isLiked}
              title={
                isLiked
                  ? "Remove like from this quote"
                  : "Add like to this quote"
              }
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              <span>{isLiked ? "Liked" : "Like"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              className={`${
                isSaved
                  ? "rounded-2xl border shadow bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "rounded-2xl border backdrop-blur-md"
              } transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              style={
                isSaved
                  ? ({
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      borderColor: "hsl(var(--fg-hsl) / 0.3)",
                    } as any)
                  : (chipStyle as any as any)
              }
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
                className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="rounded-2xl border backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={chipStyle as any}
              aria-label="Share this quote"
              title="Share this quote using your device's sharing options"
            >
              <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Share</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="rounded-2xl border backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={chipStyle as any}
              aria-label="Copy quote text to clipboard"
              title="Copy this quote to your clipboard"
            >
              <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Copy</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSpeak}
              aria-label="Speak quote aloud using text-to-speech"
              aria-describedby="tts-description"
              className="rounded-2xl border backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={chipStyle as any}
              title="Listen to this quote using text-to-speech"
            >
              <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Read</span>
              <span id="tts-description" className="sr-only">
                Click to hear this quote read aloud using text-to-speech
              </span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveAsImage}
              className="rounded-2xl border backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={chipStyle as any}
              aria-label="Generate and download quote as image"
              title="Create a beautiful image of this quote and download it"
            >
              <Image className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Image</span>
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
