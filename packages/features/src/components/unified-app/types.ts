/**
 * Unified App Component Types
 * 
 * Centralized type definitions for unified app components
 * to improve maintainability and type safety.
 */

import { LucideIcon } from 'lucide-react';

export type Variant = "web" | "popup";

export interface StorageLike {
  get: <T = any>(key: string) => Promise<T | null>;
  set: <T = any>(key: string, value: T) => Promise<void>;
  onChanged?: {
    addListener?: (callback: (changes: any) => void) => void;
    removeListener?: (callback: (changes: any) => void) => void;
  };
}

export interface SavedQuote {
  id: string;
  text: string;
  author: string;
  category?: string;
  source?: string;
  _ts?: number;
}

export interface UnifiedAppProps {
  variant?: Variant;
}

export interface NavigationTab {
  id: string;
  label: string;
  icon: LucideIcon | any;
}

export interface AppState {
  activeTab: string;
  savedQuotes: SavedQuote[];
  likedQuotes: SavedQuote[];
  collections: any[];
  showAddToCollection: boolean;
  selectedQuoteForCollection: SavedQuote | null;
  showCreate: boolean;
  newText: string;
  newAuthor: string;
  newCategory: string;
  savedFilter: "all" | "saved" | "liked";
  savedSearch: string;
  savedSort: "recent" | "az" | "za";
  simpleMode: boolean;
}

export interface VoiceState {
  enabled: boolean;
  status: "off" | "ready" | "listening" | "error";
  liveTranscript: string;
}

export interface TimeDateState {
  currentTime: Date;
  showTimeDate: boolean;
  timeFormat: "12" | "24";
  dateFormat: "full" | "compact";
  isClient: boolean;
}

export interface QuoteAction {
  id: string;
  type: 'save' | 'share' | 'speak' | 'image';
  quote: SavedQuote;
  timestamp: Date;
}
