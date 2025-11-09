import { logError, logDebug, logWarning } from "./logger";
// import { dateKeyToSeed } from './date-utils'; // Not used in this file

/**
 * Build Picsum URL for daily background image
 * Uses date seed for consistent daily images
 */
export function buildPicsumUrl(
  seed: string,
  width = 1920,
  height = 1080,
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Get today's Picsum URL
 */
export function getTodayPicsumUrl(width = 1920, height = 1080): string {
  const today = new Date();
  const dateKey = today.toISOString().split("T")[0].replace(/-/g, "");
  return buildPicsumUrl(dateKey, width, height);
}

/**
 * Color palette extracted from image
 */
export interface ColorPalette {
  bg: string; // Background color
  fg: string; // Foreground/text color
  muted: string; // Muted/secondary color
  accent: string; // Accent color
}

/**
 * WCAG contrast ratio calculation
 */
function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Ensure WCAG contrast ratio >= 4.5:1 (AA level)
 * Enhanced version with better color adjustment
 */
export function ensureContrast(
  fg: string,
  bg: string,
): { fg: string; bg: string } {
  const contrast = getContrastRatio(fg, bg);

  if (contrast >= 4.5) {
    return { fg, bg };
  }

  // If contrast is too low, adjust colors intelligently
  const bgRgb = hexToRgb(bg);
  const fgRgb = hexToRgb(fg);

  if (!bgRgb || !fgRgb) {
    // Fallback: flip colors if RGB conversion fails
    return { fg: bg, bg: fg };
  }

  // Calculate luminance to determine which color is darker
  const bgLuminance = getLuminance(bg);
  const fgLuminance = getLuminance(fg);

  if (bgLuminance > fgLuminance) {
    // Background is lighter, make foreground darker
    const adjustedFg = darkenColor(fg, 0.3);
    const newContrast = getContrastRatio(adjustedFg, bg);

    if (newContrast >= 4.5) {
      return { fg: adjustedFg, bg };
    }
  } else {
    // Foreground is lighter, make background darker
    const adjustedBg = darkenColor(bg, 0.3);
    const newContrast = getContrastRatio(fg, adjustedBg);

    if (newContrast >= 4.5) {
      return { fg, bg: adjustedBg };
    }
  }

  // Final fallback: flip colors
  return { fg: bg, bg: fg };
}

/**
 * Get luminance of a color (0-1 scale)
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Darken a color by a specified amount
 */
function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));

  return rgbToHex(newR, newG, newB);
}

/**
 * Extract color palette from image using FastAverageColor
 */
export async function extractPalette(imageUrl: string): Promise<ColorPalette> {
  try {
    // Dynamic import to avoid SSR issues
    const { FastAverageColor } = await import("fast-average-color");
    const fac = new FastAverageColor();

    const result = await fac.getColorAsync(imageUrl, {
      algorithm: "dominant",
      mode: "precision",
    });

    const dominantColor = result.hex;
    const isDark = result.isDark;

    // Generate palette based on dominant color
    const palette = generatePalette(dominantColor, isDark);

    // Ensure proper contrast
    const { fg, bg } = ensureContrast(palette.fg, palette.bg);

    return {
      ...palette,
      fg,
      bg,
    };
  } catch (error) {
    logWarning("Failed to extract colors from image:", { error: error });
    return getFallbackPalette();
  }
}

/**
 * Generate color palette from dominant color
 */
function generatePalette(dominantColor: string, isDark: boolean): ColorPalette {
  const rgb = hexToRgb(dominantColor);
  if (!rgb) return getFallbackPalette();

  const { r, g, b } = rgb;

  // Create variations
  const bg = dominantColor;
  const fg = isDark ? "#ffffff" : "#000000";

  // Create muted color (desaturated version)
  const mutedR = Math.round(r * 0.7 + 128 * 0.3);
  const mutedG = Math.round(g * 0.7 + 128 * 0.3);
  const mutedB = Math.round(b * 0.7 + 128 * 0.3);
  const muted = rgbToHex(mutedR, mutedG, mutedB);

  // Create accent color (slightly different hue)
  const accentR = Math.min(255, Math.round(r * 1.2));
  const accentG = Math.min(255, Math.round(g * 1.1));
  const accentB = Math.min(255, Math.round(b * 0.9));
  const accent = rgbToHex(accentR, accentG, accentB);

  return { bg, fg, muted, accent };
}

