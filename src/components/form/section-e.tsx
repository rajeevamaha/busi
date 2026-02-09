'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { NumberInput } from './number-input';
import { CalculatedField } from './calculated-field';
import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getBenchmark } from '@/lib/engine/benchmarks';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionE({ register, errors }: Props) {
  const metrics = useMetrics();
  const formData = useFormData();
  const benchmark = getBenchmark('labor_percent', formData.sectionA.businessType);
  const laborSeverity = benchmark
    ? metrics.costs.laborPercent > benchmark.criticalThreshold ? 'critical'
      : metrics.costs.laborPercent > benchmark.warningThreshold ? 'warning'
        : 'healthy'
    : undefined;

  return (
    <SectionWrapper title="E. Labor & Staffing" description="Employee costs and capacity">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput<FormData>
          label="Number of Employees"
          name="sectionE.numberOfEmployees"
          register={register}
          error={errors.sectionE?.numberOfEmployees?.message}
        />
        <CurrencyInput<FormData>
          label="Average Hourly Rate"
          name="sectionE.avgHourlyRate"
          register={register}
          error={errors.sectionE?.avgHourlyRate?.message}
        />
        <NumberInput<FormData>
          label="Avg Hours / Employee / Month"
          name="sectionE.avgHoursPerEmployeePerMonth"
          register={register}
          error={errors.sectionE?.avgHoursPerEmployeePerMonth?.message}
        />
        <CurrencyInput<FormData>
          label="Total Monthly Salaries"
          name="sectionE.totalMonthlySalaries"
          register={register}
          error={errors.sectionE?.totalMonthlySalaries?.message}
        />
        <CurrencyInput<FormData>
          label="Benefits / Insurance"
          name="sectionE.benefitsInsurance"
          register={register}
          error={errors.sectionE?.benefitsInsurance?.message}
        />
        <NumberInput<FormData>
          label="Max Output per Staff Hour"
          name="sectionE.maxOutputPerStaffHour"
          register={register}
          error={errors.sectionE?.maxOutputPerStaffHour?.message}
          step={0.1}
        />
      </div>

      <div className="mt-4 space-y-2">
        <CalculatedField
          label="Total Labor Cost"
          value={formatCurrency(metrics.costs.totalLaborCost)}
        />
        <CalculatedField
          label="Labor % of Revenue"
          value={formatPercent(metrics.costs.laborPercent)}
          severity={laborSeverity as 'healthy' | 'warning' | 'critical'}
        />
        <CalculatedField
          label="Revenue per Labor Hour"
          value={formatCurrency(metrics.costs.revenuePerLaborHour)}
        />
        <CalculatedField
          label="Capacity Utilization"
          value={formatPercent(metrics.costs.capacityUtilization)}
        />
      </div>
    </SectionWrapper>
  );
}
