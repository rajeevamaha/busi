import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, AllMetrics, defaultFormData } from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { formatCurrency, formatPercent } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createGetMetrics(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Read calculated business metrics. Use this when the user asks about their numbers, performance, or financial health.
Categories: revenue, costs, profitability, breakEven, growth, trends, ownerDraw, healthScore, all`,
    parameters: z.object({
      category: z.enum([
        'revenue', 'costs', 'profitability', 'breakEven',
        'growth', 'trends', 'ownerDraw', 'healthScore', 'all',
      ]).describe('Which category of metrics to return'),
    }),
    execute: async ({ category }: { category: string }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
      });
      if (!plan) return { error: 'Plan not found' };

      const formData = { ...defaultFormData, ...(plan.formData as unknown as FormData) };
      const metrics = calculateMetrics(formData);
      const { score, breakdown } = calculateHealthScore(formData, metrics);
      metrics.healthScore = score;
      metrics.healthScoreBreakdown = breakdown;

      if (category === 'all') {
        return {
          revenue: fmtRevenue(metrics),
          costs: fmtCosts(metrics),
          profitability: fmtProfit(metrics),
          breakEven: fmtBreakEven(metrics),
          growth: fmtGrowth(metrics),
          trends: fmtTrends(metrics),
          ownerDraw: fmtOwnerDraw(metrics),
          healthScore: score,
        };
      }

      const formatters: Record<string, () => unknown> = {
        revenue: () => fmtRevenue(metrics),
        costs: () => fmtCosts(metrics),
        profitability: () => fmtProfit(metrics),
        breakEven: () => fmtBreakEven(metrics),
        growth: () => fmtGrowth(metrics),
        trends: () => fmtTrends(metrics),
        ownerDraw: () => fmtOwnerDraw(metrics),
        healthScore: () => ({ score, breakdown }),
      };

      return formatters[category]?.() ?? { error: 'Unknown category' };
    },
  });
}

function fmtRevenue(m: AllMetrics) {
  return {
    monthlyRevenue: formatCurrency(m.revenue.monthlyRevenue),
    additionalRevenue: formatCurrency(m.revenue.additionalRevenue),
    totalRevenue: formatCurrency(m.revenue.totalRevenue),
    avgOrderValue: formatCurrency(m.revenue.avgOrderValue),
    demandFulfillmentRate: formatPercent(m.revenue.demandFulfillmentRate),
    sellOutRate: formatPercent(m.revenue.sellOutRate),
  };
}

function fmtCosts(m: AllMetrics) {
  return {
    totalCogs: formatCurrency(m.costs.totalCogs),
    cogsPercent: formatPercent(m.costs.cogsPercent),
    wastageCost: formatCurrency(m.costs.wastageCost),
    totalLaborCost: formatCurrency(m.costs.totalLaborCost),
    laborPercent: formatPercent(m.costs.laborPercent),
    totalOccupancyCost: formatCurrency(m.costs.totalOccupancyCost),
    rentPercent: formatPercent(m.costs.rentPercent),
    marketingPercent: formatPercent(m.costs.marketingPercent),
    totalOperatingCosts: formatCurrency(m.costs.totalOperatingCosts),
    revenuePerSqFt: formatCurrency(m.costs.revenuePerSqFt),
    capacityUtilization: formatPercent(m.costs.capacityUtilization),
  };
}

function fmtProfit(m: AllMetrics) {
  return {
    grossProfit: formatCurrency(m.profitability.grossProfit),
    grossMarginPercent: formatPercent(m.profitability.grossMarginPercent),
    netProfit: formatCurrency(m.profitability.netProfit),
    netMarginPercent: formatPercent(m.profitability.netMarginPercent),
  };
}

function fmtBreakEven(m: AllMetrics) {
  return {
    contributionMargin: formatCurrency(m.breakEven.contributionMargin),
    breakEvenUnits: Math.round(m.breakEven.breakEvenUnits),
    breakEvenRevenue: formatCurrency(m.breakEven.breakEvenRevenue),
    marginOfSafety: formatPercent(m.breakEven.marginOfSafety),
  };
}

function fmtGrowth(m: AllMetrics) {
  return {
    capacityCeiling: Math.round(m.growth.capacityCeiling),
    growthHeadroom: Math.round(m.growth.growthHeadroom),
    revenuePerSqFt: formatCurrency(m.growth.revenuePerSqFt),
  };
}

function fmtTrends(m: AllMetrics) {
  return {
    threeMonthRevenueTrend: formatPercent(m.trends.threeMonthRevenueTrend),
    burnRate: formatCurrency(m.trends.burnRate),
    paybackPeriod: m.trends.paybackPeriod > 0 ? `${m.trends.paybackPeriod.toFixed(1)} months` : 'N/A',
  };
}

function fmtOwnerDraw(m: AllMetrics) {
  return {
    ownerDrawBudget: formatCurrency(m.ownerDraw.ownerDrawBudget),
    reinvestmentReserve: formatCurrency(m.ownerDraw.reinvestmentReserve),
    sustainableMonthlyDraw: formatCurrency(m.ownerDraw.sustainableMonthlyDraw),
    drawPercentOfRevenue: formatPercent(m.ownerDraw.drawPercentOfRevenue),
    monthsToLivingWage: m.ownerDraw.monthsToLivingWage,
    emergencyRunway: `${m.ownerDraw.emergencyRunway.toFixed(1)} months`,
  };
}