/**
 * Fallback palette when color extraction fails
 */
function getFallbackPalette(): ColorPalette {
  return {
    bg: "#667eea",
    fg: "#ffffff",
    muted: "#a8b2d1",
    accent: "#764ba2",
  };
}

/**
 * Derive a primary color from the palette that ensures good contrast
 * Uses accent color but adjusts for better visibility
 */
function derivePrimaryColor(accent: string, bg: string): string {
  const accentRgb = hexToRgb(accent);
  const bgRgb = hexToRgb(bg);
  if (!accentRgb || !bgRgb) return accent;

  // Check if accent has good contrast on background
  const contrast = getContrastRatio(accent, bg);
  
  // If contrast is good (>= 4.5), use accent as-is
  if (contrast >= 4.5) {
    return accent;
  }

  // Otherwise, adjust accent to ensure good contrast
  // Make it darker if background is light, lighter if background is dark
  const bgLuminance = getLuminance(bg);
  const isDarkBg = bgLuminance < 0.5;

  if (isDarkBg) {
    // Lighten the accent for dark backgrounds
    return lightenColor(accent, 0.3);
  } else {
    // Darken the accent for light backgrounds
    return darkenColor(accent, 0.3);
  }
}

/**
 * Lighten a color by a specified amount
 */
function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));

  return rgbToHex(newR, newG, newB);
}

/**
 * Derive card background color - slightly lighter/darker than bg for subtle contrast
 */
function deriveCardColor(bg: string, isDark: boolean): string {
  const bgRgb = hexToRgb(bg);
  if (!bgRgb) return bg;

  const bgLuminance = getLuminance(bg);
  
  // For dark backgrounds, make card slightly lighter
  // For light backgrounds, make card slightly darker
  if (bgLuminance < 0.5) {
    // Dark background - lighten card
    return lightenColor(bg, 0.05);
  } else {
    // Light background - darken card slightly
    return darkenColor(bg, 0.02);
  }
}

/**
 * Get optimal foreground color for a given background
 */
function getOptimalForeground(bg: string): string {
  const bgLuminance = getLuminance(bg);
  // Return white for dark backgrounds, black for light backgrounds
  return bgLuminance < 0.5 ? "#ffffff" : "#000000";
}

/**
 * Apply color palette to CSS variables with automatic contrast computation
 * Enhanced to update --primary, --card, and related variables for buttons and cards
 */
