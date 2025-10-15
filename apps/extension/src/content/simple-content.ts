// Self-contained content script (no module imports) for MV3 compatibility

(() => {
  const quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      text: "It always seems impossible until it's done.",
      author: "Nelson Mandela",
    },
  ];

  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function injectWidget() {
    try {
      // Prevent injection on localhost, 127.0.0.1, boostlly domains, or if boostlly-app meta tag exists
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("boostlly") ||
        document.querySelector('meta[name="boostlly-app"]') ||
        !document.body ||
        document.getElementById("boostlly-widget")
      )
        return;

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

      const { text, author } = getRandomQuote();
      widget.innerHTML = `
        <div style="margin-bottom: 8px; font-weight: 600; color: #374151;">Boostlly</div>
        <div style="font-style: italic; color: #6b7280; margin-bottom: 8px;">"${text}"</div>
        <div style="font-size: 12px; color: #9ca3af;">— ${author}</div>
        <button id="boostlly-close" style="position: absolute; top: 8px; right: 8px; background: none; border: none; cursor: pointer; font-size: 16px; color: #9ca3af;">×</button>
      `;

      document.body.appendChild(widget);
      document
        .getElementById("boostlly-close")
        ?.addEventListener("click", () => widget.remove());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Boostlly content script failed to inject:", error);
    }
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectWidget);
    } else {
      injectWidget();
    }
    window.addEventListener("load", injectWidget);
  }

  init();
})();
