"use client";

import React, { useState, useEffect, ReactNode } from "react";

interface ChartWrapperProps {
  children: (recharts: any) => ReactNode;
  fallback?: ReactNode;
}

/**
 * ChartWrapper - Dynamically loads recharts and renders children
 * Falls back gracefully if recharts is not available
 */
export function ChartWrapper({ children, fallback }: ChartWrapperProps) {
  const [recharts, setRecharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadRecharts = async () => {
      try {
        // Try to dynamically import recharts
        // @ts-ignore - recharts may not be installed in all environments
        const rechartsModule = await import("recharts");
        if (mounted) {
          setRecharts(rechartsModule);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Recharts not available:", err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadRecharts();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error || !recharts) {
    return fallback || (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>Charts are not available in this environment.</p>
      </div>
    );
  }

  return <>{children(recharts)}</>;
}

