"use client";

import React, { useState } from "react";

interface ReportsRouteProps {
  onLoad?: () => void;
}

export const ReportsRoute: React.FC<ReportsRouteProps> = ({ onLoad }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const reports = [
    {
      id: "user-activity",
      title: "User Activity Report",
      description: "Detailed analysis of user engagement and activity patterns",
      icon: "📊",
      color: "blue",
      lastGenerated: "2 hours ago",
    },
    {
      id: "sales-summary",
      title: "Sales Summary",
      description: "Monthly sales performance and revenue analysis",
      icon: "💰",
      color: "green",
      lastGenerated: "1 day ago",
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      description: "System performance and optimization insights",
      icon: "⚡",
      color: "purple",
      lastGenerated: "3 hours ago",
    },
    {
      id: "error-analysis",
      title: "Error Analysis",
      description: "Error logs and system stability reports",
      icon: "🔍",
      color: "red",
      lastGenerated: "6 hours ago",
    },
  ];

  const generateReport = (reportId: string) => {
    setSelectedReport(reportId);
    // Simulate report generation
    setTimeout(() => {
      setSelectedReport(null);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Generate All Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedReport === report.id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{report.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.color === "blue"
                    ? "bg-blue-100 text-blue-800"
                    : report.color === "green"
                      ? "bg-green-100 text-green-800"
                      : report.color === "purple"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {report.color}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Last generated: {report.lastGenerated}
              </div>
              <button
                onClick={() => generateReport(report.id)}
                disabled={selectedReport === report.id}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedReport === report.id
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {selectedReport === report.id ? "Generating..." : "Generate"}
              </button>
            </div>

            {selectedReport === report.id && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-purple-600 font-medium">
                    Generating report...
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-gray-50 p-6 rounded-lg border mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Reports
        </h3>
        <div className="space-y-3">
          {[
            {
              name: "User Activity Report",
              date: "2024-01-15",
              size: "2.3 MB",
              type: "PDF",
            },
            {
              name: "Sales Summary",
              date: "2024-01-14",
              size: "1.8 MB",
              type: "Excel",
            },
            {
              name: "Performance Metrics",
              date: "2024-01-13",
              size: "945 KB",
              type: "PDF",
            },
            {
              name: "Error Analysis",
              date: "2024-01-12",
              size: "1.2 MB",
              type: "PDF",
            },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  {report.type === "PDF" ? "📄" : "📊"}
                </span>
                <div>
                  <div className="font-medium text-gray-800">{report.name}</div>
                  <div className="text-sm text-gray-500">
                    Generated on {report.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{report.size}</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">
          Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Executive Summary",
              description: "High-level overview for management",
              icon: "👔",
            },
            {
              name: "Technical Report",
              description: "Detailed technical analysis",
              icon: "🔧",
            },
            {
              name: "Marketing Report",
              description: "Marketing performance metrics",
              icon: "📈",
            },
          ].map((template, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-purple-200"
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <h4 className="font-medium text-purple-800 mb-1">
                {template.name}
              </h4>
              <p className="text-sm text-purple-600 mb-3">
                {template.description}
              </p>
              <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-purple-600 mr-2">📋</span>
          <span className="text-purple-800 font-medium">
            Reports route loaded successfully
          </span>
        </div>
        <div className="text-purple-600 text-sm mt-1">
          This reports dashboard was loaded on-demand using code splitting.
        </div>
      </div>
    </div>
  );
};
