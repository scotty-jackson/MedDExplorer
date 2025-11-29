import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import AdPlaceholder from '@/components/AdPlaceholder';
import TopDrugsTable from '@/components/TopDrugsTable';
import SpendingChart from '@/components/SpendingChart';
import {
  getCategories,
  getAvailableYears,
  getCategorySummary,
  formatCurrency,
  formatLargeNumber,
} from '@/lib/api';

interface CategoryPageProps {
  params: { id: string };
  searchParams?: { year?: string };
}

async function fetchCategory(categoryId: number) {
  const categories = await getCategories();
  return {
    categories,
    category: categories.find((entry) => entry.id === categoryId) ?? null,
  };
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const categoryId = Number(params.id);
  if (Number.isNaN(categoryId)) {
    return {
      title: 'Medicare Part D Category Overview',
      description: 'Explore Medicare drug categories with spending and utilization metrics.',
    };
  }

  const { category } = await fetchCategory(categoryId);
  const year = searchParams?.year ? Number(searchParams.year) : undefined;

  if (!category) {
    return {
      title: 'Category Not Found | Medicare Part D Explorer',
      description: 'The requested Medicare Part D drug category could not be found.',
    };
  }

  return {
    title: `${category.name} Medicare Part D Spending${year ? ` | ${year}` : ''}`,
    description: `Analyze spending, claims, and top drugs within the ${category.name} therapeutic class${
      year ? ` for ${year}` : ''
    } using CMS Medicare Part D data.`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const categoryId = Number(params.id);
  if (Number.isNaN(categoryId)) {
    return notFound();
  }

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let years: number[] = [];

  try {
    [categories, years] = await Promise.all([getCategories(), getAvailableYears()]);
  } catch (error) {
    console.error('Failed to load categories or available years', error);
  }

  const category = categories.find((entry) => entry.id === categoryId);
  if (!category) {
    return notFound();
  }

  const sortedYears = years.length ? [...years].sort((a, b) => b - a) : [];
  const defaultYear = sortedYears[0] ?? 2023;
  const selectedYear = searchParams?.year ? Number(searchParams.year) || defaultYear : defaultYear;

  let summary: Awaited<ReturnType<typeof getCategorySummary>> | null = null;
  try {
    summary = await getCategorySummary(categoryId, selectedYear, 15);
  } catch (error) {
    console.error('Failed to load category summary', error);
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-xl p-8 md:p-12 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
        <p className="text-xl text-primary-100">
          Aggregate Medicare Part D metrics for the {category.name} therapeutic class.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Year</p>
          <p className="text-2xl font-bold text-gray-900">{summary ? summary.year : selectedYear}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Spending</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary ? formatLargeNumber(summary.total_spending) : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary ? summary.total_claims.toLocaleString() : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Beneficiaries</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary?.total_beneficiaries?.toLocaleString() ?? 'N/A'}
          </p>
        </div>
      </div>

      {sortedYears.length > 1 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose year</h2>
          <div className="flex flex-wrap gap-3">
            {sortedYears.map((year) => (
              <Link
                key={year}
                href={`/categories/${categoryId}?year=${year}`}
                className={`px-4 py-2 rounded-full border text-sm font-medium ${
                  year === selectedYear
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10 flex justify-center">
        <AdPlaceholder slot="category-detail-top" size="leaderboard" />
      </div>

      {!summary ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
          No data available for this category in {selectedYear}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Category snapshot</h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">Drug count:</span> {summary.drug_count.toLocaleString()}
                </li>
                <li>
                  <span className="font-semibold">Average spending per drug:</span>{' '}
                  {formatCurrency(summary.total_spending / Math.max(summary.drug_count, 1))}
                </li>
                <li>
                  <span className="font-semibold">Average spending per claim:</span>{' '}
                  {summary.total_claims
                    ? formatCurrency(summary.total_spending / summary.total_claims)
                    : 'N/A'}
                </li>
                <li>
                  <span className="font-semibold">Average spending per beneficiary:</span>{' '}
                  {summary.total_beneficiaries
                    ? formatCurrency(summary.total_spending / summary.total_beneficiaries)
                    : 'N/A'}
                </li>
              </ul>
            </div>
            <SpendingChart data={summary.time_series} title="Total Category Spending Over Time" />
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Top Drugs by Total Spending ({summary.year})
            </h3>
            {summary.top_drugs.length > 0 ? (
              <TopDrugsTable drugs={summary.top_drugs} metric="total_spending" />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                No top drug data available.
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Need a deeper dive?</h3>
            <p className="text-gray-700 mb-4">
              Use the top drugs table to jump into detailed drug pages for richer spending and growth
              metrics. Each drug page includes interactive charts plus year-by-year stats.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="text-primary-600 font-semibold hover:text-primary-800">
                Go back to the home page
              </Link>
              <Link href="/categories" className="text-primary-600 font-semibold hover:text-primary-800">
                View all categories
              </Link>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
