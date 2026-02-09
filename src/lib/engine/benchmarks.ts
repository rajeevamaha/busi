import { BenchmarkThreshold, BusinessType } from './types';

const defaultBenchmarks: Omit<BenchmarkThreshold, 'businessType'>[] = [
  { category: 'rent_percent', healthyMin: 5, healthyMax: 15, warningThreshold: 15, criticalThreshold: 20 },
  { category: 'cogs_percent', healthyMin: 25, healthyMax: 35, warningThreshold: 35, criticalThreshold: 42 },
  { category: 'labor_percent', healthyMin: 20, healthyMax: 30, warningThreshold: 30, criticalThreshold: 38 },
  { category: 'marketing_percent', healthyMin: 3, healthyMax: 8, warningThreshold: 10, criticalThreshold: 15 },
  { category: 'total_operating_cost_percent', healthyMin: 70, healthyMax: 85, warningThreshold: 85, criticalThreshold: 92 },
  { category: 'net_margin_percent', healthyMin: 10, healthyMax: 20, warningThreshold: 10, criticalThreshold: 5 },
  { category: 'wastage_percent', healthyMin: 2, healthyMax: 5, warningThreshold: 5, criticalThreshold: 10 },
  { category: 'capacity_utilization', healthyMin: 70, healthyMax: 90, warningThreshold: 60, criticalThreshold: 40 },
  { category: 'margin_of_safety', healthyMin: 25, healthyMax: 100, warningThreshold: 25, criticalThreshold: 10 },
];

const businessTypes: BusinessType[] = ['bakery', 'restaurant', 'cafe', 'cloud_kitchen', 'food_truck'];

// Pre-built lookup table: category -> businessType -> threshold
const benchmarkMap: Record<string, Record<string, BenchmarkThreshold>> = {};

for (const type of businessTypes) {
  for (const b of defaultBenchmarks) {
    if (!benchmarkMap[b.category]) benchmarkMap[b.category] = {};
    benchmarkMap[b.category][type] = { ...b, businessType: type };
  }
}

export function getBenchmark(category: string, businessType: BusinessType): BenchmarkThreshold | null {
  return benchmarkMap[category]?.[businessType] ?? null;
}

export function getAllBenchmarks(businessType: BusinessType): BenchmarkThreshold[] {
  return defaultBenchmarks.map((b) => ({ ...b, businessType }));
}

// Categories where "lower is worse" (net margin, capacity, margin of safety)
export const lowerIsWorseCategories = new Set([
  'net_margin_percent',
  'capacity_utilization',
  'margin_of_safety',
]);
