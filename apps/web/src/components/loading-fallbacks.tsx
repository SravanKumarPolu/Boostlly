"use client";

import React from "react";

// Enhanced loading skeleton components for better UX
export const ChartSkeleton: React.FC<{ height?: number }> = ({
  height = 300,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div
      className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ComponentSkeleton: React.FC<{
  height?: number;
  width?: string;
  className?: string;
}> = ({ height = 200, width = "100%", className = "" }) => (
  <div
    className={`bg-gray-100 rounded-lg animate-pulse ${className}`}
    style={{ height, width }}
  >
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 animate-spin"></div>
        <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
      </div>
    </div>
  </div>
);

// Error boundary for lazy loaded components
export class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy load error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <div className="text-red-800 font-medium">
              Failed to load component
            </div>
            <div className="text-red-600 text-sm mt-1">
              Please refresh the page or try again later.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Loading wrapper with retry functionality
export const LoadingWrapper: React.FC<{
  children: React.ReactNode;
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}> = ({ children, loading, error, onRetry, fallback }) => {
  if (loading) {
    return fallback || <ComponentSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <div className="text-red-800 font-medium">Loading failed</div>
        <div className="text-red-600 text-sm mt-1">{error.message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
