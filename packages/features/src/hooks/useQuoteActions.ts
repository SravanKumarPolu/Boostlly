import { useCallback, useState } from "react";
import {
  generateQuoteImage,
  downloadImage,
  logError,
  logDebug,
  logWarning,
  accessibleTTS,
} from "@boostlly/core";

/**
 * Interface for quote action callbacks
 */
export interface QuoteActionCallbacks {
  onRemoveQuote?: (id: string) => void;
  onSpeakQuote?: (quote: any) => void;
  onSaveAsImage?: (quote: any) => void;
  onAddToCollection?: (quote: any) => void;
  onShareQuote?: (quote: any) => void;
}

/**
 * Interface for quote action state
 */
export interface QuoteActionState {
  isGeneratingImage: boolean;
  isSpeaking: boolean;
  isRemoving: boolean;
  isAddingToCollection: boolean;
}

/**
 * Custom hook for managing quote-related actions
 *
 * @param callbacks - Object containing callback functions for quote actions
 * @returns Object containing action methods and state
 *
 * @example
 * ```tsx
 * const {
 *   handleSpeakQuote,
 *   handleSaveAsImage,
 *   handleRemoveQuote,
 *   handleAddToCollection,
 *   isGeneratingImage,
 *   isSpeaking
 * } = useQuoteActions({
 *   onSpeakQuote: (quote) => logDebug('Speaking:', { quote: quote }),
 *   onRemoveQuote: (id) => logDebug('Removing:', { id: id })
 * });
 * ```
 */
export function useQuoteActions(callbacks: QuoteActionCallbacks = {}) {
  const [state, setState] = useState<QuoteActionState>({
    isGeneratingImage: false,
    isSpeaking: false,
    isRemoving: false,
    isAddingToCollection: false,
  });

  /**
   * Handles text-to-speech for a quote
   * Now uses AccessibleTTS which properly handles voice loading for desktop browsers
   *
   * @param quote - The quote object to speak
   */
  const handleSpeakQuote = useCallback(
    async (quote: any) => {
      if (!quote?.text) return;

      setState((prev) => ({ ...prev, isSpeaking: true }));

      try {
        // Check if speech synthesis is supported
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          throw new Error("Speech synthesis not supported");
        }

        // Use AccessibleTTS which properly waits for voices to be ready
        // The button click provides user interaction context needed for desktop browsers
        const textToSpeak = quote.author 
          ? `"${quote.text}" by ${quote.author}`
          : `"${quote.text}"`;

        await accessibleTTS.speak(textToSpeak, {
          rate: 0.8,
          volume: 0.8,
          pitch: 1.0,
          onStart: () => {
            setState((prev) => ({ ...prev, isSpeaking: true }));
          },
          onEnd: () => {
            setState((prev) => ({ ...prev, isSpeaking: false }));
            // Call callback if provided
            callbacks.onSpeakQuote?.(quote);
          },
          onError: (error) => {
            logError("Error speaking quote:", { error });
            setState((prev) => ({ ...prev, isSpeaking: false }));
          },
        });
      } catch (error) {
        logError("Error speaking quote:", { error: error });
        setState((prev) => ({ ...prev, isSpeaking: false }));
      }
    },
    [callbacks],
  );

  /**
   * Handles saving a quote as an image
   *
   * @param quote - The quote object to save as image
   */
  const handleSaveAsImage = useCallback(
    async (quote: any) => {
      if (!quote?.text || !quote?.author) return;

      setState((prev) => ({ ...prev, isGeneratingImage: true }));

      try {
        // Generate quote image
        const imageDataUrl = await generateQuoteImage(
          quote.text,
          quote.author,
          {
            width: 1200,
            height: 630,
          },
        );

        // Create download link
        const link = document.createElement("a");
        link.href = imageDataUrl;
        link.download = `quote-${Date.now()}.png`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Call callback if provided
        callbacks.onSaveAsImage?.(quote);
      } catch (error) {
        logError("Error generating quote image:", { error: error });
      } finally {
        setState((prev) => ({ ...prev, isGeneratingImage: false }));
      }
    },
    [callbacks],
  );

  /**
   * Handles removing a quote
   *
   * @param quoteId - The ID of the quote to remove
   */
  const handleRemoveQuote = useCallback(
    async (quoteId: string) => {
      if (!quoteId) return;

      setState((prev) => ({ ...prev, isRemoving: true }));

      try {
        // Call callback if provided
        callbacks.onRemoveQuote?.(quoteId);
      } catch (error) {
        logError("Error removing quote:", { error: error });
      } finally {
        setState((prev) => ({ ...prev, isRemoving: false }));
      }
    },
    [callbacks],
  );

  /**
   * Handles adding a quote to a collection
   *
   * @param quote - The quote object to add to collection
   * @param collectionId - The ID of the collection to add to
   */
  const handleAddToCollection = useCallback(
    async (quote: any, collectionId?: string) => {
      if (!quote) return;

      setState((prev) => ({ ...prev, isAddingToCollection: true }));

      try {
        // Call callback if provided
        callbacks.onAddToCollection?.(quote);
      } catch (error) {
        logError("Error adding quote to collection:", { error: error });
      } finally {
        setState((prev) => ({ ...prev, isAddingToCollection: false }));
      }
    },
    [callbacks],
  );

  /**
   * Stops any ongoing speech synthesis
   */
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setState((prev) => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  /**
   * Shares a quote using the Web Share API or clipboard fallback
   *
   * @param quote - The quote object to share
   */
  const handleShareQuote = useCallback(async (quote: any) => {
    if (!quote?.text || !quote?.author) return;

    const shareText = `"${quote.text}" - ${quote.author}`;

    try {
      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: "Motivational Quote",
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);

        // Show a temporary notification
        const notification = document.createElement("div");
        notification.textContent = "Quote copied to clipboard!";
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-family: system-ui, sans-serif;
          `;
        document.body.appendChild(notification);

        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      }
    } catch (error) {
      logError("Error sharing quote:", { error: error });
    }
  }, []);

  return {
    // Action methods
    handleSpeakQuote,
    handleSaveAsImage,
    handleRemoveQuote,
    handleAddToCollection,
    handleShareQuote,
    stopSpeaking,

    // State
    ...state,
  };
}
