/**
 * API client for Medicare Part D Explorer backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions
export interface DrugSummary {
  id: number;
  generic_name: string;
  brand_name: string | null;
  slug: string | null;
  drug_class_name: string | null;
}

export interface TopDrugItem {
  drug_id: number;
  generic_name: string;
  brand_name: string | null;
  slug: string | null;
  drug_class_name: string | null;
  metric_value: number;
  year: number;
}

export interface TimeSeriesDataPoint {
  year: number;
  total_spending: number;
  total_claims: number;
  beneficiaries_count: number | null;
  spending_per_claim: number | null;
  spending_per_beneficiary: number | null;
  yoy_spending_growth: number | null;
  yoy_beneficiary_growth: number | null;
  yoy_claims_growth: number | null;
}

export interface DrugTimeSeriesResponse {
  drug: DrugSummary;
  data: TimeSeriesDataPoint[];
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  year: number;
  total_spending: number;
  total_claims: number;
  total_beneficiaries: number | null;
  drug_count: number;
  top_drugs: TopDrugItem[];
  time_series: Array<{
    year: number;
    total_spending: number;
    total_claims: number;
    total_beneficiaries: number | null;
  }>;
}

export interface DrugCategory {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Get available years with data
 */
export async function getAvailableYears(): Promise<number[]> {
  const response = await fetch(`${API_BASE_URL}/api/years`);
  if (!response.ok) throw new Error('Failed to fetch years');
  const data = await response.json();
  return data.years;
}

/**
 * Search for drugs by name
 */
export async function searchDrugs(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ drugs: DrugSummary[]; total: number }> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/drugs/search?${params}`);
  if (!response.ok) throw new Error('Failed to search drugs');
  const data = await response.json();
  return {
    drugs: data.drugs,
    total: data.total,
  };
}

/**
 * Get top drugs for a given year and metric
 */
export async function getTopDrugs(
  year: number,
  metric: string = 'total_spending',
  limit: number = 10
): Promise<TopDrugItem[]> {
  const params = new URLSearchParams({
    year: year.toString(),
    metric,
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/drugs/top?${params}`);
  if (!response.ok) throw new Error('Failed to fetch top drugs');
  const data = await response.json();
  return data.drugs;
}

/**
 * Get time series data for a specific drug
 */
export async function getDrugTimeSeries(drugId: number): Promise<DrugTimeSeriesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/${drugId}/timeseries`);
  if (!response.ok) throw new Error('Failed to fetch drug time series');
  return response.json();
}

/**
 * Get drug by ID
 */
export async function getDrug(drugId: number): Promise<DrugSummary> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/${drugId}`);
  if (!response.ok) throw new Error('Failed to fetch drug');
  return response.json();
}

/**
 * Get drug by slug
 */
export async function getDrugBySlug(slug: string): Promise<DrugSummary> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/slug/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch drug');
  return response.json();
}

/**
 * Get all drug categories
 */
export async function getCategories(): Promise<DrugCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

/**
 * Get category summary for a specific year
 */
export async function getCategorySummary(
  categoryId: number,
  year: number,
  topDrugsLimit: number = 10
): Promise<CategorySummary> {
  const params = new URLSearchParams({
    year: year.toString(),
    top_drugs_limit: topDrugsLimit.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/categories/${categoryId}/summary?${params}`
  );
  if (!response.ok) throw new Error('Failed to fetch category summary');
  return response.json();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  } else if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
