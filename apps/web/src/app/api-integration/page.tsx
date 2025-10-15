"use client";

import { useState, useEffect } from "react";
import { StorageService } from "@boostlly/platform-web";
import { APIIntegration } from "@boostlly/features";
import { APIExplorer } from "@boostlly/features";
import { Button } from "@boostlly/ui";
import { ArrowLeft, Globe, Activity, Settings } from "lucide-react";
import Link from "next/link";

export default function APIIntegrationPage() {
  const [storage] = useState(() => new StorageService());
  const [apiStats, setApiStats] = useState({
    totalProviders: 6,
    activeProviders: 6,
    totalRequests: 0,
    successRate: 0,
  });

  useEffect(() => {
    // Simulate loading API stats
    setApiStats({
      totalProviders: 6,
      activeProviders: 6,
      totalRequests: 1247,
      successRate: 98.5,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                API Integration
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage external quote providers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            <span className="text-muted-foreground">
              {apiStats.activeProviders}/{apiStats.totalProviders} providers
              active
            </span>
          </div>
        </div>

        {/* API Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {apiStats.totalProviders}
            </p>
            <p className="text-sm text-muted-foreground">Total Providers</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {apiStats.activeProviders}
            </p>
            <p className="text-sm text-muted-foreground">Active Providers</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Settings className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {apiStats.totalRequests}
            </p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </div>

          <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border text-center">
            <Activity className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">
              {apiStats.successRate}%
            </p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* API Explorer Component */}
        <div className="mb-8">
          <APIExplorer storage={storage} />
        </div>

        {/* API Integration Component */}
        <APIIntegration storage={storage} />
      </div>
    </div>
  );
}
