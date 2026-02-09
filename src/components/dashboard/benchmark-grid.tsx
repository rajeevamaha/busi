'use client';

import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { isSoloOrFamily, AlertSeverity } from '@/lib/engine/types';
import { getBenchmark, lowerIsWorseCategories } from '@/lib/engine/benchmarks';
import { BenchmarkCard } from './benchmark-card';

function getSeverity(value: number, warning: number, critical: number, lowerIsWorse: boolean): AlertSeverity {
  if (lowerIsWorse) {
    if (value < critical) return 'critical';
    if (value < warning) return 'warning';
    return 'healthy';
  }
  if (value > critical) return 'critical';
  if (value > warning) return 'warning';
  return 'healthy';
}

export function BenchmarkGrid() {
  const metrics = useMetrics();
  const formData = useFormData();
  const bt = formData.sectionA.businessType;
  const solo = isSoloOrFamily(formData.sectionA.teamSize);

  const items: { label: string; category: string; value: number }[] = [
    { label: 'Rent %', category: 'rent_percent', value: metrics.costs.rentPercent },
    { label: 'COGS %', category: 'cogs_percent', value: metrics.costs.cogsPercent },
    ...(!solo ? [{ label: 'Labor %', category: 'labor_percent', value: metrics.costs.laborPercent }] : []),
    { label: 'Marketing %', category: 'marketing_percent', value: metrics.costs.marketingPercent },
    { label: 'Net Margin', category: 'net_margin_percent', value: metrics.profitability.netMarginPercent },
    { label: 'Wastage %', category: 'wastage_percent', value: formData.sectionD.wastagePercent },
    { label: 'Capacity', category: 'capacity_utilization', value: metrics.costs.capacityUtilization },
    { label: 'Safety Margin', category: 'margin_of_safety', value: metrics.breakEven.marginOfSafety },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const benchmark = getBenchmark(item.category, bt);
        if (!benchmark) return null;
        const lowerIsWorse = lowerIsWorseCategories.has(item.category);
        return (
          <BenchmarkCard
            key={item.category}
            label={item.label}
            value={item.value}
            healthyRange={`${benchmark.healthyMin}-${benchmark.healthyMax}%`}
            severity={getSeverity(item.value, benchmark.warningThreshold, benchmark.criticalThreshold, lowerIsWorse)}
          />
        );
      })}
    </div>
  );
}
