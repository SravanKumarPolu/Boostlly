"use client";

import React, { useState, useEffect } from "react";
import { PageSkeleton } from "../../components/loading-fallbacks";
import {
  ViewportLazyLoader,
  createLazyPage,
} from "../../components/lazy-loading-utils";

// Lazy load different dashboard sections
const UserStats = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="bar" title="User Statistics" />
    ),
  })),
);

const ActivityFeed = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="line" title="Activity Feed" />
    ),
  })),
);

const QuickActions = React.lazy(() =>
  import("../../components/chart-component").then((module) => ({
    default: (props: any) => (
      <module.default {...props} type="pie" title="Quick Actions" />
    ),
  })),
);

// Mock data for different sections
const generateMockData = (type: string) => ({
  labels: Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`),
  datasets: [
    {
      label: `${type} Data`,
      data: Array.from(
        { length: 5 },
        () => Math.floor(Math.random() * 100) + 10,
      ),
      backgroundColor:
        type === "bar" ? "#7C3AED" : type === "line" ? "#10B981" : "#F59E0B",
      borderColor:
        type === "bar" ? "#7C3AED" : type === "line" ? "#10B981" : "#F59E0B",
    },
  ],
});

// Dashboard Section Component
const DashboardSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isLazy?: boolean;
}> = ({ title, children, isLazy = true }) => (
  <div className="bg-white rounded-lg shadow-lg border p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    {isLazy ? (
      <ViewportLazyLoader fallback={<PageSkeleton />}>
        {children}
      </ViewportLazyLoader>
    ) : (
      children
    )}
  </div>
);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const [mockData, setMockData] = useState<{
    bar: any;
    line: any;
    pie: any;
  }>({
    bar: { labels: [], datasets: [] },
    line: { labels: [], datasets: [] },
    pie: { labels: [], datasets: [] },
  });

  useEffect(() => {
    // Generate mock data only on client side
    setMockData({
      bar: generateMockData("bar"),
      line: generateMockData("line"),
      pie: generateMockData("pie"),
    });
  }, []);

  const handleSectionLoad = (section: string) => {
    setLoadedSections((prev) => new Set([...prev, section]));
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Multi-route code splitting demonstration with lazy-loaded sections
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              <DashboardSection title="User Statistics">
                <React.Suspense fallback={<PageSkeleton />}>
                  <UserStats data={mockData.bar} height={300} />
                </React.Suspense>
              </DashboardSection>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Activity Feed">
                  <React.Suspense fallback={<PageSkeleton />}>
                    <ActivityFeed data={mockData.line} height={250} />
                  </React.Suspense>
                </DashboardSection>

                <DashboardSection title="Quick Actions">
                  <React.Suspense fallback={<PageSkeleton />}>
                    <QuickActions data={mockData.pie} height={250} />
                  </React.Suspense>
                </DashboardSection>
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <DashboardSection title="Advanced Analytics">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 mb-4">
                  This section would contain more complex analytics components
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                  <span className="mr-2">✅</span>
                  Code splitting active - loaded on demand
                </div>
              </div>
            </DashboardSection>
          )}

          {activeTab === "settings" && (
            <DashboardSection title="Settings & Configuration">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Settings Panel
                </h3>
                <p className="text-gray-600 mb-4">
                  This section would contain configuration options
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <span className="mr-2">✅</span>
                  Lazy loaded when needed
                </div>
              </div>
            </DashboardSection>
          )}
        </div>

        {/* Performance Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            🎯 Code Splitting in Action
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
            <div>
              <h4 className="font-medium mb-2">Route-based Splitting:</h4>
              <p>Each tab loads only its required components</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Component-based Splitting:</h4>
              <p>Charts load individually when needed</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Viewport-based Loading:</h4>
              <p>Components load when they come into view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
