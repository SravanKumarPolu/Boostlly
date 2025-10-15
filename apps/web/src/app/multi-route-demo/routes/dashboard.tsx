"use client";

import React from "react";

interface DashboardRouteProps {
  onLoad?: () => void;
}

export const DashboardRoute: React.FC<DashboardRouteProps> = ({ onLoad }) => {
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Users",
            value: "12,543",
            change: "+12%",
            color: "green",
          },
          { title: "Revenue", value: "$45,678", change: "+8%", color: "blue" },
          { title: "Orders", value: "3,421", change: "+15%", color: "purple" },
          {
            title: "Conversion",
            value: "3.2%",
            change: "-2%",
            color: "orange",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.title}
            </h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div
              className={`text-sm ${
                stat.color === "green"
                  ? "text-green-600"
                  : stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "purple"
                      ? "text-purple-600"
                      : "text-orange-600"
              }`}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                action: "New user registered",
                time: "2 minutes ago",
                type: "user",
              },
              {
                action: "Order completed",
                time: "5 minutes ago",
                type: "order",
              },
              {
                action: "Payment received",
                time: "12 minutes ago",
                type: "payment",
              },
              {
                action: "Report generated",
                time: "1 hour ago",
                type: "report",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "user"
                      ? "bg-green-500"
                      : activity.type === "order"
                        ? "bg-blue-500"
                        : activity.type === "payment"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add User", icon: "👤", color: "blue" },
              { label: "Create Report", icon: "📊", color: "green" },
              { label: "View Analytics", icon: "📈", color: "purple" },
              { label: "Settings", icon: "⚙️", color: "gray" },
            ].map((action, index) => (
              <button
                key={index}
                className={`p-3 rounded-lg border-2 border-transparent hover:border-current transition-colors ${
                  action.color === "blue"
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-700"
                    : action.color === "green"
                      ? "bg-green-50 hover:bg-green-100 text-green-700"
                      : action.color === "purple"
                        ? "bg-purple-50 hover:bg-purple-100 text-purple-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="text-2xl mb-1">{action.icon}</div>
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-green-600 mr-2">✅</span>
          <span className="text-green-800 font-medium">
            Dashboard route loaded successfully
          </span>
        </div>
        <div className="text-green-600 text-sm mt-1">
          This component was loaded using code splitting and is now cached for
          future visits.
        </div>
      </div>
    </div>
  );
};
