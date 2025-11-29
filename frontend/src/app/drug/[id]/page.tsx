/**
 * Drug detail page showing comprehensive metrics and time series data.
 */

import React from 'react';
import { Metadata } from 'next';
import Layout from '@/components/Layout';
import SpendingChart from '@/components/SpendingChart';
import BeneficiariesChart from '@/components/BeneficiariesChart';
import GrowthChart from '@/components/GrowthChart';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getDrugTimeSeries, formatLargeNumber, formatPercentage } from '@/lib/api';

interface DrugPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: DrugPageProps): Promise<Metadata> {
  try {
    const data = await getDrugTimeSeries(parseInt(params.id));
    const drugName = data.drug.brand_name || data.drug.generic_name;

    return {
      title: `${drugName} - Medicare Part D Spending | Drug Explorer`,
      description: `View Medicare Part D spending data for ${drugName}. Track spending trends, beneficiary counts, and year-over-year growth.`,
      keywords: [drugName, 'Medicare Part D', 'drug spending', 'prescription costs'],
    };
  } catch {
    return {
      title: 'Drug Details - Medicare Part D Explorer',
      description: 'View detailed Medicare Part D drug spending information',
    };
  }
}

export default async function DrugPage({ params }: DrugPageProps) {
  const drugId = parseInt(params.id);

  let data;
  try {
    data = await getDrugTimeSeries(drugId);
  } catch (error) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-900 mb-2">Drug Not Found</h2>
          <p className="text-red-700">
            The requested drug could not be found. Please try searching for a different drug.
          </p>
        </div>
      </Layout>
    );
  }

  const { drug, data: timeSeriesData } = data;

  // Get latest year data
  const latestData = timeSeriesData[timeSeriesData.length - 1];
  const firstData = timeSeriesData[0];

  // Calculate multi-year growth
  const yearsOfData = timeSeriesData.length;
  let multiYearGrowth = null;
  if (yearsOfData >= 2) {
    const totalGrowth =
      ((latestData.total_spending - firstData.total_spending) / firstData.total_spending) * 100;
    multiYearGrowth = totalGrowth;
  }

  return (
    <Layout>
      {/* Drug Header */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {drug.generic_name}
            </h1>
            {drug.brand_name && (
              <p className="text-xl text-gray-600 mb-2">Brand Name: {drug.brand_name}</p>
            )}
            {drug.drug_class_name && (
              <div className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {drug.drug_class_name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Latest Year Spending */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {latestData.year} Total Spending
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {formatLargeNumber(latestData.total_spending)}
          </p>
        </div>

        {/* Beneficiaries */}
        {latestData.beneficiaries_count && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {latestData.year} Beneficiaries
            </h3>
            <p className="text-3xl font-bold text-secondary-600">
              {latestData.beneficiaries_count.toLocaleString()}
            </p>
          </div>
        )}

        {/* Cost per Beneficiary */}
        {latestData.spending_per_beneficiary && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Cost per Beneficiary</h3>
            <p className="text-3xl font-bold text-orange-600">
              {formatLargeNumber(latestData.spending_per_beneficiary)}
            </p>
          </div>
        )}

        {/* YoY Growth */}
        {latestData.yoy_spending_growth !== null && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {latestData.year} YoY Growth
            </h3>
            <p
              className={`text-3xl font-bold ${
                latestData.yoy_spending_growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(latestData.yoy_spending_growth)}
            </p>
          </div>
        )}
      </div>

      {/* In-content Ad */}
      <div className="mb-8 flex justify-center">
        <AdPlaceholder slot="drug-detail-top" size="leaderboard" />
      </div>

      {/* Summary Stats */}
      <div className="bg-blue-50 border-l-4 border-primary-600 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Summary</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Data Period:</strong> {firstData.year} - {latestData.year} (
            {yearsOfData} years)
          </p>
          {multiYearGrowth !== null && (
            <p>
              <strong>Total Growth ({firstData.year}-{latestData.year}):</strong>{' '}
              {formatPercentage(multiYearGrowth)}
            </p>
          )}
          <p>
            <strong>Latest Year Total Claims:</strong>{' '}
            {latestData.total_claims.toLocaleString()}
          </p>
          {latestData.spending_per_claim && (
            <p>
              <strong>Latest Year Cost per Claim:</strong>{' '}
              {formatLargeNumber(latestData.spending_per_claim)}
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8 mb-8">
        {/* Spending Chart */}
        <SpendingChart data={timeSeriesData} />

        {/* Beneficiaries Chart */}
        <BeneficiariesChart data={timeSeriesData} />

        {/* Growth Chart */}
        <GrowthChart data={timeSeriesData} />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Annual Statistics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed year-by-year breakdown of all available metrics for this drug.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Spending
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Claims
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Beneficiaries
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cost/Claim
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  YoY Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSeriesData.map((row) => (
                <tr key={row.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                    {formatLargeNumber(row.total_spending)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                    {row.total_claims.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                    {row.beneficiaries_count?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                    {row.spending_per_claim ? formatLargeNumber(row.spending_per_claim) : '-'}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      row.yoy_spending_growth !== null
                        ? row.yoy_spending_growth >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {row.yoy_spending_growth !== null
                      ? formatPercentage(row.yoy_spending_growth)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

