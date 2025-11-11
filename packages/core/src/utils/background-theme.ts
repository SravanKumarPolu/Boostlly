import { logError, logDebug, logWarning } from "./logger";

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
 * Returns the contrast ratio between two colors (1.0 to 21.0)
 * WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text
 * WCAG 2.1 AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
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

  if (darkest === 0) return 21.0; // Maximum contrast ratio
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * WCAG 2.1 contrast level standards
 */
export enum ContrastLevel {
  FAIL = 0,
  AA_LARGE = 3.0,      // WCAG AA for large text (18pt+ or 14pt+ bold)
  AA_NORMAL = 4.5,     // WCAG AA for normal text
  AAA_LARGE = 4.5,     // WCAG AAA for large text
  AAA_NORMAL = 7.0,    // WCAG AAA for normal text
}

/**
 * Check if contrast meets WCAG 2.1 AA standard
 * @param contrast - The contrast ratio to check
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 */
export function meetsWCAGAA(contrast: number, isLargeText: boolean = false): boolean {
  return isLargeText ? contrast >= ContrastLevel.AA_LARGE : contrast >= ContrastLevel.AA_NORMAL;
}

/**
 * Check if contrast meets WCAG 2.1 AAA standard
 * @param contrast - The contrast ratio to check
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 */
export function meetsWCAGAAA(contrast: number, isLargeText: boolean = false): boolean {
  return isLargeText ? contrast >= ContrastLevel.AAA_LARGE : contrast >= ContrastLevel.AAA_NORMAL;
}

/**
 * Get the minimum contrast ratio required for a given text size
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @param level - The WCAG level (AA or AAA)
 */
