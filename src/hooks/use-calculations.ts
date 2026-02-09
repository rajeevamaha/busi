'use client';

import { useBusinessPlanStore } from '@/stores/business-plan-store';

export function useMetrics() {
  return useBusinessPlanStore((s) => s.metrics);
}

export function useScenarioMetrics() {
  const scenarioMetrics = useBusinessPlanStore((s) => s.scenarioMetrics);
  const metrics = useBusinessPlanStore((s) => s.metrics);
  return scenarioMetrics ?? metrics;
}

export function useHealthScore() {
  const metrics = useBusinessPlanStore((s) => s.metrics);
  return metrics.healthScore;
}

export function useFormData() {
  return useBusinessPlanStore((s) => s.formData);
}
