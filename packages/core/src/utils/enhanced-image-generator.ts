/**
 * Enhanced Quote Image Generator
 * 
 * Provides advanced customization options for quote images:
 * - Gradient backgrounds
 * - Font selection
 * - Watermark customization
 * - Export PNG
 */

import { logError, logWarning } from "./logger";
import html2canvas from "html2canvas";
import {
  getBundledBackground,
  generateBundledGradient,
  createCanvasSafeBackgroundUrl,
} from "./bundled-backgrounds";

export type FontFamily = 
  | "serif" 
  | "sans-serif" 
  | "monospace" 
  | "cursive" 
  | "fantasy"
  | "playfair"
  | "montserrat"
  | "lora"
  | "merriweather"
  | "opensans";

export type GradientPreset =
  | "purple-blue"
  | "orange-pink"
  | "teal-green"
  | "sunset"
  | "ocean"
  | "forest"
  | "lavender"
  | "golden"
  | "midnight"
  | "rose";

export interface WatermarkOptions {
  enabled: boolean;
  text?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity?: number;
  fontSize?: number;
}

export interface EnhancedQuoteImageOptions {
  width?: number;
  height?: number;
  
  // Background options
  backgroundType?: "gradient" | "image" | "solid";
  gradientPreset?: GradientPreset;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  
  // Text options
  textColor?: string;
  fontSize?: number;
  fontFamily?: FontFamily;
  fontWeight?: "normal" | "bold" | "300" | "400" | "500" | "600" | "700";
  lineHeight?: number;
  
  // Watermark options
  watermark?: WatermarkOptions;
  
  // Logo options
  logoUrl?: string;
  showLogo?: boolean;
  
  // Layout options
  padding?: number;
  borderRadius?: number;
  textAlign?: "left" | "center" | "right";
}

const GRADIENT_PRESETS: Record<GradientPreset, string> = {
  "purple-blue": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "orange-pink": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "teal-green": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "sunset": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "ocean": "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "forest": "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
  "lavender": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "golden": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "midnight": "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)",
  "rose": "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
};

const FONT_FAMILIES: Record<FontFamily, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  "sans-serif": "system-ui, -apple-system, sans-serif",
  monospace: "'Courier New', monospace",
  cursive: "'Brush Script MT', cursive",
  fantasy: "Impact, fantasy",
  playfair: "'Playfair Display', Georgia, serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  lora: "'Lora', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
  opensans: "'Open Sans', system-ui, sans-serif",
};

