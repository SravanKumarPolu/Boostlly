/**
 * Unified Quote Card Component
 * 
 * A consolidated quote card component that replaces multiple similar components
 * with a single, highly configurable component that handles all quote display needs.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Heart, Share2, Download, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { BaseComponent, useBaseComponent, ComponentUtils } from './unified-component';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '../lib/utils';

/**
 * Quote card variant types
 */
export type QuoteCardVariant = 
  | 'default' 
  | 'minimal' 
  | 'detailed' 
  | 'compact' 
  | 'featured' 
  | 'grid';

/**
 * Quote card size types
 */
export type QuoteCardSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Quote card interaction types
 */
export type QuoteCardInteraction = 
  | 'like' 
  | 'share' 
  | 'download' 
  | 'speak' 
  | 'copy' 
  | 'save' 
  | 'add-to-collection';

/**
 * Quote card props interface
 */
export interface QuoteCardProps {
  quote: {
    id: string;
    text: string;
    author: string;
    category?: string;
    tags?: string[];
    source?: string;
    imageUrl?: string;
  };
  variant?: QuoteCardVariant;
  size?: QuoteCardSize;
  showActions?: boolean;
  showMetadata?: boolean;
  showSource?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  enableAnimations?: boolean;
  enableHoverEffects?: boolean;
  enableSound?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  isPlaying?: boolean;
  className?: string;
  onLike?: (quote: any) => void;
  onShare?: (quote: any) => void;
  onDownload?: (quote: any) => void;
  onSpeak?: (quote: any) => void;
  onCopy?: (quote: any) => void;
  onSave?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
  onRemove?: (quote: any) => void;
  testId?: string;
}

/**
 * Unified Quote Card Component
 * 
 * This component consolidates multiple quote display components into a single,
 * highly configurable component that can handle all quote display needs.
 */
