/**
 * Quote Actions Utilities
 * 
 * Utility functions for quote-related actions like speaking, saving as image, etc.
 */

import { downloadImage, generateQuoteImage, logError } from '@boostlly/core';
import { SavedQuote, StorageLike } from '../types';

/**
 * Speak a quote using text-to-speech
 */
export async function speakQuote(
  q: SavedQuote,
  storage: StorageLike | null
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    // Respect stored settings if available
    const enabled = await (storage as any)?.get?.("textToSpeech");
    if (enabled === false) return;
    const rate = (await (storage as any)?.get?.("speechRate")) ?? 0.8;
    const volumePct = (await (storage as any)?.get?.("speechVolume")) ?? 80;
    const utter = new SpeechSynthesisUtterance(`"${q.text}" by ${q.author}`);
    utter.rate = typeof rate === "number" ? rate : 0.8;
    utter.volume = Math.max(
      0,
      Math.min(1, (typeof volumePct === "number" ? volumePct : 80) / 100),
    );
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch (error) {
    logError("Failed to speak quote:", { error });
  }
}

/**
 * Save a quote as an image
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
