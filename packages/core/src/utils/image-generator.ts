import { logError, logDebug, logWarning } from "./logger";
import html2canvas from "html2canvas";
import {
  getSafeBackgroundForExport,
  createCanvasSafeBackgroundUrl,
} from "./bundled-backgrounds";

export interface QuoteImageOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  logoUrl?: string;
}

export async function generateQuoteImage(
  quoteText: string,
  author: string,
  options: QuoteImageOptions = {},
): Promise<string> {
  const {
    width = 800,
    height = 600,
    backgroundColor = "#1e293b",
    textColor = "#ffffff",
    fontSize = 24,
    logoUrl = "/boostlly-logo.png",
  } = options;

  // Validate inputs
  if (!quoteText || !author) {
    throw new Error("Quote text and author are required");
  }

  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Image generation requires browser environment");
  }

  // Get CORS-safe background for poster export
  let safeBackgroundUrl: string;
  try {
    const bundledBackground = await getSafeBackgroundForExport();
    safeBackgroundUrl = bundledBackground.url;
  } catch (error) {
    logWarning("Failed to get bundled background, using fallback", { error });
    safeBackgroundUrl = createCanvasSafeBackgroundUrl("gradient-purple-blue");
  }

  // Create a temporary container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.padding = "40px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.borderRadius = "16px";
  container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";

  // Use CORS-safe background image or fallback to gradient
  container.style.backgroundImage = `url(${safeBackgroundUrl})`;
  container.style.backgroundSize = "cover";
  container.style.backgroundPosition = "center";
  container.style.backgroundRepeat = "no-repeat";

  // Fallback gradient background
  container.style.backgroundColor = backgroundColor;

  // Create quote content
  const quoteContent = document.createElement("div");
  quoteContent.style.textAlign = "center";
  quoteContent.style.maxWidth = "90%";

  // Quote text
  const quoteElement = document.createElement("p");
  quoteElement.textContent = `"${quoteText}"`;
  quoteElement.style.fontSize = `${fontSize}px`;
  quoteElement.style.fontWeight = "600";
  quoteElement.style.color = textColor;
  quoteElement.style.lineHeight = "1.5";
  quoteElement.style.marginBottom = "20px";
  quoteElement.style.fontStyle = "italic";

  // Author
  const authorElement = document.createElement("p");
  authorElement.textContent = `— ${author}`;
  authorElement.style.fontSize = `${fontSize * 0.7}px`;
  authorElement.style.color = textColor;
  authorElement.style.opacity = "0.8";
  authorElement.style.marginBottom = "30px";

  // Logo with error handling
  const logoElement = document.createElement("img");
  logoElement.src = logoUrl;
  logoElement.style.width = "40px";
  logoElement.style.height = "40px";
  logoElement.style.borderRadius = "8px";
  logoElement.style.marginBottom = "10px";
  logoElement.onerror = () => {
    // If logo fails to load, hide it
    logoElement.style.display = "none";
  };

  // App name
  const appNameElement = document.createElement("p");
  appNameElement.textContent = "Boostlly";
  appNameElement.style.fontSize = "14px";
  appNameElement.style.color = textColor;
  appNameElement.style.opacity = "0.6";
  appNameElement.style.fontWeight = "500";

  // Assemble the content
  quoteContent.appendChild(quoteElement);
  quoteContent.appendChild(authorElement);
  quoteContent.appendChild(logoElement);
  quoteContent.appendChild(appNameElement);

  container.appendChild(quoteContent);
  document.body.appendChild(container);

  try {
    // Check if html2canvas is available
    if (typeof html2canvas === "undefined") {
      throw new Error("html2canvas is not available");
    }

    // Generate canvas with CORS-safe settings
    const canvas = await html2canvas(container, {
      width,
      height,
      backgroundColor: "transparent",
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false, // Disable taint to ensure CORS compliance
      logging: false, // Disable logging for production
      onclone: (clonedDoc: Document) => {
        // Ensure the cloned document has the same styles
        const clonedContainer = clonedDoc.querySelector("div");
        if (clonedContainer) {
          clonedContainer.style.position = "absolute";
          clonedContainer.style.left = "-9999px";
          clonedContainer.style.top = "-9999px";
          // Ensure background image is properly cloned
          clonedContainer.style.backgroundImage = `url(${safeBackgroundUrl})`;
          clonedContainer.style.backgroundSize = "cover";
          clonedContainer.style.backgroundPosition = "center";
          clonedContainer.style.backgroundRepeat = "no-repeat";
        }
      },
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL("image/png");

    // Clean up
    document.body.removeChild(container);

    return dataUrl;
  } catch (error) {
    // Clean up on error
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    logError("Image generation failed:", { error: error });

    // Return a fallback data URL or re-throw the error
    throw new Error(
      `Failed to generate quote image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function downloadImage(
  dataUrl: string,
  filename: string = "quote.png",
): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
