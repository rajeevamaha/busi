import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, defaultFormData } from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSuggestPricing(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Analyze cost structure and suggest prices for target food cost % and net margin %. Use when the user asks about pricing, what to charge, or how to improve margins.`,
    parameters: z.object({
      targetFoodCostPercent: z.number().min(1).max(80).optional()
        .describe('Target food cost as % of price (default 30)'),
      targetNetMarginPercent: z.number().min(1).max(50).optional()
        .describe('Target net profit margin % (default 15)'),
    }),
    execute: async ({ targetFoodCostPercent = 30, targetNetMarginPercent = 15 }: { targetFoodCostPercent?: number; targetNetMarginPercent?: number }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
      });
      if (!plan) return { error: 'Plan not found' };

      const formData = { ...defaultFormData, ...(plan.formData as unknown as FormData) };
      const metrics = calculateMetrics(formData);

      const ingredientCost = formData.sectionD.ingredientCostPerUnit;
      const packagingCost = formData.sectionD.packagingCostPerUnit;
      const totalCostPerUnit = ingredientCost + packagingCost;

      if (totalCostPerUnit <= 0) {
        return { error: 'No cost per unit data. Enter ingredient/packaging cost in Section D first.' };
      }

      const priceForFoodCost = totalCostPerUnit / (targetFoodCostPercent / 100);

      const monthlyFixedCosts = metrics.costs.totalOperatingCosts - metrics.costs.totalCogs - metrics.costs.wastageCost;
      const unitsSoldPerMonth = formData.sectionB.unitsSoldPerDay * formData.sectionA.operatingDaysPerMonth;
      const fixedCostPerUnit = unitsSoldPerMonth > 0 ? monthlyFixedCosts / unitsSoldPerMonth : 0;
      const priceForNetMargin = (totalCostPerUnit + fixedCostPerUnit) / (1 - targetNetMarginPercent / 100);

      const suggestedPrice = Math.max(priceForFoodCost, priceForNetMargin);

      return {
        currentPricing: {
          avgSellingPrice: formatCurrency(formData.sectionB.avgSellingPrice),
          ingredientCostPerUnit: formatCurrency(ingredientCost),
          packagingCostPerUnit: formatCurrency(packagingCost),
          currentFoodCostPercent: formatPercent(metrics.costs.cogsPercent),
          currentNetMarginPercent: formatPercent(metrics.profitability.netMarginPercent),
        },
        suggestions: {
          priceForTargetFoodCost: {
            price: formatCurrency(priceForFoodCost),
            targetFoodCostPercent: formatPercent(targetFoodCostPercent),
          },
          priceForTargetNetMargin: {
            price: formatCurrency(priceForNetMargin),
            targetNetMarginPercent: formatPercent(targetNetMarginPercent),
          },
          recommendedPrice: formatCurrency(suggestedPrice),
          priceChangeNeeded: formatCurrency(suggestedPrice - formData.sectionB.avgSellingPrice),
          priceChangePercent: formData.sectionB.avgSellingPrice > 0
            ? formatPercent(((suggestedPrice - formData.sectionB.avgSellingPrice) / formData.sectionB.avgSellingPrice) * 100)
            : 'N/A',
        },
      };
    },
  });
}
