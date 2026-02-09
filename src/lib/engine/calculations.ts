import {
  FormData,
  AllMetrics,
  RevenueMetrics,
  CostMetrics,
  ProfitabilityMetrics,
  BreakEvenMetrics,
  GrowthMetrics,
  TrendMetrics,
  OwnerDrawMetrics,
  isSoloOrFamily,
} from './types';
import { safeDiv } from '../utils';

// ===== Revenue & Demand =====
function calculateRevenue(data: FormData): RevenueMetrics {
  const { sectionA, sectionB } = data;
  const monthlyRevenue = sectionB.avgSellingPrice * sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth;
  const additionalRevenue = sectionB.additionalRevenueStreams.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalRevenue = monthlyRevenue + additionalRevenue;
  const demandFulfillmentRate = safeDiv(sectionB.unitsSoldPerDay, sectionB.unitsProducedPerDay) * 100;
  const sellOutRate = safeDiv(sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth, sectionB.itemsListedOnMenu > 0 ? sectionB.unitsProducedPerDay * sectionA.operatingDaysPerMonth : 1) * 100;

  return {
    monthlyRevenue,
    avgOrderValue: sectionB.avgOrderValue || safeDiv(totalRevenue, sectionB.ordersPerDay * sectionA.operatingDaysPerMonth),
    demandFulfillmentRate,
    sellOutRate: Math.min(sellOutRate, 100),
    additionalRevenue,
    totalRevenue,
  };
}

// ===== Cost Structure =====
function calculateCosts(data: FormData, revenue: RevenueMetrics): CostMetrics {
  const { sectionA, sectionB, sectionC, sectionD, sectionE, sectionF, sectionG } = data;
  const totalRevenue = revenue.totalRevenue;
  const solo = isSoloOrFamily(sectionA.teamSize);

  // COGS
  const cogsPerUnit = sectionD.ingredientCostPerUnit + sectionD.packagingCostPerUnit;
  const totalCogs = sectionD.monthlyRawMaterialCost + sectionD.packagingCostMonthly > 0
    ? sectionD.monthlyRawMaterialCost + sectionD.packagingCostMonthly
    : cogsPerUnit * sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth;
  const cogsPercent = safeDiv(totalCogs, totalRevenue) * 100;
  const wastageCost = totalCogs * (sectionD.wastagePercent / 100);

  // Labor
  let totalLaborCost = 0;
  let laborPercent = 0;
  let revenuePerLaborHour = 0;
  let capacityUtilization = 0;

  if (!solo) {
    totalLaborCost = sectionE.totalMonthlySalaries > 0
      ? sectionE.totalMonthlySalaries + sectionE.benefitsInsurance
      : (sectionE.numberOfEmployees * sectionE.avgHourlyRate * sectionE.avgHoursPerEmployeePerMonth) + sectionE.benefitsInsurance;
    laborPercent = safeDiv(totalLaborCost, totalRevenue) * 100;
    const totalLaborHours = sectionE.numberOfEmployees * sectionE.avgHoursPerEmployeePerMonth;
    revenuePerLaborHour = safeDiv(totalRevenue, totalLaborHours);
    const maxOutput = sectionE.maxOutputPerStaffHour * totalLaborHours;
    capacityUtilization = safeDiv(sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth, maxOutput) * 100;
  } else {
    // Solo: capacity based on owner's hours
    const ownerHours = sectionA.operatingHoursPerDay * sectionA.operatingDaysPerMonth;
    const maxOutput = sectionE.maxOutputPerStaffHour > 0
      ? sectionE.maxOutputPerStaffHour * ownerHours
      : sectionB.unitsProducedPerDay * sectionA.operatingDaysPerMonth;
    capacityUtilization = safeDiv(sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth, maxOutput) * 100;
  }

  // Rent & occupancy
  const totalOccupancyCost = sectionC.monthlyRent + sectionC.utilities + sectionC.maintenanceCam;
  const rentPercent = safeDiv(sectionC.monthlyRent, totalRevenue) * 100;
  const fixedCostRatio = safeDiv(
    totalOccupancyCost + sectionG.licensesPermits + sectionG.insurance + sectionG.technologyPosSoftware + sectionG.loanEmiInterest,
    totalRevenue
  ) * 100;
  const revenuePerSqFt = safeDiv(totalRevenue, sectionA.floorArea);

  // Marketing
  const totalMarketing = sectionF.monthlyMarketingSpend + sectionF.platformCommissions;
  const marketingPercent = safeDiv(totalMarketing, totalRevenue) * 100;
  const marketingRoi = sectionF.revenueAttributedToMarketing > 0
    ? safeDiv(sectionF.revenueAttributedToMarketing - totalMarketing, totalMarketing) * 100
    : 0;

  // Total operating costs
  const otherOpex = sectionG.licensesPermits + sectionG.insurance + sectionG.technologyPosSoftware + sectionG.loanEmiInterest + sectionG.miscellaneous;
  const totalOperatingCosts = totalCogs + wastageCost + totalLaborCost + totalOccupancyCost + totalMarketing + otherOpex;
  const totalOperatingCostPercent = safeDiv(totalOperatingCosts, totalRevenue) * 100;

  return {
    cogsPerUnit,
    totalCogs,
    cogsPercent,
    wastageCost,
    totalLaborCost,
    laborPercent,
    revenuePerLaborHour,
    capacityUtilization: Math.min(capacityUtilization, 200),
    totalOccupancyCost,
    rentPercent,
    fixedCostRatio,
    revenuePerSqFt,
    marketingPercent,
    marketingRoi,
    totalOperatingCosts,
    totalOperatingCostPercent,
  };
}

