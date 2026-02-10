// ===== Business Types =====
export type BusinessType = 'bakery' | 'restaurant' | 'cafe' | 'cloud_kitchen' | 'food_truck';

export type TeamSize = 'just_me' | 'family_2' | 'small_team_3_5' | 'team_6_plus';

export type FundingSource = 'self_funded' | 'loan' | 'investor' | 'mixed';

export type PlanTier = 'FREE' | 'PAID';

// ===== Form Data Types (Sections A-H) =====
export interface SectionA {
  businessName: string;
  businessType: BusinessType;
  teamSize: TeamSize;
  city: string;
  floorArea: number;
  seatingCapacity: number;
  operatingDaysPerMonth: number;
  operatingHoursPerDay: number;
}

export interface RevenueStream {
  name: string;
  monthlyRevenue: number;
}

export interface MenuItem {
  name: string;
  category: string;
  price: number;
  avgQtyPerOrder: number;
}

export interface SectionB {
  pricingMode: 'manual' | 'itemized';
  menuItems: MenuItem[];
  avgSellingPrice: number;
  avgOrderValue: number;
  ordersPerDay: number;
  unitsProducedPerDay: number;
  unitsSoldPerDay: number;
  itemsListedOnMenu: number;
  revenueMonthMinus1: number;
  revenueMonthMinus2: number;
  additionalRevenueStreams: RevenueStream[];
}

export interface SectionC {
  monthlyRent: number;
  securityDeposit: number;
  utilities: number;
  maintenanceCam: number;
}

export interface SectionD {
  ingredientCostPerUnit: number;
  packagingCostPerUnit: number;
  monthlyRawMaterialCost: number;
  packagingCostMonthly: number;
  wastagePercent: number;
}

export interface SectionE {
  numberOfEmployees: number;
  avgHourlyRate: number;
  avgHoursPerEmployeePerMonth: number;
  totalMonthlySalaries: number;
  benefitsInsurance: number;
  maxOutputPerStaffHour: number;
}

export interface SectionEAlt {
  targetMonthlyDraw: number;
  reinvestmentPercent: number;
}

export interface SectionF {
  monthlyMarketingSpend: number;
  platformCommissions: number;
  revenueAttributedToMarketing: number;
}

export interface SectionG {
  licensesPermits: number;
  insurance: number;
  technologyPosSoftware: number;
  loanEmiInterest: number;
  miscellaneous: number;
}

export interface SectionH {
  totalInitialInvestment: number;
  fundingSource: FundingSource;
  loanAmount: number;
  interestRate: number;
}

export interface FormData {
  sectionA: SectionA;
  sectionB: SectionB;
  sectionC: SectionC;
  sectionD: SectionD;
  sectionE: SectionE;
  sectionEAlt: SectionEAlt;
  sectionF: SectionF;
  sectionG: SectionG;
  sectionH: SectionH;
}

// ===== Calculated Metrics =====
export interface RevenueMetrics {
  monthlyRevenue: number;
  avgOrderValue: number;
  demandFulfillmentRate: number;
  sellOutRate: number;
  additionalRevenue: number;
  totalRevenue: number;
}

export interface CostMetrics {
  cogsPerUnit: number;
  totalCogs: number;
  cogsPercent: number;
  wastageCost: number;
  totalLaborCost: number;
  laborPercent: number;
  revenuePerLaborHour: number;
  capacityUtilization: number;
  totalOccupancyCost: number;
  rentPercent: number;
  fixedCostRatio: number;
  revenuePerSqFt: number;
  marketingPercent: number;
  marketingRoi: number;
  totalOperatingCosts: number;
  totalOperatingCostPercent: number;
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  grossMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
}

export interface BreakEvenMetrics {
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  marginOfSafety: number;
}

export interface GrowthMetrics {
  capacityCeiling: number;
  growthHeadroom: number;
  revenuePerSqFt: number;
}

export interface TrendMetrics {
  threeMonthRevenueTrend: number;
  burnRate: number;
  paybackPeriod: number;
}

