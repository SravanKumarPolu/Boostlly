/**
 * Bundled Background Assets for CORS-Safe Poster Export
 *
 * Provides local background assets to avoid tainted canvas issues
 * when generating quote images with html2canvas.
 */

export interface BundledBackground {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
  description: string;
  category: "gradient" | "nature" | "abstract" | "solid";
}

/**
 * Default bundled backgrounds
 * These are CORS-safe local assets that can be used with canvas
 */
export const BUNDLED_BACKGROUNDS: BundledBackground[] = [
  {
    id: "gradient-purple-blue",
    name: "Purple to Blue Gradient",
    url: "/assets/backgrounds/gradient-purple-blue.jpg",
    previewUrl: "/assets/backgrounds/gradient-purple-blue-preview.jpg",
    description: "Beautiful gradient from purple to blue",
    category: "gradient",
  },
  {
    id: "gradient-orange-pink",
    name: "Sunset Gradient",
    url: "/assets/backgrounds/gradient-orange-pink.jpg",
    previewUrl: "/assets/backgrounds/gradient-orange-pink-preview.jpg",
    description: "Warm sunset colors from orange to pink",
    category: "gradient",
  },
  {
    id: "gradient-teal-green",
    name: "Ocean Gradient",
    url: "/assets/backgrounds/gradient-teal-green.jpg",
    previewUrl: "/assets/backgrounds/gradient-teal-green-preview.jpg",
    description: "Calming ocean-inspired gradient",
    category: "gradient",
  },
  {
    id: "solid-deep-slate",
    name: "Deep Slate",
    url: "/assets/backgrounds/solid-deep-slate.jpg",
    previewUrl: "/assets/backgrounds/solid-deep-slate-preview.jpg",
    description: "Professional deep slate background",
    category: "solid",
  },
  {
    id: "solid-warm-white",
    name: "Warm White",
    url: "/assets/backgrounds/solid-warm-white.jpg",
    previewUrl: "/assets/backgrounds/solid-warm-white-preview.jpg",
    description: "Clean warm white background",
    category: "solid",
  },
];

/**
 * Get bundled background by ID
 */
export function getBundledBackground(id: string): BundledBackground | null {
  return BUNDLED_BACKGROUNDS.find((bg) => bg.id === id) || null;
}

/**
 * Get all bundled backgrounds by category
 */
export function getBundledBackgroundsByCategory(
  category: BundledBackground["category"],
): BundledBackground[] {
  return BUNDLED_BACKGROUNDS.filter((bg) => bg.category === category);
}

/**
 * Get random bundled background
 */
export function getRandomBundledBackground(): BundledBackground {
  const randomIndex = Math.floor(Math.random() * BUNDLED_BACKGROUNDS.length);
  return BUNDLED_BACKGROUNDS[randomIndex];
}

/**
 * Get bundled background for poster export
 * Prioritizes CORS-safe bundled assets over external images
 */
export async function getSafeBackgroundForExport(
  preferredUrl?: string,
): Promise<BundledBackground> {
  // If no preferred URL or if it's external (picsum), use bundled
  if (!preferredUrl || preferredUrl.includes("picsum.photos")) {
    return getRandomBundledBackground();
  }

  // Check if the preferred URL is a bundled background
  const bundledBg = BUNDLED_BACKGROUNDS.find((bg) => bg.url === preferredUrl);
  if (bundledBg) {
    return bundledBg;
  }

  // Fallback to bundled background for CORS safety
  return getRandomBundledBackground();
}

/**
 * Generate CSS gradient fallback for bundled backgrounds
 */
export function generateBundledGradient(id: string): string {
  const gradients: Record<string, string> = {
    "gradient-purple-blue": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "gradient-orange-pink": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "gradient-teal-green": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "solid-deep-slate": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    "solid-warm-white": "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  };

  return gradients[id] || gradients["gradient-purple-blue"];
}

/**
 * Create a canvas-compatible background URL
 * Ensures the URL is CORS-safe for canvas operations
 */
export function createCanvasSafeBackgroundUrl(backgroundId: string): string {
  const background = getBundledBackground(backgroundId);
  if (background) {
    return background.url;
  }

  // Fallback to default bundled background
  return BUNDLED_BACKGROUNDS[0].url;
}
