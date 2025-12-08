/**
 * Quote Action Utilities for React Native
 */

import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Quote } from '@boostlly/core';
import { AndroidStorageService } from '@boostlly/platform-android';

/**
 * Speak a quote using text-to-speech
 */
export async function speakQuote(quote: Quote, storage?: AndroidStorageService) {
  try {
    const text = `"${quote.text}" by ${quote.author}`;
    await Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.8,
    });
  } catch (error) {
    console.error('Failed to speak quote:', error);
  }
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
  Speech.stop();
}

/**
 * Copy quote to clipboard
 */
export async function copyQuote(quote: Quote): Promise<boolean> {
  try {
    const text = `"${quote.text}" — ${quote.author}`;
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Failed to copy quote:', error);
    return false;
  }
}

/**
 * Share quote
 */
export async function shareQuote(quote: Quote): Promise<boolean> {
  try {
    if (await Sharing.isAvailableAsync()) {
      const text = `"${quote.text}" — ${quote.author}`;
      await Sharing.shareAsync({
        message: text,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to share quote:', error);
    return false;
  }
}

/**
 * Save quote as image (simplified for React Native)
 * Note: Full image generation requires canvas, which is complex in RN
 * This is a placeholder that shares the quote text as an image alternative
 */
export async function saveQuoteAsImage(quote: Quote): Promise<boolean> {
  // For React Native, we'll share the quote text formatted nicely
  // Full image generation would require react-native-view-shot or similar
  return shareQuote(quote);
}
