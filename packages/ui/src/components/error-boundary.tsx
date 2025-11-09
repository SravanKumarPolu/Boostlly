"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logError } from "@boostlly/core";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logError(error, { errorInfo }, "ErrorBoundary");

    // Optionally integrate with monitoring; intentionally no-op by default

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full border border-destructive/20">
            <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              We encountered an unexpected error. Don't worry, your data is
              safe.
            </p>
          </div>

          <Button
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Retry loading the component"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
