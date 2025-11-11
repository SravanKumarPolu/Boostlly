"use client";

import React from "react";
import { ChartWrapper } from "./ChartWrapper";

interface ChartData {
  date?: string;
  name?: string;
  value?: number;
  quotes?: number;
  [key: string]: any;
}

interface AreaChartProps {
  data: ChartData[];
  dataKey: string;
  color: string;
  height?: number;
  xAxisFormatter?: (value: string) => string;
  tooltipFormatter?: (value: string) => string;
}

export function StatAreaChart({ data, dataKey, color, height = 300, xAxisFormatter, tooltipFormatter }: AreaChartProps) {
  return (
    <ChartWrapper
      fallback={
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Chart not available</p>
        </div>
      }
    >
      {(recharts) => {
        const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = recharts;
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                tickFormatter={xAxisFormatter || ((value: any) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                })}
                style={{ fontSize: "12px" }}
              />
              <YAxis style={{ fontSize: "12px" }} />
              <Tooltip
                labelFormatter={tooltipFormatter || ((value: any) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                })}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fillOpacity={1}
                fill={`url(#gradient-${dataKey})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }}
    </ChartWrapper>
  );
}

interface BarChartProps {
  data: ChartData[];
  dataKey: string;
  color: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  xAxisAngle?: number;
}

export function StatBarChart({ data, dataKey, color, height = 300, layout, xAxisAngle }: BarChartProps) {
  return (
    <ChartWrapper
      fallback={
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Chart not available</p>
        </div>
      }
    >
      {(recharts) => {
        const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = recharts;
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout={layout}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              {layout === "vertical" ? (
                <>
                  <XAxis type="number" style={{ fontSize: "12px" }} />
                  <YAxis dataKey="name" type="category" width={100} style={{ fontSize: "12px" }} />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    angle={xAxisAngle || 0}
                    textAnchor={xAxisAngle ? "end" : "middle"}
                    height={xAxisAngle ? 80 : undefined}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis style={{ fontSize: "12px" }} />
                </>
              )}
              <Tooltip />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }}
    </ChartWrapper>
  );
}

interface PieChartProps {
  data: Array<{ name: string; value: number; fill?: string }>;
  height?: number;
  outerRadius?: number;
}

export function StatPieChart({ data, height = 300, outerRadius = 100 }: PieChartProps) {
  return (
    <ChartWrapper
      fallback={
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Chart not available</p>
        </div>
      }
    >
      {(recharts) => {
        const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = recharts;
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => {
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || `#${Math.floor(Math.random() * 16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }}
    </ChartWrapper>
  );
}

