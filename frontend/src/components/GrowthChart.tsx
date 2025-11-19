/**
 * Bar chart component for visualizing year-over-year growth metrics.
 */

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatPercentage } from '@/lib/api';

interface GrowthChartProps {
  data: Array<{
    year: number;
    yoy_spending_growth: number | null;
  }>;
  title?: string;
  height?: number;
}

export default function GrowthChart({
  data,
  title = 'Year-over-Year Spending Growth',
  height = 300,
}: GrowthChartProps) {
  // Filter out null values
  const validData = data.filter((d) => d.yoy_spending_growth !== null);

  if (validData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-500">
          No year-over-year growth data available (requires at least 2 consecutive years of data).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        This chart shows the percentage change in spending compared to the prior year. Positive
        values indicate spending increased, while negative values indicate it decreased.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Growth Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => formatPercentage(value)}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar
            dataKey="yoy_spending_growth"
            name="YoY Growth %"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
