import { QuoteService } from "@boostlly/core";
import { StorageService } from "@boostlly/platform-extension";

const storage = new StorageService();
const quoteService = new QuoteService(storage);

// Inject motivation widget into web pages
function injectMotivationWidget() {
  // Prevent injection on localhost, 127.0.0.1, boostlly domains, or if boostlly-app meta tag exists
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("boostlly") ||
    document.querySelector('meta[name="boostlly-app"]') ||
    !document.body ||
    document.getElementById("boostlly-widget")
  ) {
    return;
  }

  try {
    const widget = document.createElement("div");
    widget.id = "boostlly-widget";
    widget.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const quote = quoteService.getRandomQuote();
    widget.innerHTML = `
      <div role="banner" style="margin-bottom: 8px; font-weight: 600; color: #374151;">Boostlly</div>
      <blockquote style="font-style: italic; color: #6b7280; margin-bottom: 8px;" aria-label="Motivational quote">"${quote.text}"</blockquote>
      <cite style="font-size: 12px; color: #9ca3af;" aria-label="Quote author">— ${quote.author}</cite>
      <button 
        id="boostlly-close" 
        style="position: absolute; top: 8px; right: 8px; background: none; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; font-size: 16px; color: #6b7280; padding: 4px 8px; min-width: 24px; min-height: 24px;"
        aria-label="Close Boostlly widget"
        title="Close this motivational quote widget"
      >×</button>
    `;

    document.body.appendChild(widget);

    // Add close functionality with keyboard support
    const closeButton = document.getElementById("boostlly-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        widget.remove();
      });

      // Keyboard support for close button
      closeButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          widget.remove();
        } else if (e.key === "Escape") {
          widget.remove();
        }
      });
    }

    // Add keyboard support for the entire widget
    widget.setAttribute("tabindex", "0");
    widget.setAttribute("role", "dialog");
    widget.setAttribute("aria-label", "Motivational quote widget");
    widget.setAttribute("aria-modal", "false");

    // Make widget focusable and add escape key support
    widget.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        widget.remove();
      }
    });
  } catch (error) {
    console.warn("Failed to inject Boostlly widget:", error);
  }
}

// Inject widget after page loads with multiple fallbacks
function initializeWidget() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMotivationWidget);
  } else if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    injectMotivationWidget();
  } else {
    // Fallback: wait a bit and try again
    setTimeout(injectMotivationWidget, 100);
  }
}

// Initialize immediately
initializeWidget();

// Also try on window load as a fallback
window.addEventListener("load", injectMotivationWidget);
