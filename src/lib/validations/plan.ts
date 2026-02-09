import { z } from 'zod';

const nonNegative = z.number().min(0, 'Must be 0 or greater');
const positiveOrZero = z.number().min(0);
const percentage = z.number().min(0).max(100);

export const sectionASchema = z.object({
  businessName: z.string().max(200).default(''),
  businessType: z.enum(['bakery', 'restaurant', 'cafe', 'cloud_kitchen', 'food_truck']),
  teamSize: z.enum(['just_me', 'family_2', 'small_team_3_5', 'team_6_plus']),
  city: z.string().max(200).default(''),
  floorArea: positiveOrZero.default(0),
  seatingCapacity: positiveOrZero.default(0),
  operatingDaysPerMonth: z.number().min(1).max(31).default(26),
  operatingHoursPerDay: z.number().min(1).max(24).default(10),
});

const revenueStreamSchema = z.object({
  name: z.string().max(100),
  monthlyRevenue: nonNegative,
});

export const sectionBSchema = z.object({
  avgSellingPrice: nonNegative.default(0),
  avgOrderValue: nonNegative.default(0),
  ordersPerDay: nonNegative.default(0),
  unitsProducedPerDay: nonNegative.default(0),
  unitsSoldPerDay: nonNegative.default(0),
  itemsListedOnMenu: positiveOrZero.default(0),
  revenueMonthMinus1: nonNegative.default(0),
  revenueMonthMinus2: nonNegative.default(0),
  additionalRevenueStreams: z.array(revenueStreamSchema).default([]),
});

export const sectionCSchema = z.object({
  monthlyRent: nonNegative.default(0),
  securityDeposit: nonNegative.default(0),
  utilities: nonNegative.default(0),
  maintenanceCam: nonNegative.default(0),
});

export const sectionDSchema = z.object({
  ingredientCostPerUnit: nonNegative.default(0),
  packagingCostPerUnit: nonNegative.default(0),
  monthlyRawMaterialCost: nonNegative.default(0),
  packagingCostMonthly: nonNegative.default(0),
  wastagePercent: percentage.default(5),
});

export const sectionESchema = z.object({
  numberOfEmployees: positiveOrZero.default(0),
  avgHourlyRate: nonNegative.default(0),
  avgHoursPerEmployeePerMonth: nonNegative.default(0),
  totalMonthlySalaries: nonNegative.default(0),
  benefitsInsurance: nonNegative.default(0),
  maxOutputPerStaffHour: nonNegative.default(0),
});

export const sectionEAltSchema = z.object({
  targetMonthlyDraw: nonNegative.default(0),
  reinvestmentPercent: percentage.default(25),
});

export const sectionFSchema = z.object({
  monthlyMarketingSpend: nonNegative.default(0),
  platformCommissions: nonNegative.default(0),
  revenueAttributedToMarketing: nonNegative.default(0),
});

export const sectionGSchema = z.object({
  licensesPermits: nonNegative.default(0),
  insurance: nonNegative.default(0),
  technologyPosSoftware: nonNegative.default(0),
  loanEmiInterest: nonNegative.default(0),
  miscellaneous: nonNegative.default(0),
});

export const sectionHSchema = z.object({
  totalInitialInvestment: nonNegative.default(0),
  fundingSource: z.enum(['self_funded', 'loan', 'investor', 'mixed']).default('self_funded'),
  loanAmount: nonNegative.default(0),
  interestRate: percentage.default(0),
});

export const formDataSchema = z.object({
  sectionA: sectionASchema,
  sectionB: sectionBSchema,
  sectionC: sectionCSchema,
  sectionD: sectionDSchema,
  sectionE: sectionESchema,
  sectionEAlt: sectionEAltSchema,
  sectionF: sectionFSchema,
  sectionG: sectionGSchema,
  sectionH: sectionHSchema,
});

export type FormDataInput = z.infer<typeof formDataSchema>;
