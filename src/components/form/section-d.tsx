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

  return (
    <SectionWrapper title="D. Cost of Goods Sold (COGS)" description="Ingredient and packaging costs">
      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="mt-4 space-y-2">
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
      </div>
    </SectionWrapper>
  );
}
