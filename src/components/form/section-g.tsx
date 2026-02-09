'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function SectionG({ register, errors }: Props) {
  return (
    <SectionWrapper title="G. Other Operating Expenses" description="Licenses, insurance, tech, loans">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput<FormData>
          label="Licenses & Permits (monthly)"
          name="sectionG.licensesPermits"
          register={register}
          error={errors.sectionG?.licensesPermits?.message}
        />
        <CurrencyInput<FormData>
          label="Insurance"
          name="sectionG.insurance"
          register={register}
          error={errors.sectionG?.insurance?.message}
        />
        <CurrencyInput<FormData>
          label="Technology / POS / Software"
          name="sectionG.technologyPosSoftware"
          register={register}
          error={errors.sectionG?.technologyPosSoftware?.message}
        />
        <CurrencyInput<FormData>
          label="Loan EMI / Interest"
          name="sectionG.loanEmiInterest"
          register={register}
          error={errors.sectionG?.loanEmiInterest?.message}
        />
        <CurrencyInput<FormData>
          label="Miscellaneous"
          name="sectionG.miscellaneous"
          register={register}
          error={errors.sectionG?.miscellaneous?.message}
        />
      </div>
    </SectionWrapper>
  );
}
