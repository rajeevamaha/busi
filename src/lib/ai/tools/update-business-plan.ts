import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { FormData, defaultFormData } from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { formatCurrency, formatPercent } from '@/lib/utils';

const sectionEnum = z.enum([
  'sectionA', 'sectionB', 'sectionC', 'sectionD',
  'sectionE', 'sectionEAlt', 'sectionF', 'sectionG', 'sectionH',
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUpdateBusinessPlan(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Update fields in a business plan section. Use this to set/change any business data the user mentions.
Sections: sectionA (business basics: businessName, businessType, teamSize, city, floorArea, seatingCapacity, operatingDaysPerMonth, operatingHoursPerDay),
sectionB (revenue: avgSellingPrice, avgOrderValue, ordersPerDay, unitsProducedPerDay, unitsSoldPerDay, itemsListedOnMenu, revenueMonthMinus1, revenueMonthMinus2, pricingMode, menuItems, additionalRevenueStreams),
sectionC (rent: monthlyRent, securityDeposit, utilities, maintenanceCam),
sectionD (COGS: ingredientCostPerUnit, packagingCostPerUnit, monthlyRawMaterialCost, packagingCostMonthly, wastagePercent),
sectionE (labor/team: numberOfEmployees, avgHourlyRate, avgHoursPerEmployeePerMonth, totalMonthlySalaries, benefitsInsurance, maxOutputPerStaffHour),
sectionEAlt (owner draw/solo: targetMonthlyDraw, reinvestmentPercent),
sectionF (marketing: monthlyMarketingSpend, platformCommissions, revenueAttributedToMarketing),
sectionG (other expenses: licensesPermits, insurance, technologyPosSoftware, loanEmiInterest, miscellaneous),
sectionH (investment: totalInitialInvestment, fundingSource, loanAmount, interestRate)`,
    parameters: z.object({
      section: sectionEnum.describe('The form section to update'),
      data: z.record(z.string(), z.union([
        z.string(), z.number(), z.boolean(),
        z.array(z.any()),
      ])).describe('Key-value pairs of fields to set in the section'),
    }),
    execute: async ({ section, data }: { section: keyof FormData; data: Record<string, unknown> }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
      });
      if (!plan) return { success: false, error: 'Plan not found' };

      const currentFormData: FormData = {
        ...defaultFormData,
        ...(plan.formData as unknown as FormData),
      };

      const updatedSection = { ...currentFormData[section], ...data };
      const newFormData: FormData = { ...currentFormData, [section]: updatedSection };

      await prisma.businessPlan.update({
        where: { id: planId },
        data: { formData: JSON.parse(JSON.stringify(newFormData)) },
      });

      const metrics = calculateMetrics(newFormData);
      const { score } = calculateHealthScore(newFormData, metrics);

      return {
        success: true,
        updatedSection: section,
        updatedFields: Object.keys(data),
        healthScore: score,
        netProfit: metrics.profitability.netProfit,
        netProfitFormatted: formatCurrency(metrics.profitability.netProfit),
        netMarginPercent: formatPercent(metrics.profitability.netMarginPercent),
        monthlyRevenue: formatCurrency(metrics.revenue.totalRevenue),
      };
    },
  });
}