export interface OwnerDrawMetrics {
  ownerDrawBudget: number;
  reinvestmentReserve: number;
  sustainableMonthlyDraw: number;
  drawPercentOfRevenue: number;
  monthsToLivingWage: number;
  emergencyRunway: number;
}

export interface HealthScoreBreakdown {
  netMarginScore: number;
  cogsScore: number;
  laborScore: number;
  rentScore: number;
  capacityScore: number;
  revenueTrendScore: number;
  ownerDrawScore: number;
}

export interface AllMetrics {
  revenue: RevenueMetrics;
  costs: CostMetrics;
  profitability: ProfitabilityMetrics;
  breakEven: BreakEvenMetrics;
  growth: GrowthMetrics;
  trends: TrendMetrics;
  ownerDraw: OwnerDrawMetrics;
  healthScore: number;
  healthScoreBreakdown: HealthScoreBreakdown;
}

// ===== Rule Engine =====
export type AlertSeverity = 'healthy' | 'warning' | 'critical';

export interface Alert {
  id: string;
  category: string;
  severity: AlertSeverity;
  value: number;
  benchmark: number;
  message: string;
  recommendations: string[];
}

export interface CompoundInsight {
  id: string;
  triggers: string[];
  message: string;
  priority: number;
}

// ===== Benchmark =====
export interface BenchmarkThreshold {
  category: string;
  businessType: BusinessType;
  healthyMin: number;
  healthyMax: number;
  warningThreshold: number;
  criticalThreshold: number;
}

// ===== Scenario =====
export interface ScenarioOverrides {
  priceChange?: number;       // percentage change
  volumeChange?: number;      // percentage change
  cogsChange?: number;        // percentage change
  laborChange?: number;       // percentage change
  rentChange?: number;        // absolute change
}

// ===== Helpers =====
export function isSoloOrFamily(teamSize: TeamSize): boolean {
  return teamSize === 'just_me' || teamSize === 'family_2';
}

export const defaultFormData: FormData = {
  sectionA: {
    businessName: '',
    businessType: 'bakery',
    teamSize: 'just_me',
    city: '',
    floorArea: 0,
    seatingCapacity: 0,
    operatingDaysPerMonth: 26,
    operatingHoursPerDay: 10,
  },
  sectionB: {
    pricingMode: 'manual',
    menuItems: [],
    avgSellingPrice: 0,
    avgOrderValue: 0,
    ordersPerDay: 0,
    unitsProducedPerDay: 0,
    unitsSoldPerDay: 0,
    itemsListedOnMenu: 0,
    revenueMonthMinus1: 0,
    revenueMonthMinus2: 0,
    additionalRevenueStreams: [],
  },
  sectionC: {
    monthlyRent: 0,
    securityDeposit: 0,
    utilities: 0,
    maintenanceCam: 0,
  },
  sectionD: {
    ingredientCostPerUnit: 0,
    packagingCostPerUnit: 0,
    monthlyRawMaterialCost: 0,
    packagingCostMonthly: 0,
    wastagePercent: 5,
  },
  sectionE: {
    numberOfEmployees: 0,
    avgHourlyRate: 0,
    avgHoursPerEmployeePerMonth: 0,
    totalMonthlySalaries: 0,
    benefitsInsurance: 0,
    maxOutputPerStaffHour: 0,
  },
  sectionEAlt: {
    targetMonthlyDraw: 0,
    reinvestmentPercent: 25,
  },
  sectionF: {
    monthlyMarketingSpend: 0,
    platformCommissions: 0,
    revenueAttributedToMarketing: 0,
  },
  sectionG: {
    licensesPermits: 0,
    insurance: 0,
    technologyPosSoftware: 0,
    loanEmiInterest: 0,
    miscellaneous: 0,
  },
  sectionH: {
    totalInitialInvestment: 0,
    fundingSource: 'self_funded',
    loanAmount: 0,
    interestRate: 0,
  },
};
