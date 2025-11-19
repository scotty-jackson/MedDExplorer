/**
 * Area chart component for visualizing beneficiary count over time.
 */

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BeneficiariesChartProps {
  data: Array<{
    year: number;
    beneficiaries_count: number | null;
  }>;
  title?: string;
  height?: number;
}

export default function BeneficiariesChart({
  data,
  title = 'Beneficiaries Over Time',
  height = 300,
}: BeneficiariesChartProps) {
  // Filter out null values
  const validData = data.filter((d) => d.beneficiaries_count !== null);

  if (validData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-500">No beneficiary data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        This chart shows the number of Medicare Part D beneficiaries who received prescriptions
        for this drug each year.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={validData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(1)}M`
                : value >= 1000
                ? `${(value / 1000).toFixed(0)}K`
                : value.toString()
            }
            label={{ value: 'Beneficiaries', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => value.toLocaleString()}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="beneficiaries_count"
            name="Beneficiaries"
            stroke="#16a34a"
            fill="#86efac"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
