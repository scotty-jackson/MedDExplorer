import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Layout from '@/components/Layout';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getCategories, getAvailableYears } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Medicare Part D Drug Categories | Explore Therapeutic Classes',
  description:
    'Browse Medicare Part D drug categories and dive into spending, claims, and beneficiary trends for each therapeutic class.',
  keywords: [
    'Medicare Part D categories',
    'drug classes',
    'therapeutic categories',
    'CMS drug spending',
  ],
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let latestYear = 2023;

  try {
    const [fetchedCategories, years] = await Promise.all([
      getCategories(),
      getAvailableYears(),
    ]);
    categories = fetchedCategories;
    if (years.length) {
      latestYear = Math.max(...years);
    }
  } catch (error) {
    console.error('Failed to load categories', error);
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-[#1f2a17] dark:to-[#0b1007] dark:from-[#1f2a17] dark:to-[#0b1007] rounded-lg shadow-xl p-8 md:p-12 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Medicare Part D Drug Categories</h1>
        <p className="text-xl text-primary-100">
          Explore therapeutic classes and dig into spending, claims, and beneficiary trends for
          {` `}
          {latestYear}.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why look at categories?</h2>
        <p className="text-gray-700">
          Grouping drugs by therapeutic class makes it easy to spot macro trends. You can quickly
          see how insulin, GLP-1 agonists, oncology agents, and other groupings are driving overall
          Medicare spending, then drill down into the drugs that contribute the most to each class.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <AdPlaceholder slot="categories-top" size="leaderboard" />
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
          Unable to load categories. Ensure the backend and database are running with category data
          populated.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow border border-gray-100 p-6 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">
                  {category.description || 'Explore aggregate spending, claims, and utilization trends for this drug class.'}
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href={`/categories/${category.id}?year=${latestYear}`}
                  className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-800"
                >
                  Explore {category.name}
                  <span className="ml-2" aria-hidden>
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-blue-50 border-l-4 border-primary-600 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">How category insights help</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>See whether spending growth is concentrated in a handful of therapeutic areas.</li>
          <li>
            Compare beneficiary reach across categories to spot areas with high per-patient costs.
          </li>
          <li>
            Use category summaries to prioritize deeper dives into individual drugs or manufacturers.
          </li>
        </ul>
      </div>
    </Layout>
  );
}



