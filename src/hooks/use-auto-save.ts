'use client';

import { useEffect, useRef } from 'react';
import { useBusinessPlanStore } from '@/stores/business-plan-store';

export function useAutoSave(delay = 2000) {
  const planId = useBusinessPlanStore((s) => s.planId);
  const formData = useBusinessPlanStore((s) => s.formData);
  const planName = useBusinessPlanStore((s) => s.planName);
  const isDirty = useBusinessPlanStore((s) => s.isDirty);
  const markSaved = useBusinessPlanStore((s) => s.markSaved);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!planId || !isDirty || isSavingRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      isSavingRef.current = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`/api/plans/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: planName, formData }),
        });

        if (res.ok) {
          markSaved();
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [planId, formData, planName, isDirty, delay, markSaved]);
}
