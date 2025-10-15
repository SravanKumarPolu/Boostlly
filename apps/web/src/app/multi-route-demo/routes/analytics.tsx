"use client";

import React from "react";

interface AnalyticsRouteProps {
  onLoad?: () => void;
}

export const AnalyticsRoute: React.FC<AnalyticsRouteProps> = ({ onLoad }) => {
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Traffic Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Page Views", value: "45,678", change: "+12%" },
                { label: "Unique Visitors", value: "23,456", change: "+8%" },
                { label: "Bounce Rate", value: "34.5%", change: "-2%" },
                { label: "Avg. Session", value: "2m 34s", change: "+5%" },
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {metric.value}
                  </div>
                  <div className="text-sm text-purple-600 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-purple-500">{metric.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Top Pages</h4>
            <div className="space-y-2">
              {[
                { page: "/dashboard", views: "12,345", percentage: "27%" },
                { page: "/analytics", views: "8,901", percentage: "19%" },
                { page: "/reports", views: "6,543", percentage: "14%" },
                { page: "/settings", views: "4,321", percentage: "9%" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.page}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.views} views
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-purple-600">
                    {item.percentage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { device: "Desktop", percentage: 45, color: "blue" },
              { device: "Mobile", percentage: 35, color: "green" },
              { device: "Tablet", percentage: 20, color: "purple" },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.device}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.color === "blue"
                        ? "bg-blue-500"
                        : item.color === "green"
                          ? "bg-green-500"
                          : "bg-purple-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {[
              { country: "United States", visitors: "12,345", flag: "🇺🇸" },
              { country: "United Kingdom", visitors: "8,901", flag: "🇬🇧" },
              { country: "Canada", visitors: "6,543", flag: "🇨🇦" },
              { country: "Australia", visitors: "4,321", flag: "🇦🇺" },
              { country: "Germany", visitors: "3,210", flag: "🇩🇪" },
            ].map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {country.country}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {country.visitors}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Analytics Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tool: "Google Analytics", status: "Connected", icon: "📊" },
            { tool: "Mixpanel", status: "Connected", icon: "📈" },
            { tool: "Hotjar", status: "Disconnected", icon: "🔥" },
          ].map((tool, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{tool.icon}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    tool.status === "Connected"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tool.status}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-800">
                {tool.tool}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">✅</span>
          <span className="text-blue-800 font-medium">
            Analytics route loaded successfully
          </span>
        </div>
        <div className="text-blue-600 text-sm mt-1">
          This analytics dashboard was loaded on-demand using code splitting.
        </div>
      </div>
    </div>
  );
};
