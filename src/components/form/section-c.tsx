'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { CalculatedField } from './calculated-field';
import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getBenchmark } from '@/lib/engine/benchmarks';
import { useFormData } from '@/hooks/use-calculations';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionC({ register, errors }: Props) {
  const metrics = useMetrics();
  const formData = useFormData();
  const benchmark = getBenchmark('rent_percent', formData.sectionA.businessType);
  const rentSeverity = benchmark
    ? metrics.costs.rentPercent > benchmark.criticalThreshold ? 'critical'
      : metrics.costs.rentPercent > benchmark.warningThreshold ? 'warning'
        : 'healthy'
    : undefined;

  return (
    <SectionWrapper title="C. Rent & Fixed Costs" description="Your occupancy costs">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput<FormData>
          label="Monthly Rent"
          name="sectionC.monthlyRent"
          register={register}
          error={errors.sectionC?.monthlyRent?.message}
        />
        <CurrencyInput<FormData>
          label="Security Deposit (one-time)"
          name="sectionC.securityDeposit"
          register={register}
          error={errors.sectionC?.securityDeposit?.message}
        />
        <CurrencyInput<FormData>
          label="Utilities (monthly)"
          name="sectionC.utilities"
          register={register}
          error={errors.sectionC?.utilities?.message}
        />
        <CurrencyInput<FormData>
          label="Maintenance / CAM Charges"
          name="sectionC.maintenanceCam"
          register={register}
          error={errors.sectionC?.maintenanceCam?.message}
        />
      </div>

      <div className="mt-4 space-y-2">
        <CalculatedField
          label="Total Occupancy Cost"
          value={formatCurrency(metrics.costs.totalOccupancyCost)}
        />
        <CalculatedField
          label="Rent % of Revenue"
          value={formatPercent(metrics.costs.rentPercent)}
          severity={rentSeverity as 'healthy' | 'warning' | 'critical'}
        />
        <CalculatedField
          label="Fixed Cost Ratio"
          value={formatPercent(metrics.costs.fixedCostRatio)}
        />
      </div>
    </SectionWrapper>
  );
}