export function getMinimumContrast(isLargeText: boolean = false, level: 'AA' | 'AAA' = 'AA'): number {
  if (level === 'AAA') {
    return isLargeText ? ContrastLevel.AAA_LARGE : ContrastLevel.AAA_NORMAL;
  }
  return isLargeText ? ContrastLevel.AA_LARGE : ContrastLevel.AA_NORMAL;
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
 * Ensure WCAG contrast ratio meets minimum requirements
 * Enhanced version with iterative adjustment algorithm that guarantees compliance
 * @param fg - Foreground color (text)
 * @param bg - Background color
 * @param minContrast - Minimum contrast ratio required (default: 4.5 for WCAG AA normal text)
 * @param preferAdjustFg - Whether to prefer adjusting foreground over background (default: true)
 */
export function ensureContrast(
  fg: string,
  bg: string,
  minContrast: number = ContrastLevel.AA_NORMAL,
  preferAdjustFg: boolean = true,
): { fg: string; bg: string; contrast: number } {
  let currentFg = fg;
  let currentBg = bg;
  let contrast = getContrastRatio(currentFg, currentBg);

  // If already meeting requirements, return as-is
  if (contrast >= minContrast) {
    return { fg: currentFg, bg: currentBg, contrast };
  }

  const bgRgb = hexToRgb(bg);
  const fgRgb = hexToRgb(fg);

  if (!bgRgb || !fgRgb) {
    // Fallback: use optimal foreground for background
    const optimalFg = getOptimalForeground(bg);
    const optimalContrast = getContrastRatio(optimalFg, bg);
    return { fg: optimalFg, bg, contrast: optimalContrast };
  }

  const bgLuminance = getLuminance(bg);
  const isDarkBg = bgLuminance < 0.5;

  // Strategy: Adjust the color that makes sense to adjust
  // For background images, we usually want to adjust foreground (text)
  // For solid backgrounds, we might adjust background if preferAdjustFg is false
  
  if (preferAdjustFg) {
    // Adjust foreground to meet contrast requirements
    let adjustmentStep = 0.1;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    while (contrast < minContrast && attempts < maxAttempts) {
      if (isDarkBg) {
        // Dark background: lighten foreground
        currentFg = lightenColor(currentFg, adjustmentStep);
      } else {
        // Light background: darken foreground
        currentFg = darkenColor(currentFg, adjustmentStep);
      }
      
      contrast = getContrastRatio(currentFg, currentBg);
      
      // If we've gone past the target, try the opposite direction with smaller steps
      if (contrast < minContrast && attempts > 10) {
        adjustmentStep *= 1.2; // Increase adjustment step
      }
      
      attempts++;
    }
    
    // If still not meeting requirements, use optimal color
    if (contrast < minContrast) {
      currentFg = getOptimalForeground(currentBg);
      contrast = getContrastRatio(currentFg, currentBg);
    }
  } else {
    // Adjust background (less common, but sometimes needed)
    // This is typically not used for background images
    currentBg = isDarkBg ? lightenColor(currentBg, 0.5) : darkenColor(currentBg, 0.5);
    contrast = getContrastRatio(currentFg, currentBg);
    
    // If still not meeting requirements, adjust foreground instead
    if (contrast < minContrast) {
      currentFg = getOptimalForeground(currentBg);
      contrast = getContrastRatio(currentFg, currentBg);
    }
  }

  // Final safety check: ensure we always have readable text
  if (contrast < 3.0) {
    // Absolute minimum: use pure white/black
    currentFg = isDarkBg ? "#ffffff" : "#000000";
    contrast = getContrastRatio(currentFg, currentBg);
  }

  return { fg: currentFg, bg: currentBg, contrast };
}

/**
 * Ensure contrast for large text (18pt+ or 14pt+ bold)
 * Uses WCAG AA large text standard (3:1) or AAA (4.5:1)
 */
export function ensureContrastLargeText(
  fg: string,
  bg: string,
  level: 'AA' | 'AAA' = 'AA',
): { fg: string; bg: string; contrast: number } {
  const minContrast = getMinimumContrast(true, level);
  return ensureContrast(fg, bg, minContrast, true);
}

/**
 * Get luminance of a color (0-1 scale)
 * WCAG 2.1 relative luminance calculation
 */
export function getLuminance(color: string): number {
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
 * Darken a color by a specified amount (0-1)
 * Uses linear interpolation for smooth darkening
 */
export function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));
  
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

    // Ensure proper contrast - use WCAG AA normal text standard (4.5:1)
    // This ensures all text meets accessibility requirements
    const { fg, bg, contrast } = ensureContrast(
      palette.fg, 
      palette.bg, 
      ContrastLevel.AA_NORMAL,
      true // Prefer adjusting foreground (text color)
    );

    logDebug("Extracted palette with contrast", {
      contrast: contrast.toFixed(2),
      meetsAA: meetsWCAGAA(contrast, false),
      meetsAAA: meetsWCAGAAA(contrast, false),
    });

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
 * Enhanced to ensure high contrast for text readability, especially on mobile
 */
function generatePalette(dominantColor: string, isDark: boolean): ColorPalette {
  const rgb = hexToRgb(dominantColor);
  if (!rgb) return getFallbackPalette();

  const { r, g, b } = rgb;

  // Create variations
  const bg = dominantColor;
  
  // Calculate luminance for smarter foreground color selection
  const luminance = getLuminance(bg);
  
  // Use high-contrast colors for better readability
  // For dark backgrounds (luminance < 0.5), use white
  // For light backgrounds (luminance >= 0.5), use black
  // This ensures WCAG AA compliance (4.5:1 contrast ratio minimum)
  let fg: string;
  if (luminance < 0.35) {
    // Very dark background - use pure white for maximum contrast
    fg = "#ffffff";
  } else if (luminance > 0.65) {
    // Very light background - use pure black for maximum contrast
    fg = "#000000";
  } else {
    // Medium brightness - use isDark flag as fallback
    fg = isDark ? "#ffffff" : "#000000";
  }

  // Create muted color (desaturated version) - ensure it maintains contrast
  const mutedR = Math.round(r * 0.7 + 128 * 0.3);
  const mutedG = Math.round(g * 0.7 + 128 * 0.3);
  const mutedB = Math.round(b * 0.7 + 128 * 0.3);
  const muted = rgbToHex(mutedR, mutedG, mutedB);

  // Create accent color (slightly different hue) - ensure good contrast
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
 * Lighten a color by a specified amount (0-1)
 * Uses linear interpolation for smooth lightening
 */
export function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));
  
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
 * Returns the highest contrast color (white or black) for maximum readability
 */