// ===== Profitability =====
function calculateProfitability(revenue: RevenueMetrics, costs: CostMetrics): ProfitabilityMetrics {
  const grossProfit = revenue.totalRevenue - costs.totalCogs - costs.wastageCost;
  const grossMarginPercent = safeDiv(grossProfit, revenue.totalRevenue) * 100;
  const netProfit = revenue.totalRevenue - costs.totalOperatingCosts;
  const netMarginPercent = safeDiv(netProfit, revenue.totalRevenue) * 100;

  return { grossProfit, grossMarginPercent, netProfit, netMarginPercent };
}

// ===== Break-Even & Risk =====
function calculateBreakEven(data: FormData, costs: CostMetrics, revenue: RevenueMetrics): BreakEvenMetrics {
  const { sectionB, sectionD, sectionG, sectionC } = data;
  const variableCostPerUnit = sectionD.ingredientCostPerUnit + sectionD.packagingCostPerUnit;
  const contributionMargin = sectionB.avgSellingPrice - variableCostPerUnit;
  const fixedCosts = costs.totalOccupancyCost + costs.totalLaborCost +
    sectionG.licensesPermits + sectionG.insurance + sectionG.technologyPosSoftware +
    sectionG.loanEmiInterest + sectionG.miscellaneous +
    (data.sectionF.monthlyMarketingSpend + data.sectionF.platformCommissions);
  const breakEvenUnits = safeDiv(fixedCosts, contributionMargin);
  const breakEvenRevenue = breakEvenUnits * sectionB.avgSellingPrice;
  const marginOfSafety = revenue.totalRevenue > 0
    ? safeDiv(revenue.totalRevenue - breakEvenRevenue, revenue.totalRevenue) * 100
    : 0;

  return { contributionMargin, breakEvenUnits, breakEvenRevenue, marginOfSafety };
}

// ===== Growth =====
function calculateGrowth(data: FormData, costs: CostMetrics): GrowthMetrics {
  const { sectionA, sectionB, sectionE } = data;
  const solo = isSoloOrFamily(sectionA.teamSize);
  let capacityCeiling: number;

  if (solo) {
    const ownerHours = sectionA.operatingHoursPerDay * sectionA.operatingDaysPerMonth;
    capacityCeiling = sectionE.maxOutputPerStaffHour > 0
      ? sectionE.maxOutputPerStaffHour * ownerHours
      : sectionB.unitsProducedPerDay * sectionA.operatingDaysPerMonth;
  } else {
    const totalHours = sectionE.numberOfEmployees * sectionE.avgHoursPerEmployeePerMonth;
    capacityCeiling = sectionE.maxOutputPerStaffHour > 0
      ? sectionE.maxOutputPerStaffHour * totalHours
      : sectionB.unitsProducedPerDay * sectionA.operatingDaysPerMonth;
  }

  const currentSales = sectionB.unitsSoldPerDay * sectionA.operatingDaysPerMonth;
  const growthHeadroom = Math.max(capacityCeiling - currentSales, 0);

  return {
    capacityCeiling,
    growthHeadroom,
    revenuePerSqFt: costs.revenuePerSqFt,
  };
}

