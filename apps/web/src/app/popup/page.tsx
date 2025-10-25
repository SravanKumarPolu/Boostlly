"use client";

import { useEffect, useState, useRef } from "react";
import NextImage from "next/image";
import { Button, Badge, Input, Switch } from "@boostlly/ui";
import { TodayTab, AdvancedSearch } from "@boostlly/features";
import { StorageService } from "@boostlly/platform-web";
import { generateQuoteImage, downloadImage } from "@boostlly/core";
import {
  Home,
  Search,
  Users,
  FolderOpen,
  Globe,
  Heart,
  ThumbsUp,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  Sparkles,
  TrendingUp,
  Play,
  Volume2,
  Share2,
  Zap,
  Database,
  Calendar,
  Palette,
  Speaker,
  Image,
  X,
  Shield,
  Download,
  Trash2,
} from "lucide-react";

interface SavedQuote {
  id: string;
  text: string;
  author: string;
  category?: string;
  source?: string;
}

export default function PopupPage() {
  const storage = new StorageService();

  const [activeTab, setActiveTab] = useState("today");
  const [initializing, setInitializing] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [notificationSounds, setNotificationSounds] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [reduceVisuals, setReduceVisuals] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAPISource, setSelectedAPISource] = useState("ZenQuotes");

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<SavedQuote[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Motivation");

  // Ref for TodayTab to access refresh function
  const todayTabRef = useRef<{
    refresh: () => void;
    getQuote: () => any;
    speak: () => void;
    getStatus: () => { quote: any; isSaved: boolean; isLiked: boolean };
  }>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    (async () => {
      const existing = await storage.get<SavedQuote[]>("savedQuotes");
      if (Array.isArray(existing)) setSavedQuotes(existing);
      const existingLiked = await storage.get<SavedQuote[]>("likedQuotes");
      if (Array.isArray(existingLiked)) setLikedQuotes(existingLiked);
      const tts = await storage.get<boolean>("textToSpeech");
      if (typeof tts === "boolean") setTextToSpeech(tts);
      const compact = await storage.get<boolean>("compactMode");
      if (typeof compact === "boolean") {
        setCompactMode(compact);
        document.body.classList.toggle("density-compact", compact);
      }
      setInitializing(false);
    })();

    const onSavedChanged = () => {
      storage.get<SavedQuote[]>("savedQuotes").then((list) => {
        if (Array.isArray(list)) setSavedQuotes(list);
      });
    };
    window.addEventListener("boostlly:savedQuotesChanged", onSavedChanged);

    const onLikedChanged = () => {
      storage.get<SavedQuote[]>("likedQuotes").then((list) => {
        if (Array.isArray(list)) setLikedQuotes(list);
      });
    };
    window.addEventListener("boostlly:likedQuotesChanged", onLikedChanged);

    return () => {
      window.removeEventListener("boostlly:savedQuotesChanged", onSavedChanged);
      window.removeEventListener("boostlly:likedQuotesChanged", onLikedChanged);
    };
  }, []);

  async function saveSavedQuotes(next: SavedQuote[]) {
    setSavedQuotes(next);
    await storage.set("savedQuotes", next);
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

  async function speakQuote(q: SavedQuote) {
    try {
      const enabled = await storage.get<boolean>("textToSpeech");
      if (enabled === false) return;
      const rate = (await storage.get<number>("speechRate")) ?? 0.8;
      const volumePct = (await storage.get<number>("speechVolume")) ?? 80;
      if (typeof window === "undefined" || !("speechSynthesis" in window))
        return;
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
      console.error("Failed to generate image:", error);
    }
  }

  const navigationTabs = [
    { id: "today", label: "Today", icon: Home },
    { id: "search", label: "Search", icon: Search },
    // { id: "community", label: "Community", icon: Users },
    { id: "collections", label: "Collections", icon: FolderOpen },
    { id: "api", label: "API", icon: Globe },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const popularSearches = [
    "Motivation",
    "Success",
    "Leadership",
    "Happiness",
    "Wisdom",
    "Courage",
  ];
  const apiSources = [
    "ZenQuotes",
    "Quotable",
    "FavQs",
    "They Said So",
    "Local",
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-bold inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-md border"
                style={{
                  color: "hsl(var(--fg-hsl))",
                  backgroundColor: "hsl(var(--bg-hsl) / 0.35)",
                  borderColor: "hsl(var(--fg-hsl) / 0.3)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                Today&apos;s Boost
              </h2>
            </div>
            {initializing ? (
              <div className="space-y-3">
                <div className="h-28 rounded-xl bg-accent/10 animate-pulse" />
                <div className="h-10 rounded-lg bg-accent/10 animate-pulse" />
              </div>
            ) : (
              <TodayTab ref={todayTabRef} storage={storage} />
            )}
          </div>
        );

      case "search":
        return (
          <div className="space-y-4">
            {initializing ? (
              <div className="space-y-2">
                <div className="h-10 rounded-lg bg-accent/10 animate-pulse" />
                <div className="h-20 rounded-lg bg-accent/10 animate-pulse" />
              </div>
            ) : (
              <AdvancedSearch
                savedQuotes={savedQuotes}
                collections={[]}
                onRemoveQuote={handleRemoveSaved}
                onSpeakQuote={speakQuote}
                onSaveAsImage={saveQuoteAsImage}
              />
            )}
          </div>
        );

      case "community":
        return null;

      case "collections":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Collections</h2>
                <p className="text-xs text-muted-foreground">Organize quotes</p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-card rounded-lg border border-border text-center">
                <FolderOpen className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Collections</p>
                <p className="text-lg font-bold">0</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border text-center">
                <Play className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Playlists</p>
                <p className="text-lg font-bold">0</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border text-center">
                <ThumbsUp className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Liked</p>
                <p className="text-lg font-bold">{likedQuotes.length}</p>
              </div>
            </div>

            <div className="text-center py-4">
              <h3 className="text-sm font-bold mb-1">No collections</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Create your first!
              </p>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setShowCreate(true)}
              >
                Create Collection
              </Button>
            </div>
          </div>
        );

      case "api":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">API</h2>
                <p className="text-xs text-muted-foreground">
                  External sources
                </p>
              </div>
              <div className="text-xs text-muted-foreground">4 APIs</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-card rounded-lg border border-border text-center">
                <Database className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">APIs</p>
                <p className="text-lg font-bold">4</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border text-center">
                <Search className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Search</p>
                <p className="text-lg font-bold">∞</p>
              </div>
            </div>

            <div className="flex gap-1">
              {apiSources.slice(0, 2).map((source) => (
                <Button
                  key={source}
                  variant={
                    selectedAPISource === source ? "gradient" : "outline"
                  }
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedAPISource(source)}
                >
                  {source}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="glass"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Random quote functionality
                  console.log("Random quote clicked");
                }}
              >
                <Zap className="w-3 h-3 mr-1" />
                Random
              </Button>
              <Button
                variant="glass"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Trending quotes functionality
                  console.log("Trending quotes clicked");
                }}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Button>
            </div>
          </div>
        );

      case "saved":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Saved</h2>
              <Badge variant="glass" className="text-xs">
                {savedQuotes.length} saved
              </Badge>
            </div>

            {initializing ? (
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent/10 animate-pulse" />
                <div className="h-20 rounded-lg bg-accent/10 animate-pulse" />
              </div>
            ) : savedQuotes.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-xl border border-border elevation-1">
                <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-accent/30" />
                <p className="text-foreground font-medium">Nothing saved yet</p>
                <p className="text-sm text-muted-foreground">
                  Save quotes from Today or Search to see them here.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button size="sm" onClick={() => setActiveTab("today")}>
                    Go to Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("search")}
                  >
                    Go to Search
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="p-4 bg-card rounded-lg border border-border"
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
                          onClick={() => handleRemoveSaved(quote.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => speakQuote(quote)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => saveQuoteAsImage(quote)}
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
                                .catch(console.error);
                            } else {
                              const textToShare = `"${quote.text}" — ${quote.author}`;
                              navigator.clipboard
                                .writeText(textToShare)
                                .then(() => {
                                  console.log("Quote copied to clipboard");
                                })
                                .catch(() => {
                                  console.error("Failed to copy quote");
                                });
                            }
                          }}
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

      case "stats":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Statistics</h2>
              {isHydrated && (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    // Refresh stats functionality
                    console.log("Refreshing stats...");
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div
                className="p-3 bg-card rounded-lg border border-border text-center hover:bg-accent/30 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  // Show detailed read stats
                  console.log("Showing detailed read stats...");
                }}
              >
                <Sparkles className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="text-lg font-bold">{savedQuotes.length + 42}</p>
              </div>
              <div
                className="p-3 bg-card rounded-lg border border-border text-center hover:bg-accent/30 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  // Show detailed streak stats
                  console.log("Showing detailed streak stats...");
                }}
              >
                <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-lg font-bold">7</p>
              </div>
              <div
                className="p-3 bg-card rounded-lg border border-border text-center hover:bg-accent/30 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  // Show detailed shared stats
                  console.log("Showing detailed shared stats...");
                }}
              >
                <Share2 className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Shared</p>
                <p className="text-lg font-bold">5</p>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Settings</h2>

            <div className="p-4 bg-card rounded-lg border border-border elevation-1 hover-soft">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold">Theme</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Compact Mode</span>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={async (val) => {
                      setCompactMode(val);
                      await storage.set("compactMode", val);
                      document.body.classList.toggle("density-compact", val);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Reduce visuals</span>
                  <Switch
                    checked={reduceVisuals}
                    onCheckedChange={async (val) => {
                      setReduceVisuals(val);
                      await storage.set("reduceVisuals", val);
                      document.documentElement.classList.toggle(
                        "reduce-visuals",
                        val,
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Speaker className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Audio</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Text-to-Speech</span>
                  <Switch
                    checked={textToSpeech}
                    onCheckedChange={async (val) => {
                      setTextToSpeech(val);
                      await storage.set("textToSpeech", val);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Sounds</span>
                  <Switch
                    checked={notificationSounds}
                    onCheckedChange={setNotificationSounds}
                  />
                </div>
              </div>
            </div>

            {/* Data Section */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold">Data</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Auto-save Quotes</span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Analytics</span>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => console.log("Export clicked")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => console.log("Clear clicked")}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse duration-3s"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl animate-pulse duration-4s delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse duration-5s delay-1500"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-accent/5 rounded-full blur-xl animate-pulse duration-6s delay-2000"></div>
      </div>

      <div className="w-full max-w-md h-[560px] sm:h-[640px] bg-card p-4 overflow-y-auto relative rounded-2xl border border-border shadow-2xl elevation-2 hover-soft">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse duration-3s"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl animate-pulse duration-4s delay-1000"></div>
          <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse duration-5s delay-1500"></div>
          <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-accent/5 rounded-full blur-xl animate-pulse duration-6s delay-2000"></div>
        </div>

        <div className="relative z-10">
          <header className="mb-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <NextImage
                    src="/boostlly-logo.png"
                    alt="Boostlly Logo"
                    width={32}
                    height={32}
                    className="relative rounded-lg transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h1 className="text-lg font-bold text-foreground">Boostlly</h1>
              </div>
              <p className="text-xs text-foreground/80 font-medium">
                Tiny words. Big impact.
              </p>
            </div>
          </header>

          <nav className="mb-4">
            <div className="flex items-center gap-1 bg-background/10 backdrop-blur-sm rounded-lg p-1 border border-border overflow-x-auto elevation-1 hover-soft">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all duration-300 text-xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="space-y-4">{renderContent()}</div>
        </div>

        {showCreate && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
            <div className="w-full max-w-sm p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Create Quote
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Quote text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
                <Input
                  placeholder="Author"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
                <Input
                  placeholder="Category (optional)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleCreateQuote}
                >
                  Save Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