export function getOptimalForeground(bg: string): string {
  const bgLuminance = getLuminance(bg);
  // Return white for dark backgrounds, black for light backgrounds
  return bgLuminance < 0.5 ? "#ffffff" : "#000000";
}

/**
 * Calculate effective background color when an overlay is applied
 * This is useful for background images with dark/light overlays
 * @param baseBg - Base background color (from image)
 * @param overlayColor - Overlay color (e.g., "rgba(0,0,0,0.6)" or hex)
 * @param overlayOpacity - Overlay opacity (0-1), used if overlayColor is hex
 */
export function calculateEffectiveBackground(
  baseBg: string,
  overlayColor: string = "#000000",
  overlayOpacity: number = 0.6,
): string {
  // Validate inputs
  if (!baseBg || typeof baseBg !== "string") {
    return baseBg || "#000000";
  }
  
  const baseRgb = hexToRgb(baseBg);
  if (!baseRgb) return baseBg;

  // Clamp opacity between 0 and 1
  overlayOpacity = Math.max(0, Math.min(1, overlayOpacity));

  // Parse overlay color
  let overlayRgb: { r: number; g: number; b: number };
  
  if (overlayColor.startsWith("rgba") || overlayColor.startsWith("rgb")) {
    // Extract RGB values from rgba/rgb string
    const match = overlayColor.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      overlayRgb = {
        r: Math.max(0, Math.min(255, parseInt(match[1], 10))),
        g: Math.max(0, Math.min(255, parseInt(match[2], 10))),
        b: Math.max(0, Math.min(255, parseInt(match[3], 10))),
      };
      // Extract opacity from rgba if present
      const alphaMatch = overlayColor.match(/,\s*([\d.]+)\s*\)/);
      if (alphaMatch) {
        overlayOpacity = Math.max(0, Math.min(1, parseFloat(alphaMatch[1])));
      }
    } else {
      overlayRgb = { r: 0, g: 0, b: 0 };
    }
  } else {
    // Hex color
    const parsed = hexToRgb(overlayColor);
    overlayRgb = parsed || { r: 0, g: 0, b: 0 };
  }

  // Blend colors: result = base * (1 - opacity) + overlay * opacity
  const r = Math.max(0, Math.min(255, Math.round(baseRgb.r * (1 - overlayOpacity) + overlayRgb.r * overlayOpacity)));
  const g = Math.max(0, Math.min(255, Math.round(baseRgb.g * (1 - overlayOpacity) + overlayRgb.g * overlayOpacity)));
  const b = Math.max(0, Math.min(255, Math.round(baseRgb.b * (1 - overlayOpacity) + overlayRgb.b * overlayOpacity)));

  return rgbToHex(r, g, b);
}

/**
 * Get optimal text color for background images with overlays
 * This function accounts for the effective background (image + overlay)
 * and ensures WCAG AA/AAA compliance
 * @param imageBgColor - Dominant color from background image
 * @param overlayColor - Overlay color applied over the image
 * @param overlayOpacity - Overlay opacity (0-1)
 * @param fontSize - Font size in pixels (for determining large text threshold)
 * @param isBold - Whether text is bold
 * @param level - WCAG level ('AA' or 'AAA')
 */
