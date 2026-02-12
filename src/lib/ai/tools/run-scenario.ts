import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, defaultFormData } from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { calculateScenario } from '@/lib/engine/scenarios';
import { formatCurrency, formatPercent } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createRunScenario(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Run a what-if scenario analysis. Adjusts price, volume, COGS, labor, or rent and shows current vs projected metrics side-by-side. Use when the user says "what if", "if I change", "scenario", etc.`,
    parameters: z.object({
      priceChange: z.number().optional().describe('Price change as percentage (e.g. 10 for +10%, -5 for -5%)'),
      volumeChange: z.number().optional().describe('Volume/sales change as percentage'),
      cogsChange: z.number().optional().describe('Ingredient cost change as percentage'),
      laborChange: z.number().optional().describe('Labor cost change as percentage'),
      rentChange: z.number().optional().describe('Rent change as absolute dollar amount (e.g. 500 for +$500)'),
    }),
    execute: async (overrides: { priceChange?: number; volumeChange?: number; cogsChange?: number; laborChange?: number; rentChange?: number }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
      });
      if (!plan) return { error: 'Plan not found' };

      const formData = { ...defaultFormData, ...(plan.formData as unknown as FormData) };
      const currentMetrics = calculateMetrics(formData);
      const { score: currentScore } = calculateHealthScore(formData, currentMetrics);
      const scenario = calculateScenario(formData, overrides);

      return {
        adjustments: Object.entries(overrides)
          .filter(([, v]) => v !== undefined && v !== 0)
          .map(([k, v]) => `${k}: ${k === 'rentChange' ? formatCurrency(v as number) : `${v}%`}`)
          .join(', '),
        current: {
          monthlyRevenue: formatCurrency(currentMetrics.revenue.totalRevenue),
          netProfit: formatCurrency(currentMetrics.profitability.netProfit),
          netMargin: formatPercent(currentMetrics.profitability.netMarginPercent),
          grossMargin: formatPercent(currentMetrics.profitability.grossMarginPercent),
          healthScore: currentScore,
          breakEvenRevenue: formatCurrency(currentMetrics.breakEven.breakEvenRevenue),
          marginOfSafety: formatPercent(currentMetrics.breakEven.marginOfSafety),
        },
        projected: {
          monthlyRevenue: formatCurrency(scenario.metrics.revenue.totalRevenue),
          netProfit: formatCurrency(scenario.metrics.profitability.netProfit),
          netMargin: formatPercent(scenario.metrics.profitability.netMarginPercent),
          grossMargin: formatPercent(scenario.metrics.profitability.grossMarginPercent),
          healthScore: scenario.metrics.healthScore,
          breakEvenRevenue: formatCurrency(scenario.metrics.breakEven.breakEvenRevenue),
          marginOfSafety: formatPercent(scenario.metrics.breakEven.marginOfSafety),
        },
        impact: {
          revenueChange: formatCurrency(scenario.metrics.revenue.totalRevenue - currentMetrics.revenue.totalRevenue),
          profitChange: formatCurrency(scenario.metrics.profitability.netProfit - currentMetrics.profitability.netProfit),
          healthScoreChange: scenario.metrics.healthScore - currentScore,
        },
        newAlerts: scenario.alerts
          .filter(a => a.severity === 'critical' || a.severity === 'warning')
          .map(a => a.message),
      };
    },
  });
}
