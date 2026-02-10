'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { NumberInput } from './number-input';
import { CalculatedField } from './calculated-field';
import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency } from '@/lib/utils';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionB({ register, errors }: Props) {
  const metrics = useMetrics();

  return (
    <SectionWrapper title="B. Revenue & Demand" description="Your sales and pricing">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <CurrencyInput<FormData>
            label="Average Selling Price / Item"
            name="sectionB.avgSellingPrice"
            register={register}
            error={errors.sectionB?.avgSellingPrice?.message}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Sum of all item prices ÷ number of items. E.g. if you sell 3 items at $10, $15, $20 → ASP = $15
          </p>
        </div>
        <div>
          <CurrencyInput<FormData>
            label="Average Order Value (AOV)"
            name="sectionB.avgOrderValue"
            register={register}
            error={errors.sectionB?.avgOrderValue?.message}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            AOV = ASP × items per order. If customers buy 2 items on avg at $15 each → AOV = $30
          </p>
        </div>
        <NumberInput<FormData>
          label="Orders per Day"
          name="sectionB.ordersPerDay"
          register={register}
          error={errors.sectionB?.ordersPerDay?.message}
        />
        <NumberInput<FormData>
          label="Units Produced per Day"
          name="sectionB.unitsProducedPerDay"
          register={register}
          error={errors.sectionB?.unitsProducedPerDay?.message}
        />
        <NumberInput<FormData>
          label="Units Sold per Day"
          name="sectionB.unitsSoldPerDay"
          register={register}
          error={errors.sectionB?.unitsSoldPerDay?.message}
        />
        <NumberInput<FormData>
          label="Items Listed on Menu"
          name="sectionB.itemsListedOnMenu"
          register={register}
          error={errors.sectionB?.itemsListedOnMenu?.message}
        />
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Historical Revenue (optional)</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <CurrencyInput<FormData>
            label="Revenue Month -1"
            name="sectionB.revenueMonthMinus1"
            register={register}
          />
          <CurrencyInput<FormData>
            label="Revenue Month -2"
            name="sectionB.revenueMonthMinus2"
            register={register}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <CalculatedField
          label="Monthly Revenue"
          value={formatCurrency(metrics.revenue.monthlyRevenue)}
        />
        <CalculatedField
          label="Total Revenue (incl. additional)"
          value={formatCurrency(metrics.revenue.totalRevenue)}
        />
        <CalculatedField
          label="Demand Fulfillment Rate"
          value={`${metrics.revenue.demandFulfillmentRate.toFixed(1)}%`}
        />
      </div>
    </SectionWrapper>
  );
}