// ===== Trends =====
function calculateTrends(data: FormData, profitability: ProfitabilityMetrics, revenue: RevenueMetrics): TrendMetrics {
  const { sectionB, sectionH } = data;
  // 3-month trend: slope using current, m-1, m-2
  const m0 = revenue.totalRevenue;
  const m1 = sectionB.revenueMonthMinus1;
  const m2 = sectionB.revenueMonthMinus2;

  let threeMonthRevenueTrend = 0;
  if (m1 > 0 && m2 > 0 && m0 > 0) {
    // Simple linear regression slope normalized
    threeMonthRevenueTrend = safeDiv((m0 - m2), m2) * 100;
  } else if (m1 > 0 && m0 > 0) {
    threeMonthRevenueTrend = safeDiv((m0 - m1), m1) * 100;
  }

  const burnRate = profitability.netProfit < 0 ? Math.abs(profitability.netProfit) : 0;
  const paybackPeriod = profitability.netProfit > 0
    ? safeDiv(sectionH.totalInitialInvestment, profitability.netProfit)
    : 0;

  return { threeMonthRevenueTrend, burnRate, paybackPeriod };
}

// ===== Owner's Draw (Solo/Family) =====
function calculateOwnerDraw(data: FormData, profitability: ProfitabilityMetrics, costs: CostMetrics, revenue: RevenueMetrics): OwnerDrawMetrics {
  const { sectionA, sectionEAlt, sectionC, sectionG } = data;

  if (!isSoloOrFamily(sectionA.teamSize)) {
    return {
      ownerDrawBudget: 0,
      reinvestmentReserve: 0,
      sustainableMonthlyDraw: 0,
      drawPercentOfRevenue: 0,
      monthsToLivingWage: 0,
      emergencyRunway: 0,
    };
  }

  const netProfit = profitability.netProfit;
  const reinvestPct = sectionEAlt.reinvestmentPercent / 100;
  const reinvestmentReserve = Math.max(netProfit * reinvestPct, 0);
  const ownerDrawBudget = Math.max(netProfit - reinvestmentReserve, 0);
  const sustainableMonthlyDraw = Math.max(netProfit * (1 - reinvestPct), 0);
  const drawPercentOfRevenue = safeDiv(ownerDrawBudget, revenue.totalRevenue) * 100;

  // Months to living wage
  const gap = sectionEAlt.targetMonthlyDraw - sustainableMonthlyDraw;
  const monthsToLivingWage = gap > 0 && profitability.netProfit > 0
    ? Math.ceil(safeDiv(gap, profitability.netProfit * 0.1)) // assumes 10% monthly improvement
    : 0;

  // Emergency runway
  const monthlyFixed = costs.totalOccupancyCost +
    sectionG.licensesPermits + sectionG.insurance + sectionG.technologyPosSoftware;
  const emergencyRunway = monthlyFixed > 0
    ? safeDiv(reinvestmentReserve * 3, monthlyFixed) // rough estimate
    : 0;

  return {
    ownerDrawBudget,
    reinvestmentReserve,
    sustainableMonthlyDraw,
    drawPercentOfRevenue,
    monthsToLivingWage,
    emergencyRunway,
  };
}

// ===== Master Calculation =====
export function calculateMetrics(data: FormData): AllMetrics {
  const revenue = calculateRevenue(data);
  const costs = calculateCosts(data, revenue);
  const profitability = calculateProfitability(revenue, costs);
  const breakEven = calculateBreakEven(data, costs, revenue);
  const growth = calculateGrowth(data, costs);
  const trends = calculateTrends(data, profitability, revenue);
  const ownerDraw = calculateOwnerDraw(data, profitability, costs, revenue);

  // Health score is computed separately
  return {
    revenue,
    costs,
    profitability,
    breakEven,
    growth,
    trends,
    ownerDraw,
    healthScore: 0,
    healthScoreBreakdown: {
      netMarginScore: 0,
      cogsScore: 0,
      laborScore: 0,
      rentScore: 0,
      capacityScore: 0,
      revenueTrendScore: 0,
      ownerDrawScore: 0,
    },
  };
}