export function UnifiedQuoteCard({
  quote,
  variant = 'default',
  size = 'md',
  showActions = true,
  showMetadata = true,
  showSource = false,
  showCategory = true,
  showTags = false,
  enableAnimations = true,
  enableHoverEffects = true,
  enableSound = true,
  isLiked = false,
  isSaved = false,
  isPlaying = false,
  className,
  onLike,
  onShare,
  onDownload,
  onSpeak,
  onCopy,
  onSave,
  onAddToCollection,
  onRemove,
  testId,
}: QuoteCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    state,
    classNames,
    accessibilityProps,
    eventHandlers,
    measurePerformance,
  } = useBaseComponent(
    {
      className,
      testId,
    },
    {
      enableAnimations,
      enableHoverEffects,
      enableAccessibility: true,
      enableFocusManagement: true,
    }
  );

  // Generate component-specific class names
  const cardClasses = useMemo(() => {
    const baseClasses = [
      'relative',
      'bg-card',
      'border',
      'border-border',
      'rounded-xl',
      'shadow-sm',
      'transition-all',
      'duration-200',
      'ease-out',
    ];

    const variantClasses = {
      default: 'p-6',
      minimal: 'p-4',
      detailed: 'p-8',
      compact: 'p-4',
      featured: 'p-8 border-2 border-primary/30 bg-primary/5 shadow-md',
      grid: 'p-6 aspect-square flex flex-col justify-center',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const stateClasses = [
      isHovered && enableHoverEffects && 'shadow-md hover:shadow-lg -translate-y-1 border-border/80',
      isLiked && 'border-destructive/30 bg-destructive/5',
      isSaved && 'border-primary/30 bg-primary/5',
      isPlaying && 'border-accent/30 bg-accent/5',
    ].filter(Boolean);

    return cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      stateClasses,
      className
    );
  }, [variant, size, isHovered, isLiked, isSaved, isPlaying, enableHoverEffects, className]);

  // Generate animation classes
  const animationClasses = useMemo(() => {
    if (!enableAnimations) return '';
    return ComponentUtils.createAnimationClasses(enableAnimations, 'fade');
  }, [enableAnimations]);

  // Handle interactions
  const handleInteraction = useCallback(
    (interaction: QuoteCardInteraction, callback?: (quote: any) => void) => {
      measurePerformance(`QuoteCard.${interaction}`, () => {
        if (callback) {
          callback(quote);
        }
      });
    },
    [quote, measurePerformance]
  );

  const handleLike = useCallback(() => {
    handleInteraction('like', onLike);
  }, [handleInteraction, onLike]);

  const handleShare = useCallback(() => {
    handleInteraction('share', onShare);
  }, [handleInteraction, onShare]);

  const handleDownload = useCallback(() => {
    handleInteraction('download', onDownload);
  }, [handleInteraction, onDownload]);

  const handleSpeak = useCallback(() => {
    handleInteraction('speak', onSpeak);
  }, [handleInteraction, onSpeak]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(quote.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      handleInteraction('copy', onCopy);
    } catch (error) {
      console.error('Failed to copy quote:', error);
    }
  }, [quote.text, handleInteraction, onCopy]);

  const handleSave = useCallback(() => {
    handleInteraction('save', onSave);
  }, [handleInteraction, onSave]);

  const handleAddToCollection = useCallback(() => {
    handleInteraction('add-to-collection', onAddToCollection);
  }, [handleInteraction, onAddToCollection]);

  const handleRemove = useCallback(() => {
    handleInteraction('save', onRemove);
  }, [handleInteraction, onRemove]);

  // Render quote content based on variant
  const renderQuoteContent = useCallback(() => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="space-y-2">
            <p className="font-medium text-card-foreground leading-relaxed">{quote.text}</p>
            {quote.author && (
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            )}
          </div>
        );
      
      case 'detailed':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-card-foreground leading-relaxed">
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {quote.author && (
                  <p className="font-medium text-card-foreground">— {quote.author}</p>
                )}
                {showCategory && quote.category && (
                  <Badge variant="secondary" className="text-xs">
                    {quote.category}
                  </Badge>
                )}
              </div>
              {showSource && quote.source && (
                <Badge variant="outline" className="text-xs">
                  {quote.source}
                </Badge>
              )}
            </div>
            {showTags && quote.tags && quote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quote.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'compact':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-relaxed">
              {quote.text}
            </p>
            {quote.author && (
              <p className="text-xs text-muted-foreground">— {quote.author}</p>
            )}
          </div>
        );
      
      case 'featured':
        return (
          <div className="space-y-4">
            <p className="text-xl font-semibold text-card-foreground leading-relaxed">
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {quote.author && (
                  <p className="font-semibold text-card-foreground">— {quote.author}</p>
                )}
                {showCategory && quote.category && (
                  <Badge variant="secondary" className="text-sm">
                    {quote.category}
                  </Badge>
                )}
              </div>
              {showSource && quote.source && (
                <Badge variant="outline" className="text-sm">
                  {quote.source}
                </Badge>
              )}
            </div>
          </div>
        );
      
      case 'grid':
        return (
          <div className="space-y-3 text-center">
            <p className="font-medium text-card-foreground leading-relaxed">
              {quote.text}
            </p>
            {quote.author && (
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            )}
            {showCategory && quote.category && (
              <Badge variant="secondary" className="text-xs">
                {quote.category}
              </Badge>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            <p className="font-medium text-card-foreground leading-relaxed">
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {quote.author && (
                  <p className="text-sm text-muted-foreground">— {quote.author}</p>
                )}
                {showCategory && quote.category && (
                  <Badge variant="secondary" className="text-xs">
                    {quote.category}
                  </Badge>
                )}
              </div>
              {showSource && quote.source && (
                <Badge variant="outline" className="text-xs">
                  {quote.source}
                </Badge>
              )}
            </div>
          </div>
        );
    }
  }, [variant, quote, showCategory, showSource, showTags]);

  // Render action buttons
  const renderActions = useCallback(() => {
    if (!showActions) return null;

    const actions = [
      onLike && {
        icon: Heart,
        label: isLiked ? 'Unlike' : 'Like',
        onClick: handleLike,
        variant: isLiked ? 'destructive' : 'outline' as const,
        className: isLiked ? '' : '',
      },
      onSpeak && {
        icon: isPlaying ? VolumeX : Volume2,
        label: isPlaying ? 'Stop' : 'Speak',
        onClick: handleSpeak,
        variant: isPlaying ? 'default' : 'outline' as const,
        className: '',
      },
      onCopy && {
        icon: isCopied ? Check : Copy,
        label: isCopied ? 'Copied' : 'Copy',
        onClick: handleCopy,
        variant: isCopied ? 'success' : 'outline' as const,
        className: '',
      },
      onShare && {
        icon: Share2,
        label: 'Share',
        onClick: handleShare,
        variant: 'outline' as const,
      },
      onDownload && {
        icon: Download,
        label: 'Download',
        onClick: handleDownload,
        variant: 'outline' as const,
      },
      onSave && {
        icon: isSaved ? Heart : Heart,
        label: isSaved ? 'Saved' : 'Save',
        onClick: handleSave,
        variant: isSaved ? 'success' : 'outline' as const,
        className: '',
      },
      onAddToCollection && {
        icon: Heart,
        label: 'Add to Collection',
        onClick: handleAddToCollection,
        variant: 'outline' as const,
      },
      onRemove && {
        icon: Heart,
        label: 'Remove',
        onClick: handleRemove,
        variant: 'destructive' as const,
      },
    ].filter(Boolean);

    if (actions.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/50">
        {actions.map((action, index) => (
          <Button
            key={index}
            size="sm"
            variant={action?.variant as any}
            onClick={action?.onClick}
            className={cn('flex items-center gap-2', action?.className)}
            title={action?.label}
            aria-label={action?.label}
          >
            {action?.icon && <action.icon className="w-4 h-4" aria-hidden="true" />}
            {variant !== 'compact' && (
              <span className="text-xs">{action?.label}</span>
            )}
          </Button>
        ))}
      </div>
    );
  }, [
    showActions,
    onLike,
    onSpeak,
    onCopy,
    onShare,
    onDownload,
    onSave,
    onAddToCollection,
    onRemove,
    isLiked,
    isPlaying,
    isCopied,
    isSaved,
    variant,
    handleLike,
    handleSpeak,
    handleCopy,
    handleShare,
    handleDownload,
    handleSave,
    handleAddToCollection,
    handleRemove,
  ]);

  return (
    <div
      className={cn(cardClasses, animationClasses)}
      data-testid={testId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...accessibilityProps}
    >
      {renderQuoteContent()}
      {renderActions()}
    </div>
  );
}

