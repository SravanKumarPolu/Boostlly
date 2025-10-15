// Check if we're in a Chrome extension
function isChromeExtension(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    "chrome" in globalThis &&
    (globalThis as any).chrome?.runtime &&
    (globalThis as any).chrome?.runtime?.id !== undefined
  );
}

// Use background worker for fetching in Chrome extensions (bypasses CORS)
export async function extensionFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  if (!isChromeExtension()) {
    return fetch(url, options);
  }

  // Send fetch request to background worker
  const chromeRuntime = (globalThis as any).chrome.runtime;
  return new Promise((resolve, reject) => {
    chromeRuntime.sendMessage(
      {
        type: "FETCH_QUOTE",
        url,
        options: options
          ? {
              method: options.method,
              headers: options.headers,
              cache: options.cache,
            }
          : {},
      },
      (response: any) => {
        if (chromeRuntime.lastError) {
          reject(new Error(chromeRuntime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error("No response from background worker"));
          return;
        }

        if (!response.success) {
          reject(new Error(response.error || "Fetch failed"));
          return;
        }

        // Create a mock Response object
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => response.data,
          text: async () =>
            typeof response.data === "string"
              ? response.data
              : JSON.stringify(response.data),
        } as Response;

        resolve(mockResponse);
      },
    );
  });
}

export function maybeProxy(url: string): string {
  if (typeof window === "undefined") return url;
  
  // Don't proxy in Chrome extensions - they can access APIs directly via background worker
  if (isChromeExtension()) return url;
  
  try {
    const u = new URL(url);
    // If CORS blocks in dev, optionally proxy known hosts
    const shouldProxy = (window as any)?.__BOOSTLLY_PROXY__ === true;
    if (!shouldProxy) return url;
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(u.toString())}`;
  } catch {
    return url;
  }
}
