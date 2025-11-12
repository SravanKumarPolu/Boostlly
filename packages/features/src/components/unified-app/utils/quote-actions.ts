/**
 * Quote Actions Utilities
 * 
 * Utility functions for quote-related actions like speaking, saving as image, etc.
 */

import { downloadImage, generateQuoteImage, logError, UserAnalyticsService } from '@boostlly/core';
import { SavedQuote, StorageLike } from '../types';

/**
 * Speak a quote using text-to-speech
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
    
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(`"${q.text}" by ${q.author}`);
    
    // Select best available voice for quality
    // Ensure voices are loaded (they load asynchronously)
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Wait a bit for voices to load, then try again
      await new Promise(resolve => setTimeout(resolve, 100));
      voices = window.speechSynthesis.getVoices();
    }
    
    const getBestVoice = () => {
      if (voices.length === 0) return null;
      
      // Priority: Neural/Premium > Natural > US English > Any English
      const neural = voices.find(v => 
        v.name.toLowerCase().includes("neural") || 
        v.name.toLowerCase().includes("premium") ||
        v.name.toLowerCase().includes("enhanced")
      );
      if (neural) return neural;
      
      const natural = voices.find(v => 
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("zira")
      );
      if (natural) return natural;
      
      const usEnglish = voices.find(v => v.lang.startsWith("en-US"));
      if (usEnglish) return usEnglish;
      
      const english = voices.find(v => v.lang.startsWith("en"));
      if (english) return english;
      
      return voices[0] || null;
    };
    
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utter.voice = bestVoice;
      utter.lang = bestVoice.lang;
    } else {
      utter.lang = "en-US";
    }
    
    // Use optimal settings for natural, clear speech
    utter.rate = typeof rate === "number" ? Math.max(0.5, Math.min(2, rate)) : 1.0;
    utter.volume = Math.max(0, Math.min(1, (typeof volumePct === "number" ? volumePct : 90) / 100));
    utter.pitch = 1.0; // Neutral pitch for clarity
    
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
