'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormData, isSoloOrFamily } from '@/lib/engine/types';
import { formDataSchema } from '@/lib/validations/plan';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useDebouncedSync } from '@/hooks/use-debounced-sync';
import { useAutoSave } from '@/hooks/use-auto-save';
import { SectionA } from './section-a';
import { SectionB } from './section-b';
import { SectionC } from './section-c';
import { SectionD } from './section-d';
import { SectionE } from './section-e';
import { SectionEAlt } from './section-e-alt';
import { SectionF } from './section-f';
import { SectionG } from './section-g';
import { SectionH } from './section-h';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PlanForm() {
  const formData = useBusinessPlanStore((s) => s.formData);
  const isDirty = useBusinessPlanStore((s) => s.isDirty);
  const lastSavedAt = useBusinessPlanStore((s) => s.lastSavedAt);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formDataSchema) as any,
    defaultValues: formData,
  });

  // Reset form when store data changes externally (e.g. plan load)
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const watchedValues = watch();
  useDebouncedSync(watchedValues);
  useAutoSave();

  const teamSize = watch('sectionA.teamSize');
  const solo = isSoloOrFamily(teamSize);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-8 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Business Plan</h2>
          <span className="text-xs text-muted-foreground">
            {isDirty ? 'Unsaved changes' : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : ''}
          </span>
        </div>

        <SectionA
          register={register}
          errors={errors}
          setValue={setValue as unknown as Parameters<typeof SectionA>[0]['setValue']}
          watch={watch as unknown as (name: string) => unknown}
        />
        <SectionB register={register} errors={errors} />
        <SectionC register={register} errors={errors} />
        <SectionD register={register} errors={errors} />

        {solo ? (
          <SectionEAlt register={register} errors={errors} />
        ) : (
          <SectionE register={register} errors={errors} />
        )}

        <SectionF register={register} errors={errors} />
        <SectionG register={register} errors={errors} />
        <SectionH
          register={register}
          errors={errors}
          setValue={setValue as unknown as Parameters<typeof SectionH>[0]['setValue']}
          watch={watch as unknown as (name: string) => unknown}
        />
      </div>
    </ScrollArea>
  );
}
