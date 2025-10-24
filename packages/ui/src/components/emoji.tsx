
import React, { useState, useEffect } from 'react';

interface EmojiProps {
  emoji: string;
  fallback?: string;
  className?: string;
}

// Emoji fallback component for better cross-platform support
export const Emoji = ({ emoji, fallback, className = "" }: EmojiProps) => {
  const [showFallback, setShowFallback] = useState(false);
  
  useEffect(() => {
    // Test if emoji renders properly
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '16px Arial';
      const width = ctx.measureText(emoji).width;
      
      // If width is very small, emoji might not be supported
      if (width < 10) {
        setShowFallback(true);
      }
    }
  }, [emoji]);
  
  if (showFallback && fallback) {
    return <span className={`emoji-fallback emoji-${fallback} ${className}`} />;
  }
  
  return <span className={`emoji ${className}`}>{emoji}</span>;
};
