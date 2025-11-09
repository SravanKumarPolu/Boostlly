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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 
            className="text-lg font-bold"
            style={{
              color: "hsl(var(--fg-hsl, var(--foreground)))",
            }}
          >
            Saved
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
            className="p-10 text-center rounded-xl border elevation-1 backdrop-blur-xl transition-all duration-200"
            style={{
              backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
              borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
            }}
          >
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            <p 
              className="font-medium"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
            >
              No items yet
            </p>
            <p 
              className="text-sm"
              style={{
                color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.9)",
              }}
            >
              Save quotes to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-4 rounded-xl border elevation-1 hover-soft backdrop-blur-xl transition-all duration-200"
                style={{
                  backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
                  borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
                }}
              >
                <p 
                  className="text-sm italic mb-3 leading-relaxed"
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
                      className="w-6 h-6"
                      onClick={() => onRemoveQuote(quote.id)}
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
    );
  }

  return (
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
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "all" ? "bg-primary text-primary-foreground" : ""}`}
              style={
                savedFilter !== "all"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
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
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "saved" ? "bg-primary text-primary-foreground" : ""}`}
              style={
                savedFilter !== "saved"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
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
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${savedFilter === "liked" ? "bg-primary text-primary-foreground" : ""}`}
              style={
                savedFilter !== "liked"
                  ? {
                      color: "hsl(var(--fg-hsl, var(--muted-foreground)))",
                    }
                  : undefined
              }
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
              className="bg-transparent px-2 py-1 text-sm outline-none"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
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
              className="bg-transparent text-sm outline-none"
              style={{
                color: "hsl(var(--fg-hsl, var(--foreground)))",
              }}
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
          className="p-10 text-center rounded-xl border elevation-1 backdrop-blur-xl transition-all duration-200"
          style={{
            backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
            borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
          }}
        >
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
          <p 
            className="font-medium"
            style={{
              color: "hsl(var(--fg-hsl, var(--foreground)))",
            }}
          >
            No items yet
          </p>
          <p 
            className="text-sm"
            style={{
              color: "hsl(var(--fg-hsl, var(--muted-foreground)) / 0.9)",
            }}
          >
            Save or like quotes to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSavedQuotes.map((quote) => (
            <div
              key={quote.id}
              className="p-4 rounded-xl border elevation-1 hover-soft backdrop-blur-xl transition-all duration-200"
              style={{
                backgroundColor: "hsl(var(--bg-hsl, var(--card)) / 0.85)",
                borderColor: "hsl(var(--fg-hsl, var(--border)) / 0.4)",
              }}
            >
              <p 
                className="text-sm italic mb-3 leading-relaxed"
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
                    className="text-xs font-medium"
                    style={{
                      color: "hsl(var(--fg-hsl, var(--foreground)) / 0.8)",
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
                    className="w-6 h-6"
                    onClick={() => onAddToCollection(quote)}
                    aria-label={`Add quote to collection`}
                  >
                    <FolderOpen className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => onRemoveQuote(quote.id)}
                    aria-label={`Remove quote`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => speakQuote(quote, storage)}
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
                    onClick={() => shareQuote(quote)}
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
}
