'use client';

import { useBusinessPlanStore } from '@/stores/business-plan-store';

export function useAlerts() {
  return useBusinessPlanStore((s) => s.alerts);
}

export function useInsights() {
  return useBusinessPlanStore((s) => s.insights);
}

export function useCriticalAlerts() {
  return useBusinessPlanStore((s) => s.alerts.filter((a) => a.severity === 'critical'));
}

export function useWarningAlerts() {
  return useBusinessPlanStore((s) => s.alerts.filter((a) => a.severity === 'warning'));
}
