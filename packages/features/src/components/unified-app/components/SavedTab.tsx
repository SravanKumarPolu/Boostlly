/**
 * Saved Tab Component
 * 
 * Displays saved and liked quotes with filtering and sorting
 */

import React, { useMemo } from 'react';
import { Badge, Button } from '@boostlly/ui';
import {
  X,
  Volume2,
  Image,
  Share2,
  FolderOpen,
  Heart,
} from 'lucide-react';
import { Variant, SavedQuote } from '../types';
import { speakQuote, saveQuoteAsImage, shareQuote } from '../utils/quote-actions';
import { StorageLike } from '../types';

interface SavedTabProps {
  variant: Variant;
  savedQuotes: SavedQuote[];
  likedQuotes: SavedQuote[];
  savedFilter: "all" | "saved" | "liked";
  savedSearch: string;
  savedSort: "recent" | "az" | "za";
  filteredSavedQuotes: SavedQuote[];
  storage: StorageLike | null;
  palette?: { fg?: string };
  onRemoveQuote: (id: string) => void;
  onAddToCollection: (quote: SavedQuote) => void;
}

export function SavedTab({
  variant,
  savedQuotes,
  likedQuotes,
  savedFilter,
  savedSearch,
  savedSort,
  filteredSavedQuotes,
  storage,
  palette,
  onRemoveQuote,
  onAddToCollection,
}: SavedTabProps) {
  if (variant === "popup") {
    return (
      <section className="space-y-4" aria-label="Saved quotes">
        <div className="flex items-center justify-between">
          <h2 
            className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight"
            style={{
              color: "hsl(var(--fg-hsl, var(--foreground)))",
            }}
          >
            Saved Quotes
          </h2>
          <Badge 
            variant="glass" 
            className="text-xs border-2"
            style={{
              color: "hsl(var(--fg-hsl, var(--foreground)))",
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.7)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            {savedQuotes.length} saved
          </Badge>
        </div>
        {savedQuotes.length === 0 ? (
          <div 
            className="p-10 sm:p-12 md:p-16 text-center rounded-xl border elevation-1 backdrop-blur-xl transition-all duration-200 max-w-2xl mx-auto"
            style={{
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 animate-pulse-glow flex items-center justify-center">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
            </div>
            <h3 
              className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug mb-3"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
            >
              No saved quotes yet
            </h3>
            <p 
              className="text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto"
              style={{
                color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.9)",
              }}
            >
              Start building your collection by saving quotes that inspire you. Each quote you save will appear here.
            </p>
            <p 
              className="text-xs sm:text-sm leading-normal opacity-75"
              style={{
                color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.8)",
              }}
            >
              💡 Tip: Click the "Save" button on any quote to add it to your collection
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedQuotes.map((quote) => (
              <article
                key={quote.id}
                className="p-4 rounded-xl border elevation-1 hover-soft backdrop-blur-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
                  borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                }}
              >
                <p 
                  className="text-sm sm:text-base italic mb-3 leading-relaxed font-light"
                  style={{
                    color: "hsl(var(--fg-hsl, var(--foreground)))",
                  }}
                >
                  &ldquo;{quote.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="glass" 
                    className="text-xs border-2"
                    style={{
                      color: "hsl(var(--fg-hsl, var(--foreground)))",
                      backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.7)",
                      borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                    }}
                  >
                    {quote.category || "Custom"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-w-[44px] min-h-[44px] w-11 h-11"
                      onClick={() => onRemoveQuote(quote.id)}
                      aria-label={`Remove quote "${quote.text.substring(0, 30)}..."`}
                      title="Remove quote"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8" aria-label="Saved quotes">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
          style={{
            color: palette?.fg || "hsl(var(--foreground))",
          }}
        >
          Saved Quotes
        </h2>
        <div className="flex items-center gap-2">
          <div 
            className="rounded-lg border p-0.5 elevation-1 backdrop-blur-xl transition-all duration-200"
            style={{
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("boostlly:savedFilter:change", {
                    detail: { filter: "all" },
                  }),
                );
              }}
              className={`px-4 py-2 text-xs rounded-md transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${savedFilter === "all" ? "bg-primary text-primary-foreground shadow-md scale-[1.05]" : "hover:scale-[1.02]"}`}
              style={
                savedFilter !== "all"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
              aria-pressed={savedFilter === "all"}
              aria-label="Show all saved and liked quotes"
            >
              All
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("boostlly:savedFilter:change", {
                    detail: { filter: "saved" },
                  }),
                );
              }}
              className={`px-4 py-2 text-xs rounded-md transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${savedFilter === "saved" ? "bg-primary text-primary-foreground shadow-md scale-[1.05]" : "hover:scale-[1.02]"}`}
              style={
                savedFilter !== "saved"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
              aria-pressed={savedFilter === "saved"}
              aria-label="Show only saved quotes"
            >
              Saved
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("boostlly:savedFilter:change", {
                    detail: { filter: "liked" },
                  }),
                );
              }}
              className={`px-4 py-2 text-xs rounded-md transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${savedFilter === "liked" ? "bg-primary text-primary-foreground shadow-md scale-[1.05]" : "hover:scale-[1.02]"}`}
              style={
                savedFilter !== "liked"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
              aria-pressed={savedFilter === "liked"}
              aria-label="Show only liked quotes"
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
              onChange={(e) => {
                window.dispatchEvent(
                  new CustomEvent("boostlly:savedSearch:change", {
                    detail: { search: e.target.value },
                  }),
                );
              }}
              placeholder="Search saved..."
              className="bg-transparent px-2 py-1 text-sm outline-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
              aria-label="Search saved quotes"
            />
            <select
              value={savedSort}
              onChange={(e) => {
                window.dispatchEvent(
                  new CustomEvent("boostlly:savedSort:change", {
                    detail: { sort: e.target.value },
                  }),
                );
              }}
              className="bg-transparent text-sm outline-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
              aria-label="Sort saved quotes"
            >
              <option value="recent">Recent</option>
              <option value="az">Author A–Z</option>
              <option value="za">Author Z–A</option>
            </select>
          </div>
          <Badge 
            variant="glass" 
            className="text-xs border-2"
            style={{
              color: "hsl(var(--fg-hsl, var(--foreground)))",
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.7)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            {filteredSavedQuotes.length} items
          </Badge>
        </div>
      </div>
      {filteredSavedQuotes.length === 0 ? (
          <div 
            className="p-12 sm:p-16 text-center rounded-xl border elevation-1 backdrop-blur-xl transition-all duration-200"
            style={{
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 animate-pulse-glow flex items-center justify-center">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 
              className="text-xl sm:text-2xl font-semibold leading-snug mb-3"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
            >
              No saved quotes yet
            </h3>
            <p 
              className="text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto"
              style={{
                color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.9)",
              }}
            >
              Start building your collection by saving quotes that inspire you. Each quote you save will appear here.
            </p>
            <p 
              className="text-xs sm:text-sm leading-normal"
              style={{
                color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.7)",
              }}
            >
              💡 Tip: Click the "Save" button on any quote to add it to your collection
            </p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {filteredSavedQuotes.map((quote) => (
            <article
              key={quote.id}
              className="p-5 sm:p-6 rounded-xl border elevation-1 hover-soft backdrop-blur-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.01] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              style={{
                backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
                borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                willChange: "transform, box-shadow",
              }}
            >
              <p 
                className="text-sm sm:text-base md:text-lg italic mb-4 leading-relaxed font-light min-h-[3rem] sm:min-h-[4rem]"
                style={{
                  color: "hsl(var(--fg-hsl, var(--foreground)))",
                }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              {/* Author and Source Information */}
              <div className="mb-3 space-y-2">
                {quote.author && (
                  <p 
                    className="text-xs sm:text-sm font-medium leading-normal opacity-80"
                    style={{
                      color: "hsl(var(--fg-hsl, var(--foreground)) / 0.9)",
                    }}
                  >
                    — {quote.author}
                  </p>
                )}
                {quote.source && (
                  <div className="flex items-center">
                    <Badge
                      variant="glass"
                      className="text-xs px-2 py-1 border-2"
                      style={{
                        color: "hsl(var(--fg-hsl, var(--foreground)) / 0.8)",
                        backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.7)",
                        borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                      }}
                    >
                      🌐 {quote.source}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Badge 
                  variant="glass" 
                  className="text-xs border-2 self-start"
                  style={{
                    color: "hsl(var(--fg-hsl, var(--foreground)))",
                    backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.7)",
                    borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                  }}
                >
                  {quote.category || "Custom"}
                </Badge>
                <div className="flex flex-wrap gap-1.5 sm:gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[36px] min-h-[36px] w-9 h-9 sm:min-w-[40px] sm:min-h-[40px] sm:w-10 sm:h-10 flex-shrink-0"
                    onClick={() => onAddToCollection(quote)}
                    aria-label={`Add quote "${quote.text.substring(0, 30)}..." to collection`}
                    title="Add to collection"
                  >
                    <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[36px] min-h-[36px] w-9 h-9 sm:min-w-[40px] sm:min-h-[40px] sm:w-10 sm:h-10 flex-shrink-0"
                    onClick={() => onRemoveQuote(quote.id)}
                    aria-label={`Remove quote "${quote.text.substring(0, 30)}..."`}
                    title="Remove quote"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[36px] min-h-[36px] w-9 h-9 sm:min-w-[40px] sm:min-h-[40px] sm:w-10 sm:h-10 flex-shrink-0"
                    onClick={() => speakQuote(quote, storage)}
                    aria-label={`Speak quote "${quote.text.substring(0, 30)}..." aloud`}
                    title="Speak quote"
                  >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[36px] min-h-[36px] w-9 h-9 sm:min-w-[40px] sm:min-h-[40px] sm:w-10 sm:h-10 flex-shrink-0"
                    onClick={() => saveQuoteAsImage(quote)}
                    aria-label={`Save quote "${quote.text.substring(0, 30)}..." as image`}
                    title="Save as image"
                  >
                    <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-w-[36px] min-h-[36px] w-9 h-9 sm:min-w-[40px] sm:min-h-[40px] sm:w-10 sm:h-10 flex-shrink-0"
                    onClick={() => shareQuote(quote)}
                    aria-label={`Share quote "${quote.text.substring(0, 30)}..."`}
                    title="Share quote"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
