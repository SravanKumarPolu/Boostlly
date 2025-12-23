/**
 * Quote Actions Utilities
 * 
 * Utility functions for quote-related actions like speaking, saving as image, etc.
 */

import { 
  downloadImage, 
  generateQuoteImage, 
  generateEnhancedQuoteImage,
  logError, 
  UserAnalyticsService, 
  accessibleTTS,
  type EnhancedQuoteImageOptions,
} from '@boostlly/core';
import { SavedQuote, StorageLike } from '../types';

/**
 * Speak a quote using text-to-speech
 * Now uses AccessibleTTS which properly waits for voices to be ready
 */
export async function speakQuote(
  q: SavedQuote,
  storage: StorageLike | null
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  
  // Track read button click
  if (storage) {
    try {
      const analyticsService = new UserAnalyticsService(storage as any);
      analyticsService.trackReadButtonClick().catch((error) => {
        console.error("Failed to track read button click:", error);
      });
    } catch (error) {
      console.error("Failed to initialize analytics service for read tracking:", error);
    }
  }
  
  try {
    // Respect stored settings if available
    const enabled = await (storage as any)?.get?.("textToSpeech");
    if (enabled === false) return;
    const rate = (await (storage as any)?.get?.("speechRate")) ?? 1.0;
    const volumePct = (await (storage as any)?.get?.("speechVolume")) ?? 90;
    
    // Use AccessibleTTS which properly waits for voices to be ready
    await accessibleTTS.speak(`"${q.text}" by ${q.author}`, {
      rate: typeof rate === "number" ? Math.max(0.5, Math.min(2, rate)) : 1.0,
      volume: Math.max(0, Math.min(1, (typeof volumePct === "number" ? volumePct : 90) / 100)),
      pitch: 1.0, // Neutral pitch for clarity
      onError: (error) => {
        logError("Failed to speak quote:", { error });
      },
    });
  } catch (error) {
    logError("Failed to speak quote:", { error });
  }
}

/**
 * Save a quote as an image (basic)
 */
export async function saveQuoteAsImage(q: SavedQuote): Promise<void> {
  try {
    const dataUrl = await generateQuoteImage(q.text, q.author);
    const filename = `boostlly-quote-${q.id}-${Date.now()}.png`;
    downloadImage(dataUrl, filename);
  } catch (error) {
    logError("Failed to generate image:", { error: error });
  }
}

/**
 * Save a quote as an enhanced image with customization options
 */
export async function saveQuoteAsEnhancedImage(
  q: SavedQuote,
  options?: EnhancedQuoteImageOptions
): Promise<void> {
  try {
    const defaultOptions: EnhancedQuoteImageOptions = {
      width: 1200,
      height: 800,
      backgroundType: "gradient",
      gradientPreset: "purple-blue",
      textColor: "#ffffff",
      fontSize: 32,
      fontFamily: "sans-serif",
      fontWeight: "600",
      showLogo: true,
      watermark: {
        enabled: true,
        text: "Boostlly",
        position: "bottom-right",
        opacity: 0.3,
      },
      ...options,
    };

    const dataUrl = await generateEnhancedQuoteImage(q.text, q.author, defaultOptions);
    const filename = `boostlly-quote-${q.id}-${Date.now()}.png`;
    downloadImage(dataUrl, filename);
  } catch (error) {
    logError("Failed to generate enhanced image:", { error: error });
  }
}

/**
 * Generate a unique ID for quotes
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Share a quote using Web Share API or clipboard fallback
 */
export async function shareQuote(q: SavedQuote): Promise<void> {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Boostlly Quote",
        text: `"${q.text}" — ${q.author}`,
        url: window.location.href,
      });
    } else {
      const textToShare = `"${q.text}" — ${q.author}`;
      await navigator.clipboard.writeText(textToShare);
    }
  } catch (error) {
    logError("Failed to share quote:", { error });
  }
}
