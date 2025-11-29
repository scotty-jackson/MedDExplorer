/**
 * Landing page for Medicare Part D Drug Spending Explorer.
 *
 * Features:
 * - Hero section with search
 * - Top drugs by total spending
 * - Top drugs by YoY growth
 * - SEO-optimized with meta tags
 */

import React from 'react';
import { Metadata } from 'next';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import TopDrugsTable from '@/components/TopDrugsTable';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getTopDrugs, getAvailableYears } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Medicare Part D Drug Spending Explorer | Analyze Prescription Drug Costs',
  description:
    'Explore Medicare Part D prescription drug spending data by drug name, year, and category. ' +
    'Analyze trends, compare costs, and track year-over-year growth for Medicare drugs.',
  keywords: [
    'Medicare Part D',
    'drug spending',
    'prescription costs',
    'Medicare drugs',
    'CMS data',
    'drug prices',
  ],
  openGraph: {
    title: 'Medicare Part D Drug Spending Explorer',
    description: 'Explore Medicare prescription drug spending data from CMS',
    type: 'website',
  },
};

export default async function HomePage() {
  // Fetch latest year's data
  let latestYear = 2023; // Default fallback
  let topBySpending = [];
  let topByGrowth = [];

  try {
    const years = await getAvailableYears();
    if (years.length > 0) {
      latestYear = Math.max(...years);
    }

    // Fetch top drugs by spending
    topBySpending = await getTopDrugs(latestYear, 'total_spending', 10);

    // Fetch top drugs by YoY growth
    topByGrowth = await getTopDrugs(latestYear, 'yoy_spending_growth', 10);
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-[#1f2a17] dark:to-[#0b1007] rounded-lg shadow-xl p-8 md:p-12 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Medicare Part D Drug Spending Explorer
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-primary-100">
          Explore prescription drug spending data from Medicare Part D
        </p>

        {/* Search Bar */}
        <div className="flex justify-center">
          <SearchBar placeholder="Search for a drug (e.g., Ozempic, Lipitor, Eliquis)..." />
        </div>
      </div>

      {/* Explanation Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is Medicare Part D?
        </h2>
        <p className="text-gray-700 mb-4">
          Medicare Part D is the prescription drug benefit program for Medicare beneficiaries.
          This site lets you explore publicly available data from the Centers for Medicare &
          Medicaid Services (CMS) showing drug spending, claims, and beneficiary counts.
        </p>
        <p className="text-gray-700">
          You can search for specific drugs to see spending trends over time, compare costs per
          beneficiary, and identify which drugs have the highest total spending or fastest
          year-over-year growth.
        </p>
      </div>

      {/* In-content Ad Placeholder */}
      <div className="mb-12 flex justify-center">
        <AdPlaceholder slot="content-top" size="leaderboard" />
      </div>

      {/* Top Drugs by Total Spending */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Top 10 Drugs by Total Spending ({latestYear})
          </h2>
          <p className="text-gray-600">
            These drugs had the highest total Medicare Part D spending in {latestYear}. Total
            spending includes the gross drug cost before rebates or discounts.
          </p>
        </div>
        {topBySpending.length > 0 ? (
          <TopDrugsTable
            drugs={topBySpending}
            metric="total_spending"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Top Drugs by YoY Growth */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Fastest Growing Drugs by Spending ({latestYear})
          </h2>
          <p className="text-gray-600">
            These drugs saw the largest percentage increase in spending compared to the prior
            year. This can indicate increased utilization, price increases, or both.
          </p>
        </div>
        {topByGrowth.length > 0 ? (
          <TopDrugsTable
            drugs={topByGrowth}
            metric="yoy_spending_growth"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* How to Use Section */}
      <div className="bg-blue-50 border-l-4 border-primary-600 rounded-lg p-6 mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-3">How to Use This Site</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">1.</span>
            <span>
              <strong>Search for a drug</strong> using the search bar above. Start typing a drug
              name (generic or brand) to see autocomplete suggestions.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">2.</span>
            <span>
              <strong>View detailed metrics</strong> including total spending, beneficiary counts,
              claims, and year-over-year growth rates.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">3.</span>
            <span>
              <strong>Explore trends</strong> with interactive charts showing how spending and
              usage have changed over time.
            </span>
          </li>
        </ul>
      </div>

      {/* Data Source */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Source</h3>
        <p className="text-sm text-gray-700">
          All data on this site comes from publicly available Medicare Part D drug spending
          datasets published by the Centers for Medicare & Medicaid Services (CMS). The data is
          updated annually and reflects actual spending under the Medicare Part D program.
        </p>
      </div>
    </Layout>
  );
}

