'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { PercentageInput } from './percentage-input';
import { CalculatedField } from './calculated-field';
import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getBenchmark } from '@/lib/engine/benchmarks';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionD({ register, errors }: Props) {
  const metrics = useMetrics();
  const formData = useFormData();
  const benchmark = getBenchmark('cogs_percent', formData.sectionA.businessType);
  const cogsSeverity = benchmark
    ? metrics.costs.cogsPercent > benchmark.criticalThreshold ? 'critical'
      : metrics.costs.cogsPercent > benchmark.warningThreshold ? 'warning'
        : 'healthy'
    : undefined;

  const { sectionA, sectionB, sectionD } = formData;
  const monthlyUnits = sectionB.unitsProducedPerDay * sectionA.operatingDaysPerMonth;
  const autoRawMaterialCost = sectionD.ingredientCostPerUnit * monthlyUnits;
  const autoPackagingCost = sectionD.packagingCostPerUnit * monthlyUnits;
  const totalPurchases = autoRawMaterialCost + autoPackagingCost;
  const totalSales = metrics.revenue.totalRevenue;
  const foodCostPercent = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;
  const foodCostSeverity = foodCostPercent > 40 ? 'critical' : foodCostPercent > 33 ? 'warning' : 'healthy';

  // Prime Cost = Food Cost (Purchases) + Labor Cost
  const totalLaborCost = metrics.costs.totalLaborCost;
  const primeCost = totalPurchases + totalLaborCost;
  const primeCostPercent = totalSales > 0 ? (primeCost / totalSales) * 100 : 0;
  const primeCostSeverity = primeCostPercent > 50 ? 'critical' : primeCostPercent > 45 ? 'warning' : 'healthy';

  return (
    <SectionWrapper title="D. Cost of Goods Sold (COGS)" description="Ingredient and packaging costs">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <CurrencyInput<FormData>
            label="Ingredient Cost per Unit"
            name="sectionD.ingredientCostPerUnit"
            register={register}
            error={errors.sectionD?.ingredientCostPerUnit?.message}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Cost of ingredients for one sellable unit (not the whole batch)
          </p>
        </div>
        <CurrencyInput<FormData>
          label="Packaging Cost per Unit"
          name="sectionD.packagingCostPerUnit"
          register={register}
          error={errors.sectionD?.packagingCostPerUnit?.message}
        />
        <PercentageInput<FormData>
          label="Wastage Estimate"
          name="sectionD.wastagePercent"
          register={register}
          error={errors.sectionD?.wastagePercent?.message}
          placeholder="5"
        />
      </div>

      <div className="mt-3 space-y-1.5">
        <CalculatedField
          label="Monthly Raw Material Cost"
          value={formatCurrency(autoRawMaterialCost)}
          suffix={`${sectionD.ingredientCostPerUnit} × ${monthlyUnits} units`}
        />
        <CalculatedField
          label="Monthly Packaging Cost"
          value={formatCurrency(autoPackagingCost)}
          suffix={`${sectionD.packagingCostPerUnit} × ${monthlyUnits} units`}
        />
        <CalculatedField
          label="COGS per Unit"
          value={formatCurrency(metrics.costs.cogsPerUnit)}
        />
        <CalculatedField
          label="Total COGS"
          value={formatCurrency(metrics.costs.totalCogs)}
        />
        <CalculatedField
          label="COGS % of Revenue"
          value={formatPercent(metrics.costs.cogsPercent)}
          severity={cogsSeverity as 'healthy' | 'warning' | 'critical'}
        />
        <CalculatedField
          label="Wastage Cost"
          value={formatCurrency(metrics.costs.wastageCost)}
        />
        <CalculatedField
          label="Food Cost % (Purchases / Sales)"
          value={formatPercent(foodCostPercent)}
          suffix={`${formatCurrency(totalPurchases)} / ${formatCurrency(totalSales)}`}
          severity={foodCostSeverity as 'healthy' | 'warning' | 'critical'}
        />
        <CalculatedField
          label="Prime Cost (Food + Labor)"
          value={formatCurrency(primeCost)}
          suffix={`${formatCurrency(totalPurchases)} + ${formatCurrency(totalLaborCost)}`}
        />
        <CalculatedField
          label="Prime Cost % of Revenue"
          value={formatPercent(primeCostPercent)}
          severity={primeCostSeverity as 'healthy' | 'warning' | 'critical'}
        />
      </div>
    </SectionWrapper>
  );
}
