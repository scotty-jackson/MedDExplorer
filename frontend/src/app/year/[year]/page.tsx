/**
 * Year overview page showing top drugs for a specific year.
 */

import React from 'react';
import { Metadata } from 'next';
import Layout from '@/components/Layout';
import TopDrugsTable from '@/components/TopDrugsTable';
import { getTopDrugs } from '@/lib/api';

interface YearPageProps {
  params: {
    year: string;
  };
}

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
  const year = parseInt(params.year);

  return {
    title: `${year} Medicare Part D Drug Spending | Top Drugs by Spending`,
    description: `View the top Medicare Part D drugs by spending and growth for ${year}. Compare prescription drug costs and trends.`,
    keywords: [`Medicare Part D ${year}`, 'drug spending', 'prescription costs', 'CMS data'],
  };
}

export default async function YearPage({ params }: YearPageProps) {
  const year = parseInt(params.year);

  let topBySpending = [];
  let topByGrowth = [];
  let topByBeneficiaries = [];

  try {
    // Fetch top drugs by different metrics
    topBySpending = await getTopDrugs(year, 'total_spending', 20);
    topByGrowth = await getTopDrugs(year, 'yoy_spending_growth', 20);
    topByBeneficiaries = await getTopDrugs(year, 'spending_per_beneficiary', 20);
  } catch (error) {
    console.error('Error fetching year data:', error);
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-xl p-8 md:p-12 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{year} Medicare Part D Overview</h1>
        <p className="text-xl text-primary-100">
          Explore the top prescription drugs by spending, growth, and cost per beneficiary for{' '}
          {year}.
        </p>
      </div>

      {/* Top by Total Spending */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Top 20 Drugs by Total Spending
          </h2>
          <p className="text-gray-600">
            These drugs had the highest total Medicare Part D spending in {year}. Total spending
            represents the gross drug cost before manufacturer rebates and discounts.
          </p>
        </div>
        {topBySpending.length > 0 ? (
          <TopDrugsTable drugs={topBySpending} metric="total_spending" />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No data available for {year}
          </div>
        )}
      </div>

      {/* Top by YoY Growth */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Top 20 Drugs by Year-over-Year Growth
          </h2>
          <p className="text-gray-600">
            These drugs saw the largest percentage increase in spending from {year - 1} to {year}.
            High growth can indicate increased utilization, price increases, or new market entry.
          </p>
        </div>
        {topByGrowth.length > 0 ? (
          <TopDrugsTable drugs={topByGrowth} metric="yoy_spending_growth" />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No growth data available for {year}
          </div>
        )}
      </div>

      {/* Top by Cost per Beneficiary */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Top 20 Drugs by Cost per Beneficiary
          </h2>
          <p className="text-gray-600">
            These drugs had the highest average spending per Medicare beneficiary in {year}. This
            metric indicates the per-patient cost burden for each drug.
          </p>
        </div>
        {topByBeneficiaries.length > 0 ? (
          <TopDrugsTable drugs={topByBeneficiaries} metric="spending_per_beneficiary" />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No beneficiary data available for {year}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border-l-4 border-primary-600 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Understanding the Metrics</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Total Spending:</strong> The aggregate gross cost of all prescriptions for a
            drug, before manufacturer rebates. High total spending can result from high prices, high
            utilization, or both.
          </p>
          <p>
            <strong>Year-over-Year Growth:</strong> The percentage change in total spending from the
            prior year. Positive growth indicates increased spending; negative indicates decreased
            spending.
          </p>
          <p>
            <strong>Cost per Beneficiary:</strong> Total spending divided by the number of
            beneficiaries who received the drug. This shows the average cost burden per patient.
          </p>
        </div>
      </div>
    </Layout>
  );
}
