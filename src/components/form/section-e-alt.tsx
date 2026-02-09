'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { PercentageInput } from './percentage-input';
import { CalculatedField } from './calculated-field';
import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionEAlt({ register, errors }: Props) {
  const metrics = useMetrics();

  return (
    <SectionWrapper title="E. Owner's Draw" description="How much you want to pay yourself">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput<FormData>
          label="Target Monthly Draw"
          name="sectionEAlt.targetMonthlyDraw"
          register={register}
          error={errors.sectionEAlt?.targetMonthlyDraw?.message}
        />
        <PercentageInput<FormData>
          label="Reinvestment %"
          name="sectionEAlt.reinvestmentPercent"
          register={register}
          error={errors.sectionEAlt?.reinvestmentPercent?.message}
          placeholder="25"
        />
      </div>

      <div className="mt-4 space-y-2">
        <CalculatedField
          label="Sustainable Monthly Draw"
          value={formatCurrency(metrics.ownerDraw.sustainableMonthlyDraw)}
          severity={
            metrics.ownerDraw.sustainableMonthlyDraw <= 0 ? 'critical'
              : metrics.ownerDraw.sustainableMonthlyDraw < (metrics.ownerDraw.ownerDrawBudget * 0.5) ? 'warning'
                : 'healthy'
          }
        />
        <CalculatedField
          label="Owner's Draw Budget"
          value={formatCurrency(metrics.ownerDraw.ownerDrawBudget)}
        />
        <CalculatedField
          label="Reinvestment Reserve"
          value={formatCurrency(metrics.ownerDraw.reinvestmentReserve)}
        />
        <CalculatedField
          label="Draw % of Revenue"
          value={formatPercent(metrics.ownerDraw.drawPercentOfRevenue)}
          severity={
            metrics.ownerDraw.drawPercentOfRevenue > 15 ? 'warning' : 'healthy'
          }
        />
      </div>
    </SectionWrapper>
  );
}
