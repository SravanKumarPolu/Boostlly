/**
 * Create Quote Modal Component
 * 
 * Modal for creating custom quotes
 */

import React from 'react';
import { Button, Input } from '@boostlly/ui';
import { X, Plus } from 'lucide-react';
import { Variant } from '../types';

interface CreateQuoteModalProps {
  variant: Variant;
  show: boolean;
  newText: string;
  newAuthor: string;
  newCategory: string;
  onTextChange: (text: string) => void;
  onAuthorChange: (author: string) => void;
  onCategoryChange: (category: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateQuoteModal({
  variant,
  show,
  newText,
  newAuthor,
  newCategory,
  onTextChange,
  onAuthorChange,
  onCategoryChange,
  onClose,
  onCreate,
}: CreateQuoteModalProps) {
  if (!show) return null;

  return (
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
            onClick={onClose}
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
              onChange={(e) => onTextChange(e.target.value)}
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
              onChange={(e) => onAuthorChange(e.target.value)}
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
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            size={variant === "popup" ? "sm" : "default"}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            size={variant === "popup" ? "sm" : "default"}
            onClick={onCreate}
            disabled={!newText.trim() || !newAuthor.trim()}
            className="font-medium"
          >
            <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
            Create Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
