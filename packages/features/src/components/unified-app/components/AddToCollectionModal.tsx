/**
 * Add to Collection Modal Component
 * 
 * Modal for adding quotes to collections
 */

import React from 'react';
import { X } from 'lucide-react';
import { Variant, SavedQuote } from '../types';

interface AddToCollectionModalProps {
  variant: Variant;
  show: boolean;
  collections: any[];
  selectedQuote: SavedQuote | null;
  collectionService: any;
  onClose: () => void;
  onAdd: (collectionId: string, quoteId: string) => Promise<void>;
}

export function AddToCollectionModal({
  variant,
  show,
  collections,
  selectedQuote,
  collectionService,
  onClose,
  onAdd,
}: AddToCollectionModalProps) {
  if (!show || !selectedQuote) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="w-full max-w-sm p-4 rounded-xl border border-border bg-card backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Add to Collection
          </h3>
          <button
            onClick={onClose}
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
                  await onAdd(collection.id, selectedQuote.id);
                  onClose();
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
  );
}
