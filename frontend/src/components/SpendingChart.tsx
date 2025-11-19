/**
 * Line chart component for visualizing drug spending over time.
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatLargeNumber } from '@/lib/api';

interface SpendingChartProps {
  data: Array<{
    year: number;
    total_spending: number;
  }>;
  title?: string;
  height?: number;
}

export default function SpendingChart({
  data,
  title = 'Total Spending Over Time',
  height = 300,
}: SpendingChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        This chart shows the total gross drug cost (spending) by year. The spending includes
        the full cost of the drug before any rebates or discounts.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(value) => formatLargeNumber(value)}
            label={{ value: 'Total Spending', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => formatLargeNumber(value)}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total_spending"
            name="Total Spending"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
