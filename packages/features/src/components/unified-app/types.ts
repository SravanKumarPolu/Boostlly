/**
 * Unified App Component Types
 * 
 * Centralized type definitions for unified app components
 * to improve maintainability and type safety.
 */

import { LucideIcon } from 'lucide-react';

export interface UnifiedAppProps {
  variant?: 'web' | 'popup';
  storage?: any;
  savedQuotes?: any[];
  collections?: any[];
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
}

export interface UnifiedAppRefactoredProps extends UnifiedAppProps {
  // Additional props for refactored version
}

export interface NavigationTab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  badge?: string;
  disabled?: boolean;
}

export interface AppState {
  activeTab: string;
  isLoading: boolean;
  error: string | null;
}

export interface QuoteAction {
  id: string;
  type: 'save' | 'share' | 'speak' | 'image';
  quote: any;
  timestamp: Date;
}
