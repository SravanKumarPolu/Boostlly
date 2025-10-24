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
      <footer className="flex items-center justify-center p-2 border-t bg-muted/50">
        <span className="text-xs text-muted-foreground">
          Made with <Heart className="w-3 h-3 inline mx-1" /> by Boostlly Team
        </span>
      </footer>
    );
  }

  return (
    <footer className="flex items-center justify-between p-4 border-t bg-muted/50">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Made with <Heart className="w-4 h-4 inline mx-1" /> by Boostlly Team
        </span>
        <span className="text-xs text-muted-foreground">
          Version 0.1.0
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFeedbackClick}
        >
          Feedback
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHelpClick}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Help
        </Button>
      </div>
    </footer>
  );
}