export async function generateEnhancedQuoteImage(
  quoteText: string,
  author: string,
  options: EnhancedQuoteImageOptions = {},
): Promise<string> {
  const {
    width = 1200,
    height = 800,
    backgroundType = "gradient",
    gradientPreset = "purple-blue",
    backgroundColor = "#1e293b",
    backgroundImageUrl,
    textColor = "#ffffff",
    fontSize = 32,
    fontFamily = "sans-serif",
    fontWeight = "600",
    lineHeight = 1.6,
    watermark = { enabled: false },
    logoUrl = "/boostlly-logo.png",
    showLogo = true,
    padding = 60,
    borderRadius = 24,
    textAlign = "center",
  } = options;

  // Validate inputs
  if (!quoteText || !author) {
    throw new Error("Quote text and author are required");
  }

  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Image generation requires browser environment");
  }

  // Create a temporary container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.padding = `${padding}px`;
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = textAlign === "center" ? "center" : textAlign === "left" ? "flex-start" : "flex-end";
  container.style.fontFamily = FONT_FAMILIES[fontFamily];
  container.style.borderRadius = `${borderRadius}px`;
  container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
  container.style.overflow = "hidden";
  container.style.position = "relative";

  // Set background
  if (backgroundType === "gradient") {
    const gradient = GRADIENT_PRESETS[gradientPreset] || GRADIENT_PRESETS["purple-blue"];
    container.style.background = gradient;
  } else if (backgroundType === "image" && backgroundImageUrl) {
    container.style.backgroundImage = `url(${backgroundImageUrl})`;
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
    container.style.backgroundRepeat = "no-repeat";
    // Add overlay for better text readability
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.zIndex = "0";
    container.appendChild(overlay);
  } else {
    container.style.backgroundColor = backgroundColor;
  }

  // Create quote content wrapper
  const quoteContent = document.createElement("div");
  quoteContent.style.textAlign = textAlign;
  quoteContent.style.maxWidth = "85%";
  quoteContent.style.position = "relative";
  quoteContent.style.zIndex = "1";

  // Quote text
  const quoteElement = document.createElement("p");
  quoteElement.textContent = `"${quoteText}"`;
  quoteElement.style.fontSize = `${fontSize}px`;
  quoteElement.style.fontWeight = fontWeight;
  quoteElement.style.color = textColor;
  quoteElement.style.lineHeight = `${lineHeight}`;
  quoteElement.style.marginBottom = "30px";
  quoteElement.style.fontStyle = "italic";
  quoteElement.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";

  // Author
  const authorElement = document.createElement("p");
  authorElement.textContent = `— ${author}`;
  authorElement.style.fontSize = `${fontSize * 0.7}px`;
  authorElement.style.color = textColor;
  authorElement.style.opacity = "0.9";
  authorElement.style.marginBottom = "40px";
  authorElement.style.fontWeight = "500";
  authorElement.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";

  // Logo and app name
  if (showLogo) {
    const logoContainer = document.createElement("div");
    logoContainer.style.display = "flex";
    logoContainer.style.flexDirection = "column";
    logoContainer.style.alignItems = "center";
    logoContainer.style.gap = "10px";

    const logoElement = document.createElement("img");
    logoElement.src = logoUrl;
    logoElement.style.width = "48px";
    logoElement.style.height = "48px";
    logoElement.style.borderRadius = "8px";
    logoElement.onerror = () => {
      logoElement.style.display = "none";
    };

    const appNameElement = document.createElement("p");
    appNameElement.textContent = "Boostlly";
    appNameElement.style.fontSize = "16px";
    appNameElement.style.color = textColor;
    appNameElement.style.opacity = "0.7";
    appNameElement.style.fontWeight = "500";

    logoContainer.appendChild(logoElement);
    logoContainer.appendChild(appNameElement);
    quoteContent.appendChild(logoContainer);
  }

  // Assemble quote content
  quoteContent.insertBefore(quoteElement, quoteContent.firstChild);
  quoteContent.insertBefore(authorElement, quoteContent.firstChild);

  container.appendChild(quoteContent);

  // Add watermark if enabled
  if (watermark.enabled && watermark.text) {
    const watermarkElement = document.createElement("div");
    watermarkElement.textContent = watermark.text;
    watermarkElement.style.position = "absolute";
    watermarkElement.style.fontSize = `${watermark.fontSize || 14}px`;
    watermarkElement.style.color = textColor;
    watermarkElement.style.opacity = `${watermark.opacity || 0.3}`;
    watermarkElement.style.fontWeight = "400";
    watermarkElement.style.zIndex = "2";
    watermarkElement.style.pointerEvents = "none";

    const position = watermark.position || "bottom-right";
    switch (position) {
      case "top-left":
        watermarkElement.style.top = "20px";
        watermarkElement.style.left = "20px";
        break;
      case "top-right":
        watermarkElement.style.top = "20px";
        watermarkElement.style.right = "20px";
        break;
      case "bottom-left":
        watermarkElement.style.bottom = "20px";
        watermarkElement.style.left = "20px";
        break;
      case "bottom-right":
        watermarkElement.style.bottom = "20px";
        watermarkElement.style.right = "20px";
        break;
      case "center":
        watermarkElement.style.top = "50%";
        watermarkElement.style.left = "50%";
        watermarkElement.style.transform = "translate(-50%, -50%)";
        break;
    }

    container.appendChild(watermarkElement);
  }

  document.body.appendChild(container);

  try {
    // Check if html2canvas is available
    if (typeof html2canvas === "undefined") {
      throw new Error("html2canvas is not available");
    }

    // Generate canvas with high quality
    const canvas = await html2canvas(container, {
      width,
      height,
      backgroundColor: null,
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: false,
      logging: false,
      onclone: (clonedDoc: Document) => {
        // Ensure styles are preserved in cloned document
        const clonedContainer = clonedDoc.querySelector("div");
        if (clonedContainer) {
          clonedContainer.style.position = "absolute";
          clonedContainer.style.left = "-9999px";
          clonedContainer.style.top = "-9999px";
        }
      },
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    // Clean up
    document.body.removeChild(container);

    return dataUrl;
  } catch (error) {
    // Clean up on error
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    logError("Enhanced image generation failed:", { error });

    throw new Error(
      `Failed to generate quote image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Note: downloadImage is exported from image-generator.ts to avoid duplicate exports
// Import it from there: import { downloadImage } from '@boostlly/core';

