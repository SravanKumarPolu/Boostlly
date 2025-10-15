"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@boostlly/ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk") ||
      error.message.includes("ChunkLoadError") ||
      error.message.includes("timeout");

    return {
      hasError: true,
      error,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);

    // Log to error reporting service if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
        error_type: "chunk_loading_error",
      });
    }
  }

  handleRetry = () => {
    // Clear the error state
    this.setState({ hasError: false, error: undefined, isChunkError: false });

    // Force a page reload to retry chunk loading
    window.location.reload();
  };

  handleClearCache = () => {
    // Clear service worker cache if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Clear browser cache for this domain
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes("boostlly") || name.includes("next")) {
            caches.delete(name);
          }
        });
      });
    }

    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-background/10 backdrop-blur-xl rounded-2xl border border-border p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Chunk Loading Error
                </h1>
                <p className="text-muted-foreground mb-6">
                  There was an issue loading a part of the application. This
                  usually happens due to network issues or cached files.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={this.handleRetry} className="w-full">
                  🔄 Try Again
                </Button>

                <Button
                  onClick={this.handleClearCache}
                  variant="outline"
                  className="w-full"
                >
                  🗑️ Clear Cache & Retry
                </Button>
              </div>

              <div className="mt-6 text-xs text-muted-foreground/70">
                <p>If the problem persists, try:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Refreshing the page</li>
                  <li>• Checking your internet connection</li>
                  <li>• Clearing browser cache</li>
                </ul>
              </div>
            </div>
          </div>
        );
      }

      // Fallback for other errors
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-background/10 backdrop-blur-xl rounded-2xl border border-border p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mb-6">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
              </div>

              <Button onClick={this.handleRetry} className="w-full">
                🔄 Refresh Page
              </Button>

              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-muted-foreground cursor-pointer text-sm">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground/70 bg-background/20 p-3 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
