'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { FormData } from '@/lib/engine/types';

export function useDebouncedSync(formValues: FormData, delay = 300) {
  const setFormData = useBusinessPlanStore((s) => s.setFormData);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
    const serialized = JSON.stringify(formValues);
    if (serialized === lastSyncedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      lastSyncedRef.current = serialized;
      setFormData(formValues);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formValues, delay, setFormData]);
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as unknown as T;
}