export function getOptimalTextColorForImage(
  imageBgColor: string,
  overlayColor: string = "#000000",
  overlayOpacity: number = 0.6,
  fontSize: number = 16,
  isBold: boolean = false,
  level: 'AA' | 'AAA' = 'AA',
): { color: string; contrast: number; meetsAA: boolean; meetsAAA: boolean } {
  // Validate inputs
  if (!imageBgColor || typeof imageBgColor !== "string") {
    // Fallback to high contrast
    return {
      color: "#ffffff",
      contrast: 21.0,
      meetsAA: true,
      meetsAAA: true,
    };
  }
  
  // Validate fontSize
  fontSize = Math.max(1, Math.min(200, fontSize));
  
  // Calculate effective background (image + overlay)
  const effectiveBg = calculateEffectiveBackground(imageBgColor, overlayColor, overlayOpacity);
  
  // Determine if this is large text
  const large = isLargeText(fontSize, isBold);
  
  // Get minimum required contrast
  const minContrast = getMinimumContrast(large, level);
  
  // Try white first
  const whiteContrast = getContrastRatio("#ffffff", effectiveBg);
  
  // Try black
  const blackContrast = getContrastRatio("#000000", effectiveBg);
  
  // Choose the color with better contrast
  let optimalColor: string;
  let contrast: number;
  
  if (whiteContrast >= blackContrast) {
    optimalColor = "#ffffff";
    contrast = whiteContrast;
  } else {
    optimalColor = "#000000";
    contrast = blackContrast;
  }
  
  // If contrast is still insufficient, use ensureContrast to adjust
  if (contrast < minContrast) {
    const adjusted = ensureContrast(optimalColor, effectiveBg, minContrast, true);
    optimalColor = adjusted.fg;
    contrast = adjusted.contrast;
  }
  
  return {
    color: optimalColor,
    contrast,
    meetsAA: meetsWCAGAA(contrast, large),
    meetsAAA: meetsWCAGAAA(contrast, large),
  };
}

/**
 * Get optimal text color for background images with multiple overlays
 * Accounts for gradient overlays and multiple layers
 * @param imageBgColor - Dominant color from background image
 * @param overlays - Array of overlay definitions
 */
export function getOptimalTextColorForImageWithOverlays(
  imageBgColor: string,
  overlays: Array<{ color: string; opacity: number }> = [
    { color: "#000000", opacity: 0.6 },
  ],
  fontSize: number = 16,
  isBold: boolean = false,
  level: 'AA' | 'AAA' = 'AA',
): { color: string; contrast: number; meetsAA: boolean; meetsAAA: boolean } {
  // Validate inputs
  if (!imageBgColor || typeof imageBgColor !== "string") {
    // Fallback to high contrast
    return {
      color: "#ffffff",
      contrast: 21.0,
      meetsAA: true,
      meetsAAA: true,
    };
  }
  
  // Validate fontSize
  fontSize = Math.max(1, Math.min(200, fontSize));
  
  // Start with base background
  let effectiveBg = imageBgColor;
  
  // Apply each overlay in sequence (if provided)
  if (Array.isArray(overlays) && overlays.length > 0) {
    for (const overlay of overlays) {
      if (overlay && overlay.color && typeof overlay.opacity === "number") {
        effectiveBg = calculateEffectiveBackground(
          effectiveBg,
          overlay.color,
          overlay.opacity,
        );
      }
    }
  }
  
  // Now get optimal text color for the final effective background
  const large = isLargeText(fontSize, isBold);
  const minContrast = getMinimumContrast(large, level);
  
  // Try white and black
  const whiteContrast = getContrastRatio("#ffffff", effectiveBg);
  const blackContrast = getContrastRatio("#000000", effectiveBg);
  
  let optimalColor: string;
  let contrast: number;
  
  if (whiteContrast >= blackContrast) {
    optimalColor = "#ffffff";
    contrast = whiteContrast;
  } else {
    optimalColor = "#000000";
    contrast = blackContrast;
  }
  
  // Ensure minimum contrast
  if (contrast < minContrast) {
    const adjusted = ensureContrast(optimalColor, effectiveBg, minContrast, true);
    optimalColor = adjusted.fg;
    contrast = adjusted.contrast;
  }
  
  return {
    color: optimalColor,
    contrast,
    meetsAA: meetsWCAGAA(contrast, large),
    meetsAAA: meetsWCAGAAA(contrast, large),
  };
}

