/**
 * About page explaining the data sources, methodology, and purpose.
 */

import React from 'react';
import { Metadata } from 'next';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'About - Medicare Part D Drug Spending Explorer',
  description:
    'Learn about the Medicare Part D Drug Spending Explorer, data sources, and methodology.',
};

export default function AboutPage() {
  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          About Medicare Part D Drug Spending Explorer
        </h1>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is This Site?</h2>
            <p className="text-gray-700 mb-4">
              The Medicare Part D Drug Spending Explorer is a free, public tool for exploring
              prescription drug spending data from the Medicare Part D program. Our goal is to make
              this important healthcare data accessible and understandable for patients, researchers,
              journalists, investors, and policymakers.
            </p>
          </section>

          {/* Data Source */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <p className="text-gray-700 mb-4">
              All data on this site comes from publicly available datasets published by the{' '}
              <a
                href="https://www.cms.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Centers for Medicare & Medicaid Services (CMS)
              </a>
              . Specifically, we use the Medicare Part D Spending by Drug dataset, which is updated
              annually.
            </p>
            <p className="text-gray-700">
              The dataset includes information on drugs covered under Medicare Part D, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Generic and brand names</li>
              <li>Total gross spending (before rebates)</li>
              <li>Number of claims</li>
              <li>Number of beneficiaries</li>
              <li>Average cost per claim and per beneficiary</li>
            </ul>
          </section>

          {/* Medicare Part D Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Medicare Part D?</h2>
            <p className="text-gray-700 mb-4">
              Medicare Part D is the prescription drug benefit program for Medicare beneficiaries.
              It was created as part of the Medicare Prescription Drug, Improvement, and
              Modernization Act of 2003 and launched in 2006.
            </p>
            <p className="text-gray-700">
              Part D plans are offered by private insurance companies approved by Medicare. The
              program helps cover the cost of prescription drugs and can help lower prescription drug
              costs and protect against higher costs in the future.
            </p>
          </section>

          {/* Metrics Explained */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding the Metrics</h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Spending</h3>
              <p className="text-gray-700">
                The aggregate gross drug cost for all claims of a particular drug. This is the total
                amount before manufacturer rebates and pharmacy discounts. High total spending can
                result from high prices, high utilization (number of prescriptions), or both.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beneficiaries</h3>
              <p className="text-gray-700">
                The number of unique Medicare Part D beneficiaries who had at least one claim for
                the drug during the year. This indicates how widely the drug is used.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost per Beneficiary</h3>
              <p className="text-gray-700">
                Total spending divided by the number of beneficiaries. This shows the average annual
                cost per patient for a drug, which can indicate expensive specialty drugs even if
                total spending is relatively low.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Year-over-Year (YoY) Growth
              </h3>
              <p className="text-gray-700">
                The percentage change in spending, beneficiaries, or claims from one year to the
                next. High growth rates can indicate:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-700">
                <li>Price increases</li>
                <li>Increased utilization (more prescriptions)</li>
                <li>New drugs entering the market</li>
                <li>Expanded indications or clinical use</li>
              </ul>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Limitations</h2>
            <p className="text-gray-700 mb-4">
              It&apos;s important to understand the limitations of this data:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Gross spending only:</strong> The data reflects gross spending before
                manufacturer rebates and pharmacy discounts, which can be substantial for some drugs.
              </li>
              <li>
                <strong>Medicare Part D only:</strong> This data only includes Medicare Part D. It
                does not include drugs covered under Medicare Part B, commercial insurance, Medicaid,
                or out-of-pocket cash payments.
              </li>
              <li>
                <strong>Suppressed data:</strong> CMS suppresses data for drugs with fewer than 11
                claims to protect beneficiary privacy.
              </li>
              <li>
                <strong>Annual data:</strong> Data is reported annually, so it may not reflect
                mid-year changes or seasonal variations.
              </li>
            </ul>
          </section>

          {/* Use Cases */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Can Use This Data?</h2>
            <p className="text-gray-700 mb-4">This tool is designed for:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Patients and families:</strong> Understanding drug costs and trends
              </li>
              <li>
                <strong>Healthcare providers:</strong> Researching drug utilization patterns
              </li>
              <li>
                <strong>Researchers:</strong> Analyzing prescription drug spending trends
              </li>
              <li>
                <strong>Journalists:</strong> Investigating drug pricing and healthcare costs
              </li>
              <li>
                <strong>Investors:</strong> Tracking pharmaceutical market trends
              </li>
              <li>
                <strong>Policy makers:</strong> Informing healthcare policy decisions
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or Feedback?</h2>
            <p className="text-gray-700">
              This is an independent project built to make public healthcare data more accessible.
              For questions about the underlying data, please refer to the{' '}
              <a
                href="https://www.cms.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                CMS website
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