/**
 * Quote card grid component for displaying multiple quotes
 */
export function QuoteCardGrid({
  quotes,
  variant = 'default',
  size = 'md',
  columns = 3,
  gap = 4,
  className,
  ...props
}: {
  quotes: any[];
  variant?: QuoteCardVariant;
  size?: QuoteCardSize;
  columns?: number;
  gap?: number;
  className?: string;
} & Omit<QuoteCardProps, 'quote'>) {
  const gridClasses = useMemo(() => {
    const baseClasses = 'grid';
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };
    const gapClasses = {
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
    };

    return cn(
      baseClasses,
      columnClasses[columns as keyof typeof columnClasses] || 'grid-cols-3',
      gapClasses[gap as keyof typeof gapClasses] || 'gap-4',
      className
    );
  }, [columns, gap, className]);

  return (
    <div className={gridClasses}>
      {quotes.map((quote, index) => (
        <UnifiedQuoteCard
          key={quote.id || index}
          quote={quote}
          variant={variant}
          size={size}
          {...props}
        />
      ))}
    </div>
  );
}

/**
 * Quote card list component for displaying quotes in a list
 */
export function QuoteCardList({
  quotes,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: {
  quotes: any[];
  variant?: QuoteCardVariant;
  size?: QuoteCardSize;
  className?: string;
} & Omit<QuoteCardProps, 'quote'>) {
  return (
    <div className={cn('space-y-4', className)}>
      {quotes.map((quote, index) => (
        <UnifiedQuoteCard
          key={quote.id || index}
          quote={quote}
          variant={variant}
          size={size}
          {...props}
        />
      ))}
    </div>
  );
}
