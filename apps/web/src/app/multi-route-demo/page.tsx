"use client";

import React, { useState } from "react";
import { ViewportLazyLoader } from "../../components/lazy-loading-utils";
import { PageSkeleton } from "../../components/loading-fallbacks";

// Lazy load different route components
const DashboardRoute = React.lazy(() =>
  import("./routes/dashboard").then((module) => ({
    default: module.DashboardRoute,
  })),
);

const AnalyticsRoute = React.lazy(() =>
  import("./routes/analytics").then((module) => ({
    default: module.AnalyticsRoute,
  })),
);

const SettingsRoute = React.lazy(() =>
  import("./routes/settings").then((module) => ({
    default: module.SettingsRoute,
  })),
);

const ReportsRoute = React.lazy(() =>
  import("./routes/reports").then((module) => ({
    default: module.ReportsRoute,
  })),
);

const UsersRoute = React.lazy(() =>
  import("./routes/users").then((module) => ({
    default: module.UsersRoute,
  })),
);

// Route configuration
const routes = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "🏠",
    description: "Main dashboard with overview",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    description: "Advanced analytics and metrics",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "📋",
    description: "Generate and view reports",
  },
  {
    id: "users",
    label: "Users",
    icon: "👥",
    description: "User management and profiles",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    description: "Application configuration",
  },
];

// Navigation component
const Navigation: React.FC<{
  activeRoute: string;
  onRouteChange: (route: string) => void;
  loadedRoutes: Set<string>;
}> = ({ activeRoute, onRouteChange, loadedRoutes }) => (
  <div className="bg-white rounded-lg shadow-lg border mb-6">
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => onRouteChange(route.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeRoute === route.id
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{route.icon}</span>
              <span>{route.label}</span>
              {loadedRoutes.has(route.id) && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Loaded
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  </div>
);

// Route content renderer
const RouteContent: React.FC<{
  routeId: string;
  isLazy: boolean;
  loadedRoutes: Set<string>;
  onRouteLoad: (route: string) => void;
}> = ({ routeId, isLazy, loadedRoutes, onRouteLoad }) => {
  const renderRoute = () => {
    switch (routeId) {
      case "dashboard":
        return <DashboardRoute onLoad={() => onRouteLoad("dashboard")} />;
      case "analytics":
        return <AnalyticsRoute onLoad={() => onRouteLoad("analytics")} />;
      case "settings":
        return <SettingsRoute onLoad={() => onRouteLoad("settings")} />;
      case "reports":
        return <ReportsRoute onLoad={() => onRouteLoad("reports")} />;
      case "users":
        return <UsersRoute onLoad={() => onRouteLoad("users")} />;
      default:
        return <div>Route not found</div>;
    }
  };

  if (isLazy) {
    return (
      <ViewportLazyLoader fallback={<PageSkeleton />}>
        <React.Suspense fallback={<PageSkeleton />}>
          {renderRoute()}
        </React.Suspense>
      </ViewportLazyLoader>
    );
  }

  return (
    <React.Suspense fallback={<PageSkeleton />}>{renderRoute()}</React.Suspense>
  );
};

// Performance metrics
const PerformanceMetrics: React.FC<{
  loadedRoutes: Set<string>;
  loadTimes: Record<string, number>;
}> = ({ loadedRoutes, loadTimes }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Route Loading Performance
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routes.map((route) => (
        <div
          key={route.id}
          className={`p-4 rounded-lg border-2 ${
            loadedRoutes.has(route.id)
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              {route.icon} {route.label}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                loadedRoutes.has(route.id)
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {loadedRoutes.has(route.id) ? "Loaded" : "Not Loaded"}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-1">{route.description}</div>
          {loadTimes[route.id] && (
            <div className="text-xs text-green-600">
              Load time: {loadTimes[route.id]}ms
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Loading strategy selector
const LoadingStrategySelector: React.FC<{
  strategy: string;
  onStrategyChange: (strategy: string) => void;
}> = ({ strategy, onStrategyChange }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border mb-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Route Loading Strategy
    </h3>
    <div className="flex flex-wrap gap-3">
      {[
        {
          id: "immediate",
          label: "Immediate Loading",
          description: "Loads route components immediately",
        },
        {
          id: "lazy",
          label: "Lazy Loading",
          description: "Loads route components when accessed",
        },
        {
          id: "viewport",
          label: "Viewport Loading",
          description: "Loads when scrolling into view",
        },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onStrategyChange(item.id)}
          className={`p-4 rounded-lg border-2 transition-all ${
            strategy === item.id
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }`}
        >
          <div className="font-medium">{item.label}</div>
          <div className="text-sm text-gray-500 mt-1">{item.description}</div>
        </button>
      ))}
    </div>
  </div>
);

export default function MultiRouteDemoPage() {
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [loadedRoutes, setLoadedRoutes] = useState<Set<string>>(new Set());
  const [loadTimes, setLoadTimes] = useState<Record<string, number>>({});
  const [loadingStrategy, setLoadingStrategy] = useState("immediate");

  const handleRouteChange = (routeId: string) => {
    setActiveRoute(routeId);
  };

  const handleRouteLoad = (routeId: string) => {
    const loadTime = Math.floor(Math.random() * 500) + 100; // Simulate load time
    setLoadedRoutes((prev) => new Set([...prev, routeId]));
    setLoadTimes((prev) => ({ ...prev, [routeId]: loadTime }));
  };

  const getIsLazy = () => {
    switch (loadingStrategy) {
      case "lazy":
        return false; // React.lazy handles this
      case "viewport":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Multi-Route Code Splitting Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Demonstrating route-based code splitting with lazy-loaded components
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Route Splitting
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Dynamic Imports
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Lazy Loading
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Performance Monitoring
            </span>
          </div>
        </div>

        {/* Loading Strategy */}
        <LoadingStrategySelector
          strategy={loadingStrategy}
          onStrategyChange={setLoadingStrategy}
        />

        {/* Navigation */}
        <Navigation
          activeRoute={activeRoute}
          onRouteChange={handleRouteChange}
          loadedRoutes={loadedRoutes}
        />

        {/* Performance Metrics */}
        <PerformanceMetrics loadedRoutes={loadedRoutes} loadTimes={loadTimes} />

        {/* Route Content */}
        <div className="space-y-6">
          <RouteContent
            routeId={activeRoute}
            isLazy={getIsLazy()}
            loadedRoutes={loadedRoutes}
            onRouteLoad={handleRouteLoad}
          />
        </div>

        {/* Implementation Guide */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-800 mb-4">
            🚀 Multi-Route Code Splitting Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-700 mb-2">
                Route-based Splitting:
              </h3>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>✅ Each route loads independently</li>
                <li>✅ Reduced initial bundle size</li>
                <li>✅ Faster page navigation</li>
                <li>✅ Better caching strategies</li>
                <li>✅ Improved user experience</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-purple-700 mb-2">
                Performance Benefits:
              </h3>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>📈 Faster initial page load</li>
                <li>📦 Smaller bundle chunks</li>
                <li>⚡ On-demand loading</li>
                <li>💾 Efficient caching</li>
                <li>🔄 Smooth navigation</li>
                <li>📊 Real-time performance tracking</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-2">
              Loading Strategies:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-600">
              <div>
                <h5 className="font-medium">Immediate Loading:</h5>
                <p>Components load as soon as route is accessed</p>
              </div>
              <div>
                <h5 className="font-medium">Lazy Loading:</h5>
                <p>Components load only when needed using React.lazy</p>
              </div>
              <div>
                <h5 className="font-medium">Viewport Loading:</h5>
                <p>Components load when they come into view</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
