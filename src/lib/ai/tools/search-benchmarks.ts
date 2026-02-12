import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, BusinessType } from '@/lib/engine/types';
import { getBenchmark, getAllBenchmarks } from '@/lib/engine/benchmarks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSearchBenchmarks(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Look up industry benchmark thresholds for any metric and business type. Use when the user asks about benchmarks, industry standards, healthy ranges, or what's normal.
Categories: rent_percent, cogs_percent, labor_percent, marketing_percent, total_operating_cost_percent, net_margin_percent, wastage_percent, capacity_utilization, margin_of_safety, all`,
    parameters: z.object({
      category: z.string().describe('Benchmark category to look up, or "all" for all benchmarks'),
      businessType: z.enum(['bakery', 'restaurant', 'cafe', 'cloud_kitchen', 'food_truck'])
        .optional()
        .describe('Business type (defaults to plan\'s business type)'),
    }),
    execute: async ({ category, businessType: overrideType }: { category: string; businessType?: 'bakery' | 'restaurant' | 'cafe' | 'cloud_kitchen' | 'food_truck' }) => {
      let businessType: BusinessType = 'bakery';
      if (overrideType) {
        businessType = overrideType;
      } else if (planId) {
        const plan = await prisma.businessPlan.findFirst({
          where: { id: planId, userId },
          select: { formData: true },
        });
        if (plan?.formData) {
          const fd = plan.formData as unknown as FormData;
          businessType = fd.sectionA?.businessType || 'bakery';
        }
      }

      if (category === 'all') {
        return {
          businessType,
          benchmarks: getAllBenchmarks(businessType).map(b => ({
            category: b.category,
            healthyRange: `${b.healthyMin}% - ${b.healthyMax}%`,
            warningThreshold: `${b.warningThreshold}%`,
            criticalThreshold: `${b.criticalThreshold}%`,
          })),
        };
      }

      const benchmark = getBenchmark(category, businessType);
      if (!benchmark) {
        return { error: `No benchmark found for "${category}" and "${businessType}"` };
      }

      return {
        category: benchmark.category,
        businessType: benchmark.businessType,
        healthyRange: `${benchmark.healthyMin}% - ${benchmark.healthyMax}%`,
        warningThreshold: `${benchmark.warningThreshold}%`,
        criticalThreshold: `${benchmark.criticalThreshold}%`,
      };
    },
  });
}
