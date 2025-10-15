import { logError, logDebug, logWarning } from "../utils/logger";
import { useState, useEffect, useCallback } from "react";
import { getDateKey, dateKeyToSeed } from "../utils/date-utils";
import {
  buildPicsumUrl,
  extractPalette,
  applyColorPalette,
  ColorPalette,
} from "../utils/background-theme";

export interface AutoThemeState {
  imageUrl: string | null;
  palette: ColorPalette | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

/**
 * Hook for automatic theming based on daily background images
 * Loads Picsum images and extracts color palettes
 */
export function useAutoTheme() {
  const [state, setState] = useState<AutoThemeState>({
    imageUrl: null,
    palette: null,
    isLoading: true,
    isAnalyzing: false,
    error: null,
  });

  /**
   * Load image and extract colors
   */
  const loadImage = useCallback(async (imageUrl: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      isAnalyzing: true,
      error: null,
    }));

    try {
      // Create image element to preload
      const img = new Image();

      // Don't set crossOrigin to avoid CORS issues with Picsum
      // img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      logDebug("AutoTheme: Image loaded successfully", { imageUrl });

      // Extract color palette (optional - don't fail if this doesn't work)
      let palette = null;
      try {
        palette = await extractPalette(imageUrl);
        applyColorPalette(palette);
        logDebug("AutoTheme: Color palette extracted", { palette });
      } catch (colorError) {
        logWarning(
          "AutoTheme: Color extraction failed, continuing without palette",
          { error: colorError },
        );
        // Don't fail the whole process if color extraction fails
      }

      setState((prev) => ({
        ...prev,
        imageUrl,
        palette,
        isLoading: false,
        isAnalyzing: false,
        error: null,
      }));
    } catch (error) {
      logWarning(
        "AutoTheme: Image loading failed, but URL set for browser to handle",
        { error },
      );
      // Still set the imageUrl so the browser can handle it
      setState((prev) => ({
        ...prev,
        imageUrl,
        palette: null,
        isLoading: false,
        isAnalyzing: false,
        error: "Image loading failed, but URL set for browser to handle",
      }));
    }
  }, []);

  /**
   * Load today's image
   */
  const loadTodayImage = useCallback(() => {
    const dateKey = getDateKey();
    const seed = dateKeyToSeed(dateKey);
    const imageUrl = buildPicsumUrl(seed);
    logDebug("AutoTheme: Loading today's image", {
      dateKey,
      seed,
      imageUrl,
    });
    loadImage(imageUrl);
  }, [loadImage]);

  /**
   * Load image for specific date
   */
  const loadImageForDate = useCallback(
    (date: Date) => {
      const dateKey = getDateKey(date);
      const seed = dateKeyToSeed(dateKey);
      const imageUrl = buildPicsumUrl(seed);
      logDebug("AutoTheme: Loading image for date", {
        date,
        dateKey,
        seed,
        imageUrl,
      });
      loadImage(imageUrl);
    },
    [loadImage],
  );

  /**
   * Load image on mount
   */
  useEffect(() => {
    loadTodayImage();
  }, [loadTodayImage]);

  return {
    ...state,
    loadTodayImage,
    loadImageForDate,
    loadImage,
  };
}
