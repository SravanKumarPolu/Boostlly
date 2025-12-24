/**
 * App Footer Component
 * 
 * Provides a consistent footer across all app variants
 * with appropriate information and controls.
 */

import React from 'react';
import { Button } from '@boostlly/ui';
import { Heart, ExternalLink } from 'lucide-react';

interface AppFooterProps {
  variant: 'web' | 'popup';
  onFeedbackClick?: () => void;
  onHelpClick?: () => void;
}

/**
 * App Footer Component
 * 
 * Renders the application footer with appropriate content
 * based on the variant (web vs popup).
 */
export function AppFooter({ 
  variant, 
  onFeedbackClick, 
  onHelpClick 
}: AppFooterProps) {
  if (variant === 'popup') {
    return (
      <footer className="flex items-center justify-center p-3 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          Made with <Heart className="w-3 h-3 inline text-destructive" aria-label="love" /> by Boostlly Team
        </span>
      </footer>
    );
  }

  return (
    <footer role="contentinfo" className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          Made with <Heart className="w-4 h-4 inline text-destructive" aria-label="love" /> by Boostlly Team
        </span>
        <span className="hidden sm:inline text-xs">
          Version 0.1.0
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFeedbackClick}
          className="text-xs"
          aria-label="Provide feedback"
        >
          Feedback
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHelpClick}
          className="text-xs gap-1"
          aria-label="Get help"
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          Help
        </Button>
      </div>
    </footer>
  );
}
