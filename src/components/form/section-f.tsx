'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { CalculatedField } from './calculated-field';
import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { formatPercent } from '@/lib/utils';
import { getBenchmark } from '@/lib/engine/benchmarks';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionF({ register, errors }: Props) {
  const metrics = useMetrics();
  const formData = useFormData();
  const benchmark = getBenchmark('marketing_percent', formData.sectionA.businessType);
  const mktSeverity = benchmark
    ? metrics.costs.marketingPercent > benchmark.criticalThreshold ? 'critical'
      : metrics.costs.marketingPercent > benchmark.warningThreshold ? 'warning'
        : 'healthy'
    : undefined;

  return (
    <SectionWrapper title="F. Marketing" description="Advertising and platform costs">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput<FormData>
          label="Monthly Marketing Spend"
          name="sectionF.monthlyMarketingSpend"
          register={register}
          error={errors.sectionF?.monthlyMarketingSpend?.message}
        />
        <CurrencyInput<FormData>
          label="Platform Commissions"
          name="sectionF.platformCommissions"
          register={register}
          error={errors.sectionF?.platformCommissions?.message}
        />
        <CurrencyInput<FormData>
          label="Revenue from Marketing (optional)"
          name="sectionF.revenueAttributedToMarketing"
          register={register}
          error={errors.sectionF?.revenueAttributedToMarketing?.message}
        />
      </div>

      <div className="mt-4 space-y-2">
        <CalculatedField
          label="Marketing % of Revenue"
          value={formatPercent(metrics.costs.marketingPercent)}
          severity={mktSeverity as 'healthy' | 'warning' | 'critical'}
        />
        <CalculatedField
          label="Marketing ROI"
          value={formatPercent(metrics.costs.marketingRoi)}
        />
      </div>
    </SectionWrapper>
  );
}