/**
 * Check if text should be considered "large" for WCAG purposes
 * Large text is: 18pt (24px) or larger, OR 14pt (18.67px) or larger if bold
 * @param fontSize - Font size in pixels
 * @param isBold - Whether the text is bold
 */
export function isLargeText(fontSize: number, isBold: boolean = false): boolean {
  if (isBold) {
    return fontSize >= 18.67; // 14pt bold
  }
  return fontSize >= 24; // 18pt normal
}

/**
 * Get the appropriate minimum contrast ratio for text based on its size
 * @param fontSize - Font size in pixels
 * @param isBold - Whether the text is bold
 * @param level - WCAG level (AA or AAA)
 */
export function getRequiredContrast(
  fontSize: number,
  isBold: boolean = false,
  level: 'AA' | 'AAA' = 'AA'
): number {
  const large = isLargeText(fontSize, isBold);
  return getMinimumContrast(large, level);
}

/**
 * Apply color palette to CSS variables with automatic contrast computation
 * Enhanced to update --primary, --card, and related variables for buttons and cards
 */
export function applyColorPalette(palette: ColorPalette): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Ensure proper contrast before applying - WCAG AA normal text (4.5:1)
  const { fg: safeFg, bg: safeBg, contrast: baseContrast } = ensureContrast(
    palette.fg, 
    palette.bg, 
    ContrastLevel.AA_NORMAL,
    true
  );
  
  logDebug("Applied color palette with contrast", {
    contrast: baseContrast.toFixed(2),
    meetsAA: meetsWCAGAA(baseContrast, false),
    meetsAAA: meetsWCAGAAA(baseContrast, false),
  });

  // Derive primary color from accent (for buttons)
  // Ensure primary has good contrast on background
  let primaryColor = derivePrimaryColor(palette.accent, safeBg);
  const primaryOnBgContrastInitial = getContrastRatio(primaryColor, safeBg);
  
  // If primary doesn't have enough contrast, adjust it
  if (primaryOnBgContrastInitial < ContrastLevel.AA_NORMAL) {
    const isDarkBg = getLuminance(safeBg) < 0.5;
    // Adjust primary to ensure it stands out on background
    if (isDarkBg) {
      primaryColor = lightenColor(primaryColor, 0.5);
    } else {
      primaryColor = darkenColor(primaryColor, 0.5);
    }
  }
  
  // Derive card background color
  const cardBg = deriveCardColor(safeBg, getLuminance(safeBg) < 0.5);
  
  // Get optimal foreground for primary (button text) - ensure WCAG AA
  let primaryFg = getOptimalForeground(primaryColor);
  const { fg: adjustedPrimaryFg } = ensureContrast(
    primaryFg,
    primaryColor,
    ContrastLevel.AA_NORMAL,
    true
  );
  primaryFg = adjustedPrimaryFg;
  
  // Get optimal foreground for card (card text) - ensure WCAG AA
  let cardFg = getOptimalForeground(cardBg);
  const { fg: adjustedCardFg } = ensureContrast(
    cardFg,
    cardBg,
    ContrastLevel.AA_NORMAL,
    true
  );
  cardFg = adjustedCardFg;

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
  const primaryOnBgContrast = getContrastRatio(primaryColor, safeBg);
  
  // Store contrast ratios as CSS variables
  root.style.setProperty("--contrast-ratio", contrastRatio.toFixed(2));
  root.style.setProperty("--primary-contrast", primaryContrast.toFixed(2));
  root.style.setProperty("--card-contrast", cardContrast.toFixed(2));
  root.style.setProperty("--primary-on-bg-contrast", primaryOnBgContrast.toFixed(2));

  // Set contrast compliance indicators (normal text)
  const baseMeetsAA = meetsWCAGAA(contrastRatio, false);
  const baseMeetsAAA = meetsWCAGAAA(contrastRatio, false);
  const primaryMeetsAA = meetsWCAGAA(primaryContrast, false);
  const cardMeetsAA = meetsWCAGAA(cardContrast, false);
  
  root.style.setProperty("--contrast-aa", baseMeetsAA.toString());
  root.style.setProperty("--contrast-aaa", baseMeetsAAA.toString());
  root.style.setProperty("--primary-contrast-aa", primaryMeetsAA.toString());
  root.style.setProperty("--card-contrast-aa", cardMeetsAA.toString());
  
  // Set contrast compliance for large text (3:1 for AA, 4.5:1 for AAA)
  const baseMeetsAALarge = meetsWCAGAA(contrastRatio, true);
  const baseMeetsAAALarge = meetsWCAGAAA(contrastRatio, true);
  root.style.setProperty("--contrast-aa-large", baseMeetsAALarge.toString());
  root.style.setProperty("--contrast-aaa-large", baseMeetsAAALarge.toString());

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
    
    // Focus ring color with better contrast - ensure it's visible
    // Focus rings need at least 3:1 contrast (WCAG AA for UI components)
    const focusRingContrast = getContrastRatio(primary, bg);
    let focusRingColor = primary;
    
    if (focusRingContrast < ContrastLevel.AA_LARGE) {
      // Adjust focus ring to ensure visibility
      const isDarkBg = getLuminance(bg) < 0.5;
      focusRingColor = isDarkBg ? "#ffffff" : "#000000";
    }
    
    const focusRingRgb = hexToRgb(focusRingColor);
    if (focusRingRgb) {
      const focusRingHsl = rgbToHsl(focusRingRgb.r, focusRingRgb.g, focusRingRgb.b);
      root.style.setProperty("--focus-ring-color", `${focusRingHsl.h} ${focusRingHsl.s}% ${focusRingHsl.l}%`);
      root.style.setProperty("--focus-ring-contrast", getContrastRatio(focusRingColor, bg).toFixed(2));
    }
  }

  // High contrast mode support - ensure maximum contrast (WCAG AAA)
  const baseContrast = getContrastRatio(fg, bg);
  let highContrastFg = fg;
  let highContrastBg = bg;
  
  if (baseContrast < ContrastLevel.AAA_NORMAL) {
    // Force maximum contrast for high contrast mode
    const bgLum = getLuminance(bg);
    highContrastFg = bgLum < 0.5 ? "#ffffff" : "#000000";
    highContrastBg = bgLum < 0.5 ? "#000000" : "#ffffff";
  }
  
  // Ensure high contrast mode meets WCAG AAA (7:1)
  const highContrastRatio = getContrastRatio(highContrastFg, highContrastBg);
  root.style.setProperty("--high-contrast-fg", highContrastFg);
  root.style.setProperty("--high-contrast-bg", highContrastBg);
  root.style.setProperty("--high-contrast-ratio", highContrastRatio.toFixed(2));
  root.style.setProperty("--high-contrast-aaa", meetsWCAGAAA(highContrastRatio, false).toString());

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
  // Buttons need WCAG AA contrast (4.5:1 for normal text)
  const primaryOnCardContrast = getContrastRatio(primary, card);
  
  let cardButtonBg = primary;
  if (primaryOnCardContrast < ContrastLevel.AA_NORMAL) {
    // Primary doesn't contrast well with card, derive a better color
    // For dark cards, use a lighter version of primary
    // For light cards, use a darker version of primary
    if (isDarkCard) {
      cardButtonBg = lightenColor(primary, 0.5);
    } else {
      cardButtonBg = darkenColor(primary, 0.5);
    }
    
    // Ensure the adjusted color still contrasts well
    const adjustedContrast = getContrastRatio(cardButtonBg, card);
    if (adjustedContrast < ContrastLevel.AA_NORMAL) {
      // If still not enough contrast, use optimal contrasting color
      const { fg: optimalButtonBg } = ensureContrast(
        isDarkCard ? "#ffffff" : "#000000",
        card,
        ContrastLevel.AA_NORMAL,
        false // Adjust background (button bg) if needed
      );
      cardButtonBg = optimalButtonBg === card ? (isDarkCard ? "#ffffff" : "#000000") : cardButtonBg;
    }
  }
  
  // Get optimal foreground for button (text color on button) - ensure WCAG AA
  let cardButtonFg = getOptimalForeground(cardButtonBg);
  const { fg: adjustedCardButtonFg } = ensureContrast(
    cardButtonFg,
    cardButtonBg,
    ContrastLevel.AA_NORMAL,
    true
  );
  cardButtonFg = adjustedCardButtonFg;
  
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

