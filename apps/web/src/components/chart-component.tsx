"use client";

import React from "react";

// Mock chart data interface
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface ChartComponentProps {
  type?: "line" | "bar" | "pie" | "doughnut";
  data: ChartData;
  title?: string;
  height?: number;
}

// This is a heavy component that simulates a chart library
const ChartComponent: React.FC<ChartComponentProps> = ({
  type = "line",
  data,
  title = "Chart",
  height = 300,
}) => {
  // Simulate heavy computation
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading time for heavy chart library
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div
        className="w-full bg-gray-100 animate-pulse rounded-lg"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  // Mock chart rendering (in real app, this would use a chart library like Chart.js, Recharts, etc.)
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div
        className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200"
        style={{ height }}
      >
        {/* Mock chart visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-gray-600 font-medium">
              {type.toUpperCase()} Chart
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {data.datasets[0]?.data.length || 0} data points
            </div>
          </div>
        </div>

        {/* Mock data visualization */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-end h-20">
            {data.datasets[0]?.data.slice(0, 6).map((value, index) => (
              <div
                key={index}
                className="bg-purple-400 rounded-t-sm"
                style={{
                  height: `${(value / Math.max(...data.datasets[0].data)) * 100}%`,
                  width: "12%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart info */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Type:</span>
          <span className="ml-2 font-medium capitalize">{type}</span>
        </div>
        <div>
          <span className="text-gray-600">Data Points:</span>
          <span className="ml-2 font-medium">
            {data.datasets[0]?.data.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
