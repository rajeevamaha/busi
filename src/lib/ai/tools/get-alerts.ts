import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, defaultFormData } from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { runRules } from '@/lib/engine/rules';
import { runCompoundRules } from '@/lib/engine/compound-rules';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createGetAlerts(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Get all current alerts and compound insights for the business plan. Use when the user asks about problems, issues, warnings, things to fix, or wants a health check.`,
    parameters: z.object({
      severity: z.enum(['all', 'critical', 'warning', 'healthy'])
        .optional()
        .default('all')
        .describe('Filter by severity level'),
    }),
    execute: async ({ severity }: { severity: string }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
      });
      if (!plan) return { error: 'Plan not found' };

      const formData = { ...defaultFormData, ...(plan.formData as unknown as FormData) };
      const metrics = calculateMetrics(formData);
      const { score } = calculateHealthScore(formData, metrics);
      let alerts = runRules(formData, metrics);
      const insights = runCompoundRules(formData, metrics);

      if (severity !== 'all') {
        alerts = alerts.filter(a => a.severity === severity);
      }

      return {
        healthScore: score,
        alertCount: alerts.length,
        alerts: alerts.map(a => ({
          severity: a.severity,
          category: a.category,
          message: a.message,
          recommendations: a.recommendations,
        })),
        insights: insights.map(i => ({
          message: i.message,
          priority: i.priority,
          triggers: i.triggers,
        })),
      };
    },
  });
}
