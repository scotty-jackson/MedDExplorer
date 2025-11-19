/**
 * Table component for displaying top drugs by a given metric.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { TopDrugItem, formatLargeNumber, formatPercentage } from '@/lib/api';

interface TopDrugsTableProps {
  drugs: TopDrugItem[];
  metric: string;
  title?: string;
}

export default function TopDrugsTable({ drugs, metric, title }: TopDrugsTableProps) {
  const getMetricLabel = (metric: string): string => {
    const labels: Record<string, string> = {
      total_spending: 'Total Spending',
      spending_per_beneficiary: 'Cost per Beneficiary',
      yoy_spending_growth: 'YoY Growth',
      total_claims: 'Total Claims',
      spending_per_claim: 'Cost per Claim',
    };
    return labels[metric] || metric;
  };

  const formatMetricValue = (value: number, metric: string): string => {
    if (metric === 'yoy_spending_growth') {
      return formatPercentage(value);
    } else if (
      metric === 'total_spending' ||
      metric === 'spending_per_beneficiary' ||
      metric === 'spending_per_claim'
    ) {
      return formatLargeNumber(value);
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drug Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {getMetricLabel(metric)}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drugs.map((drug, index) => (
              <tr key={drug.drug_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/drug/${drug.drug_id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    {drug.generic_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {drug.brand_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {drug.drug_class_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                  {formatMetricValue(drug.metric_value, metric)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
