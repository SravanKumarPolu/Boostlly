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
 * Apply color palette to CSS variables with automatic contrast computation
 */
export function applyColorPalette(palette: ColorPalette): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Ensure proper contrast before applying
  const { fg: safeFg, bg: safeBg } = ensureContrast(palette.fg, palette.bg);

  // Apply safe colors
  root.style.setProperty("--bg", safeBg);
  root.style.setProperty("--fg", safeFg);
  root.style.setProperty("--muted", palette.muted);
  root.style.setProperty("--accent", palette.accent);

  // Also set Tailwind-compatible variables for automatic contrast
  root.style.setProperty("--foreground", safeFg);
  root.style.setProperty("--background", safeBg);
  root.style.setProperty("--muted-foreground", palette.muted);
  root.style.setProperty("--accent", palette.accent);

  // Compute and apply contrast ratios
  const contrastRatio = getContrastRatio(safeFg, safeBg);
  root.style.setProperty("--contrast-ratio", contrastRatio.toString());

  // Set contrast compliance indicators
  root.style.setProperty("--contrast-aa", (contrastRatio >= 4.5).toString());
  root.style.setProperty("--contrast-aaa", (contrastRatio >= 7.0).toString());

  // Also set HSL values for better CSS integration
  const bgRgb = hexToRgb(safeBg);
  const fgRgb = hexToRgb(safeFg);
  const mutedRgb = hexToRgb(palette.muted);
  const accentRgb = hexToRgb(palette.accent);

  if (bgRgb) {
    const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
    root.style.setProperty("--bg-hsl", `${bgHsl.h} ${bgHsl.s}% ${bgHsl.l}%`);
  }

  if (fgRgb) {
    const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
    root.style.setProperty("--fg-hsl", `${fgHsl.h} ${fgHsl.s}% ${fgHsl.l}%`);
    // Also set Tailwind-compatible foreground HSL
    root.style.setProperty(
      "--foreground-hsl",
      `${fgHsl.h} ${fgHsl.s}% ${fgHsl.l}%`,
    );
  }

  if (mutedRgb) {
    const mutedHsl = rgbToHsl(mutedRgb.r, mutedRgb.g, mutedRgb.b);
    root.style.setProperty(
      "--muted-hsl",
      `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`,
    );
    // Also set Tailwind-compatible muted foreground HSL
    root.style.setProperty(
      "--muted-foreground-hsl",
      `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`,
    );
  }

  if (accentRgb) {
    const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
    root.style.setProperty(
      "--accent-hsl",
      `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`,
    );
  }

  // Set additional accessibility variables
  setAccessibilityVariables(safeFg, safeBg, palette.accent);
}

/**
 * Set additional accessibility-related CSS variables
 */
function setAccessibilityVariables(
  fg: string,
  bg: string,
  accent: string,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Focus ring colors with proper contrast
  const focusRingColor = ensureContrast(accent, bg).fg;
  root.style.setProperty("--focus-ring-color", focusRingColor);

  // High contrast mode support
  const highContrastFg = getContrastRatio(fg, bg) < 7.0 ? "#ffffff" : fg;
  const highContrastBg = getContrastRatio(fg, bg) < 7.0 ? "#000000" : bg;
  root.style.setProperty("--high-contrast-fg", highContrastFg);
  root.style.setProperty("--high-contrast-bg", highContrastBg);

  // Button contrast variants
  const buttonFg = ensureContrast(fg, bg).fg;
  const buttonBg = ensureContrast(fg, bg).bg;
  root.style.setProperty("--button-fg", buttonFg);
  root.style.setProperty("--button-bg", buttonBg);
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
