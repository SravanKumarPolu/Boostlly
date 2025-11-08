/**
 * Tab Content Component
 * 
 * Handles rendering of different tab content with lazy loading
 * and proper error boundaries for each tab. Includes ALL tab cases
 * from the original unified-app.tsx
 */

import React, { Suspense, useRef } from 'react';
import { ErrorBoundary, Badge, Button, TabSkeleton, CollectionsSkeleton, SearchSkeleton } from '@boostlly/ui';
import { Timer, BookOpen, Mail } from 'lucide-react';
import { TodayTab } from '../today-tab';
import { CollectionsTab } from '../collections-tab';
import { AdvancedSearch } from '../advanced-search';
import { APIExplorer } from '../api-explorer';
import { EnhancedSettings } from '../enhanced-settings';
import { VoiceCommands } from '../voice-commands';
import { SimpleAnalytics } from '../simple-analytics';
import { SavedTab } from './components/SavedTab';
import { openInOptionsPage } from './utils/platform-utils';
import { speakQuote, saveQuoteAsImage } from './utils/quote-actions';
import { Variant, SavedQuote, StorageLike } from './types';

interface TabContentProps {
  activeTab: string;
  variant: Variant;
  storage: StorageLike | null;
  savedQuotes: SavedQuote[];
  likedQuotes: SavedQuote[];
  collections: any[];
  savedFilter: "all" | "saved" | "liked";
  savedSearch: string;
  savedSort: "recent" | "az" | "za";
  filteredSavedQuotes: SavedQuote[];
  simpleMode: boolean;
  palette?: { fg?: string };
  todayTabRef?: React.RefObject<{
    refresh: () => void;
    getQuote: () => any;
    speak: () => void;
    getStatus?: () => any;
  }>;
  onRemoveQuote: (id: string) => void;
  onAddToCollection: (quote: SavedQuote) => void;
  onSetSavedFilter: (filter: "all" | "saved" | "liked") => void;
  onSetSavedSearch: (search: string) => void;
  onSetSavedSort: (sort: "recent" | "az" | "za") => void;
  onSetShowCreate: (show: boolean) => void;
  onSetShowAddToCollection: (show: boolean) => void;
  onSetSelectedQuoteForCollection: (quote: SavedQuote | null) => void;
  onSetActiveTab: (tab: string) => void;
}

export function TabContent({
  activeTab,
  variant,
  storage,
  savedQuotes,
  likedQuotes,
  collections,
  savedFilter,
  savedSearch,
  savedSort,
  filteredSavedQuotes,
  simpleMode,
  palette,
  todayTabRef,
  onRemoveQuote,
  onAddToCollection,
  onSetSavedFilter,
  onSetSavedSearch,
  onSetSavedSort,
  onSetShowCreate,
  onSetShowAddToCollection,
  onSetSelectedQuoteForCollection,
  onSetActiveTab,
}: TabContentProps) {
  const renderTabContent = () => {
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
                    window.dispatchEvent(
                      new CustomEvent("boostlly:addSavedQuote", {
                        detail: { quote: q },
                      }),
                    );
                  }}
                  onRemoveSavedImmediate={(id: any) => {
                    window.dispatchEvent(
                      new CustomEvent("boostlly:removeSavedQuote", {
                        detail: { id },
                      }),
                    );
                  }}
                  onAddLikedImmediate={(q: any) => {
                    window.dispatchEvent(
                      new CustomEvent("boostlly:addLikedQuote", {
                        detail: { quote: q },
                      }),
                    );
                  }}
                  onRemoveLikedImmediate={(id: any) => {
                    window.dispatchEvent(
                      new CustomEvent("boostlly:removeLikedQuote", {
                        detail: { id },
                      }),
                    );
                  }}
                  onSavedChanged={async () => {
                    window.dispatchEvent(
                      new CustomEvent("boostlly:refreshSavedQuotes"),
                    );
                  }}
                  onLikedChanged={async () => {
                    window.dispatchEvent(
                      new CustomEvent("boostlly:refreshLikedQuotes"),
                    );
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
                onRemoveQuote={onRemoveQuote}
                onSpeakQuote={(q) => speakQuote(q, storage)}
                onSaveAsImage={saveQuoteAsImage}
                onAddToCollection={(quote) => {
                  onSetSelectedQuoteForCollection(quote);
                  onSetShowAddToCollection(true);
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
        return (
          <SavedTab
            variant={variant}
            savedQuotes={savedQuotes}
            likedQuotes={likedQuotes}
            savedFilter={savedFilter}
            savedSearch={savedSearch}
            savedSort={savedSort}
            filteredSavedQuotes={filteredSavedQuotes}
            storage={storage}
            palette={palette}
            onRemoveQuote={onRemoveQuote}
            onAddToCollection={onAddToCollection}
          />
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
                onClick={() => onSetShowCreate(true)}
                className="flex items-center gap-2"
              >
                <span>Create Quote</span>
              </Button>
            </div>
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
                      <span className="text-white text-2xl">+</span>
                    </div>
                    <p className="text-foreground font-medium mb-2">
                      No custom quotes yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your own personalized quotes and they'll appear here and in your daily rotation.
                    </p>
                    <Button
                      variant="gradient"
                      onClick={() => onSetShowCreate(true)}
                      className="flex items-center gap-2 mx-auto"
                    >
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
                            onClick={() => speakQuote(quote, storage)}
                            aria-label={`Speak quote aloud`}
                          >
                            <span className="text-xs">🔊</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => saveQuoteAsImage(quote)}
                            aria-label={`Save quote as image`}
                          >
                            <span className="text-xs">🖼️</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => onRemoveQuote(quote.id)}
                            aria-label={`Delete quote`}
                          >
                            <span className="text-xs">✕</span>
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
                onNavigate={(tab) => onSetActiveTab(tab)}
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
  };

  return (
    <ErrorBoundary>
      {renderTabContent()}
    </ErrorBoundary>
  );
}