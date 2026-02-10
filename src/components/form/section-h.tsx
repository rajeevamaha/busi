'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { PercentageInput } from './percentage-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalculatedField } from './calculated-field';
import { useMetrics } from '@/hooks/use-calculations';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: (name: `sectionH.${keyof FormData['sectionH'] & string}`, value: unknown) => void;
  watch: (name: string) => unknown;
}

export function SectionH({ register, errors, setValue, watch }: Props) {
  const fundingSource = watch('sectionH.fundingSource') as string;
  const metrics = useMetrics();

  return (
    <SectionWrapper title="H. Investment & Capital" description="Startup investment and funding">
      <div className="grid gap-3 sm:grid-cols-2">
        <CurrencyInput<FormData>
          label="Total Initial Investment"
          name="sectionH.totalInitialInvestment"
          register={register}
          error={errors.sectionH?.totalInitialInvestment?.message}
        />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Funding Source</Label>
          <Select value={fundingSource} onValueChange={(v) => setValue('sectionH.fundingSource', v)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_funded">Self-funded</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(fundingSource === 'loan' || fundingSource === 'mixed') && (
          <>
            <CurrencyInput<FormData>
              label="Loan Amount"
              name="sectionH.loanAmount"
              register={register}
              error={errors.sectionH?.loanAmount?.message}
            />
            <PercentageInput<FormData>
              label="Interest Rate"
              name="sectionH.interestRate"
              register={register}
              error={errors.sectionH?.interestRate?.message}
            />
          </>
        )}
      </div>

      {metrics.trends.paybackPeriod > 0 && (
        <div className="mt-3">
          <CalculatedField
            label="Payback Period"
            value={`${metrics.trends.paybackPeriod.toFixed(1)} months`}
          />
        </div>
      )}
    </SectionWrapper>
  );
}
