"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface RechartsComponentProps {
  type?: "line" | "bar" | "pie" | "doughnut";
  data: ChartData;
  title?: string;
  height?: number;
  width?: number;
}

// Transform data for Recharts format
const transformDataForRecharts = (data: ChartData, type: string) => {
  if (type === "pie" || type === "doughnut") {
    return data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index],
      fill:
        data.datasets[0].backgroundColor[index] ||
        data.datasets[0].backgroundColor[0],
    }));
  }

  return data.labels.map((label, index) => ({
    name: label,
    [data.datasets[0].label]: data.datasets[0].data[index],
  }));
};

// Heavy chart component using Recharts library
const RechartsComponent: React.FC<RechartsComponentProps> = ({
  type = "line",
  data,
  title = "Chart",
  height = 300,
  width = "100%",
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading time for heavy chart library
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div
        className="w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 animate-spin"></div>
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  const transformedData = transformDataForRecharts(data, type);
  const COLORS = [
    "#7C3AED",
    "#A855F7",
    "#C084FC",
    "#DDD6FE",
    "#F3E8FF",
    "#FDF4FF",
    "#FEF7FF",
  ];

  const renderChart = (): React.ReactElement => {
    const commonProps = {
      data: transformedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={data.datasets[0].label}
              stroke={data.datasets[0].borderColor}
              strokeWidth={3}
              dot={{ fill: data.datasets[0].borderColor, strokeWidth: 2, r: 6 }}
              activeDot={{
                r: 8,
                stroke: data.datasets[0].borderColor,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={data.datasets[0].label}
              fill={data.datasets[0].backgroundColor}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case "pie":
      case "doughnut":
        return (
          <PieChart>
            <Pie
              data={transformedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={type === "doughnut" ? 80 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              {transformedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div
        className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        style={{ height }}
      >
        <ResponsiveContainer width={width} height="100%">
          {renderChart()}
        </ResponsiveContainer>
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

export default RechartsComponent;