/**
 * Comprehensive contrast verification result
 */
export interface ContrastVerificationResult {
  fg: string;
  bg: string;
  contrast: number;
  fontSize: number;
  isBold: boolean;
  isLargeText: boolean;
  meetsAA: boolean;
  meetsAAA: boolean;
  requiredAA: number;
  requiredAAA: number;
  pass: boolean;
  level: 'AA' | 'AAA';
}

/**
 * Verify contrast for a text/background combination
 * Returns detailed verification results
 */
export function verifyContrast(
  fg: string,
  bg: string,
  fontSize: number = 16,
  isBold: boolean = false,
  level: 'AA' | 'AAA' = 'AA',
): ContrastVerificationResult {
  // Validate inputs
  if (!fg || typeof fg !== "string" || !bg || typeof bg !== "string") {
    return {
      fg: fg || "#000000",
      bg: bg || "#ffffff",
      contrast: 0,
      fontSize: Math.max(1, Math.min(200, fontSize)),
      isBold,
      isLargeText: false,
      meetsAA: false,
      meetsAAA: false,
      requiredAA: 4.5,
      requiredAAA: 7.0,
      pass: false,
      level,
    };
  }
  
  // Validate fontSize
  fontSize = Math.max(1, Math.min(200, fontSize));
  
  const contrast = getContrastRatio(fg, bg);
  const largeText = isLargeText(fontSize, isBold);
  const requiredAA = getMinimumContrast(largeText, 'AA');
  const requiredAAA = getMinimumContrast(largeText, 'AAA');
  const meetsAA = meetsWCAGAA(contrast, largeText);
  const meetsAAA = meetsWCAGAAA(contrast, largeText);
  
  const pass = level === 'AA' ? meetsAA : meetsAAA;
  
  return {
    fg,
    bg,
    contrast,
    fontSize,
    isBold,
    isLargeText: largeText,
    meetsAA,
    meetsAAA,
    requiredAA,
    requiredAAA,
    pass,
    level,
  };
}

/**
 * Verify contrast for multiple text/background combinations
 * Useful for testing entire color palettes
 */
export function verifyContrastBatch(
  combinations: Array<{
    fg: string;
    bg: string;
    fontSize?: number;
    isBold?: boolean;
    level?: 'AA' | 'AAA';
  }>,
): Array<ContrastVerificationResult> {
  return combinations.map(({ fg, bg, fontSize = 16, isBold = false, level = 'AA' }) =>
    verifyContrast(fg, bg, fontSize, isBold, level),
  );
}

/**
 * Get contrast verification summary
 * Returns a summary of all verification results
 */
export function getContrastSummary(
  results: Array<ContrastVerificationResult>,
): {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  failures: Array<ContrastVerificationResult>;
  warnings: Array<ContrastVerificationResult>;
} {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const warnings = results.filter(
    (r) => r.pass && r.contrast < r.requiredAA * 1.2, // Within 20% of minimum
  );
  
  return {
    total: results.length,
    passed,
    failed,
    passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
    failures: results.filter((r) => !r.pass),
    warnings,
  };
}