export function applyColorPalette(palette: ColorPalette): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Ensure proper contrast before applying
  const { fg: safeFg, bg: safeBg } = ensureContrast(palette.fg, palette.bg);

  // Derive primary color from accent (for buttons)
  const primaryColor = derivePrimaryColor(palette.accent, safeBg);
  
  // Derive card background color
  const cardBg = deriveCardColor(safeBg, getLuminance(safeBg) < 0.5);
  
  // Get optimal foreground for primary (button text)
  const primaryFg = getOptimalForeground(primaryColor);
  
  // Get optimal foreground for card (card text)
  const cardFg = getOptimalForeground(cardBg);

  // Apply safe colors
  root.style.setProperty("--bg", safeBg);
  root.style.setProperty("--fg", safeFg);
  root.style.setProperty("--muted", palette.muted);
  root.style.setProperty("--accent", palette.accent);

  // Convert all colors to RGB first, then to HSL for Tailwind compatibility
  const bgRgb = hexToRgb(safeBg);
  const fgRgb = hexToRgb(safeFg);
  const primaryRgb = hexToRgb(primaryColor);
  const primaryFgRgb = hexToRgb(primaryFg);
  const cardRgb = hexToRgb(cardBg);
  const cardFgRgb = hexToRgb(cardFg);
  const mutedRgb = hexToRgb(palette.muted);
  const accentRgb = hexToRgb(palette.accent);

  // Set background and foreground - in HSL format for Tailwind
  if (bgRgb) {
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
    root.style.setProperty("--background", `${bgHsl.h} ${bgHsl.s}% ${bgHsl.l}%`);
    root.style.setProperty("--bg-hsl", `${bgHsl.h} ${bgHsl.s}% ${bgHsl.l}%`);
    root.style.setProperty("--background-hsl", `${bgHsl.h} ${bgHsl.s}% ${bgHsl.l}%`);
  }

  if (fgRgb) {
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
    root.style.setProperty("--foreground", `${fgHsl.h} ${fgHsl.s}% ${fgHsl.l}%`);
    root.style.setProperty("--fg-hsl", `${fgHsl.h} ${fgHsl.s}% ${fgHsl.l}%`);
    root.style.setProperty("--foreground-hsl", `${fgHsl.h} ${fgHsl.s}% ${fgHsl.l}%`);
  }

  // Set primary color for buttons (derived from accent) - in HSL format for Tailwind
  if (primaryRgb) {
    const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    root.style.setProperty("--primary", `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    root.style.setProperty("--primary-hsl", `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
  }
  if (primaryFgRgb) {
    const primaryFgHsl = rgbToHsl(primaryFgRgb.r, primaryFgRgb.g, primaryFgRgb.b);
    root.style.setProperty("--primary-foreground", `${primaryFgHsl.h} ${primaryFgHsl.s}% ${primaryFgHsl.l}%`);
  }

  // Set card colors (for cards that overlay the background) - in HSL format for Tailwind
  if (cardRgb) {
    const cardHsl = rgbToHsl(cardRgb.r, cardRgb.g, cardRgb.b);
    root.style.setProperty("--card", `${cardHsl.h} ${cardHsl.s}% ${cardHsl.l}%`);
    root.style.setProperty("--card-hsl", `${cardHsl.h} ${cardHsl.s}% ${cardHsl.l}%`);
  }
  if (cardFgRgb) {
    const cardFgHsl = rgbToHsl(cardFgRgb.r, cardFgRgb.g, cardFgRgb.b);
    root.style.setProperty("--card-foreground", `${cardFgHsl.h} ${cardFgHsl.s}% ${cardFgHsl.l}%`);
  }

  // Set muted and accent colors - in HSL format for Tailwind
  if (mutedRgb) {
    const mutedHsl = rgbToHsl(mutedRgb.r, mutedRgb.g, mutedRgb.b);
    root.style.setProperty("--muted-foreground", `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`);
    root.style.setProperty("--muted-hsl", `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`);
    root.style.setProperty("--muted-foreground-hsl", `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`);
    // Also set muted color (background)
    root.style.setProperty("--muted", `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`);
  }
  
  if (accentRgb) {
    const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
    root.style.setProperty("--accent", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
    root.style.setProperty("--accent-hsl", `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
  }

  // Set border color - ensure good contrast with background
  // Border should be visible but not too harsh
  if (bgRgb && fgRgb) {
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
    
    // Calculate border color that has good contrast with background
    // For light backgrounds, use darker borders; for dark backgrounds, use lighter borders
    let borderLightness: number;
    if (bgHsl.l > 70) {
      // Light background - use darker border (30-40% lightness)
      borderLightness = 35;
    } else if (bgHsl.l < 30) {
      // Dark background - use lighter border (60-70% lightness)
      borderLightness = 65;
    } else {
      // Medium background - use mid-tone border
      borderLightness = bgHsl.l > 50 ? 40 : 60;
    }
    
    // Use similar hue to foreground but with adjusted lightness
    root.style.setProperty("--border", `${fgHsl.h} ${Math.min(30, fgHsl.s)}% ${borderLightness}%`);
    root.style.setProperty("--input", `${fgHsl.h} ${Math.min(30, fgHsl.s)}% ${borderLightness}%`);
  }

  // Compute and apply contrast ratios
  const contrastRatio = getContrastRatio(safeFg, safeBg);
  const primaryContrast = getContrastRatio(primaryFg, primaryColor);
  const cardContrast = getContrastRatio(cardFg, cardBg);
  
  root.style.setProperty("--contrast-ratio", contrastRatio.toString());
  root.style.setProperty("--primary-contrast", primaryContrast.toString());
  root.style.setProperty("--card-contrast", cardContrast.toString());

  // Set contrast compliance indicators
  root.style.setProperty("--contrast-aa", (contrastRatio >= 4.5).toString());
  root.style.setProperty("--contrast-aaa", (contrastRatio >= 7.0).toString());
  root.style.setProperty("--primary-contrast-aa", (primaryContrast >= 4.5).toString());
  root.style.setProperty("--card-contrast-aa", (cardContrast >= 4.5).toString());

  // Set additional accessibility variables
  setAccessibilityVariables(safeFg, safeBg, palette.accent, primaryColor, cardBg);
}

/**
 * Set additional accessibility-related CSS variables
 */
function setAccessibilityVariables(
  fg: string,
  bg: string,
  accent: string,
  primary: string,
  card: string,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Focus ring colors with proper contrast (use primary for buttons) - in HSL format
  const primaryRgb = hexToRgb(primary);
  if (primaryRgb) {
    const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    // Ring color should match primary for consistency
    root.style.setProperty("--ring", `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    
    // Focus ring color with better contrast
    const focusRingColor = ensureContrast(primary, bg).fg;
    const focusRingRgb = hexToRgb(focusRingColor);
    if (focusRingRgb) {
      const focusRingHsl = rgbToHsl(focusRingRgb.r, focusRingRgb.g, focusRingRgb.b);
      root.style.setProperty("--focus-ring-color", `${focusRingHsl.h} ${focusRingHsl.s}% ${focusRingHsl.l}%`);
    }
  }

  // High contrast mode support
  const highContrastFg = getContrastRatio(fg, bg) < 7.0 ? "#ffffff" : fg;
  const highContrastBg = getContrastRatio(fg, bg) < 7.0 ? "#000000" : bg;
  root.style.setProperty("--high-contrast-fg", highContrastFg);
  root.style.setProperty("--high-contrast-bg", highContrastBg);

  // Button contrast variants - ensure buttons have proper contrast
  // Note: Primary and primary-foreground are already set in applyColorPalette
  // This is just for additional button-specific variables if needed
  const primaryFg = getOptimalForeground(primary);
  const primaryContrast = getContrastRatio(primaryFg, primary);
  
  // Set button-specific variables in HSL format
  if (primaryContrast >= 4.5) {
    const primaryFgRgb = hexToRgb(primaryFg);
    const primaryRgb = hexToRgb(primary);
    if (primaryFgRgb && primaryRgb) {
      const primaryFgHsl = rgbToHsl(primaryFgRgb.r, primaryFgRgb.g, primaryFgRgb.b);
      const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      root.style.setProperty("--button-fg-hsl", `${primaryFgHsl.h} ${primaryFgHsl.s}% ${primaryFgHsl.l}%`);
      root.style.setProperty("--button-bg-hsl", `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    }
  }

  // Card button contrast - buttons inside cards need to contrast with card background
  // Derive button colors that work well on card background (not page background)
  const cardFg = getOptimalForeground(card);
  const cardLuminance = getLuminance(card);
  const isDarkCard = cardLuminance < 0.5;
  
  // For buttons inside cards, use the primary color but ensure it contrasts with card
  // If primary doesn't contrast well with card, adjust it
  const primaryOnCardContrast = getContrastRatio(primary, card);
  
  let cardButtonBg = primary;
  if (primaryOnCardContrast < 4.5) {
    // Primary doesn't contrast well with card, derive a better color
    // For dark cards, use a lighter version of primary
    // For light cards, use a darker version of primary
    if (isDarkCard) {
      cardButtonBg = lightenColor(primary, 0.4);
    } else {
      cardButtonBg = darkenColor(primary, 0.4);
    }
    
    // Ensure the adjusted color still contrasts well
    const adjustedContrast = getContrastRatio(cardButtonBg, card);
    if (adjustedContrast < 4.5) {
      // If still not enough contrast, use a more contrasting color
      cardButtonBg = isDarkCard ? "#ffffff" : "#000000";
    }
  }
  
  // Get optimal foreground for button (text color on button)
  const cardButtonFg = getOptimalForeground(cardButtonBg);
  
  const cardButtonBgRgb = hexToRgb(cardButtonBg);
  const cardButtonFgRgb = hexToRgb(cardButtonFg);
  
  if (cardButtonBgRgb && cardButtonFgRgb) {
    const cardButtonBgHsl = rgbToHsl(cardButtonBgRgb.r, cardButtonBgRgb.g, cardButtonBgRgb.b);
    const cardButtonFgHsl = rgbToHsl(cardButtonFgRgb.r, cardButtonFgRgb.g, cardButtonFgRgb.b);
    root.style.setProperty("--card-button-bg-hsl", `${cardButtonBgHsl.h} ${cardButtonBgHsl.s}% ${cardButtonBgHsl.l}%`);
    root.style.setProperty("--card-button-fg-hsl", `${cardButtonFgHsl.h} ${cardButtonFgHsl.s}% ${cardButtonFgHsl.l}%`);
  }
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Create gradient fallback based on date hash
 */
export function createGradientFallback(seed: string): string {
  // Use seed to create deterministic gradient
  const hash = seed.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 70%, 30%) 100%)`;
}
