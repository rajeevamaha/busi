import { Alert, AlertSeverity, AllMetrics, FormData, isSoloOrFamily } from './types';
import { getBenchmark, lowerIsWorseCategories } from './benchmarks';
import { formatCurrency, formatPercent } from '../utils';

function checkSeverity(
  value: number,
  warningThreshold: number,
  criticalThreshold: number,
  lowerIsWorse: boolean
): AlertSeverity {
  if (lowerIsWorse) {
    if (value < criticalThreshold) return 'critical';
    if (value < warningThreshold) return 'warning';
    return 'healthy';
  } else {
    if (value > criticalThreshold) return 'critical';
    if (value > warningThreshold) return 'warning';
    return 'healthy';
  }
}

export function runRules(data: FormData, metrics: AllMetrics): Alert[] {
  const alerts: Alert[] = [];
  const businessType = data.sectionA.businessType;
  const solo = isSoloOrFamily(data.sectionA.teamSize);
  const revenue = metrics.revenue.totalRevenue;

  if (revenue <= 0) return alerts; // No revenue, no meaningful alerts

  // Rent %
  const rentBenchmark = getBenchmark('rent_percent', businessType);
  if (rentBenchmark && metrics.costs.rentPercent > 0) {
    const severity = checkSeverity(metrics.costs.rentPercent, rentBenchmark.warningThreshold, rentBenchmark.criticalThreshold, false);
    if (severity !== 'healthy') {
      const excess = revenue * ((metrics.costs.rentPercent - rentBenchmark.healthyMax) / 100);
      alerts.push({
        id: 'rent_high',
        category: 'rent_percent',
        severity,
        value: metrics.costs.rentPercent,
        benchmark: rentBenchmark.warningThreshold,
        message: `Your rent is consuming ${formatPercent(metrics.costs.rentPercent)} of revenue. Healthy range is ${rentBenchmark.healthyMin}-${rentBenchmark.healthyMax}%. This squeezes profit by ~${formatCurrency(excess)}/month.`,
        recommendations: [
          'Negotiate rent down or lock in a longer-term lease',
          'Increase revenue per sq ft via higher AOV',
          'Evaluate if this location\'s traffic justifies the premium',
        ],
      });
    }
  }

  // COGS %
  const cogsBenchmark = getBenchmark('cogs_percent', businessType);
  if (cogsBenchmark && metrics.costs.cogsPercent > 0) {
    const severity = checkSeverity(metrics.costs.cogsPercent, cogsBenchmark.warningThreshold, cogsBenchmark.criticalThreshold, false);
    if (severity !== 'healthy') {
      const targetPct = cogsBenchmark.healthyMax;
      const suggestedPrice = metrics.costs.cogsPerUnit / (targetPct / 100);
      alerts.push({
        id: 'cogs_high',
        category: 'cogs_percent',
        severity,
        value: metrics.costs.cogsPercent,
        benchmark: cogsBenchmark.warningThreshold,
        message: `Ingredient cost is ${formatPercent(metrics.costs.cogsPercent)} of revenue — healthy range is ${cogsBenchmark.healthyMin}-${cogsBenchmark.healthyMax}%.`,
        recommendations: [
          'Renegotiate supplier rates or buy in bulk',
          'Reduce menu complexity to lower waste',
          `Consider raising selling price to ~${formatCurrency(suggestedPrice)} to bring COGS to ${targetPct}%`,
        ],
      });
    }
  }

  // Labor % (only for team businesses)
  if (!solo) {
    const laborBenchmark = getBenchmark('labor_percent', businessType);
    if (laborBenchmark && metrics.costs.laborPercent > 0) {
      const severity = checkSeverity(metrics.costs.laborPercent, laborBenchmark.warningThreshold, laborBenchmark.criticalThreshold, false);
      if (severity !== 'healthy') {
        alerts.push({
          id: 'labor_high',
          category: 'labor_percent',
          severity,
          value: metrics.costs.laborPercent,
          benchmark: laborBenchmark.warningThreshold,
          message: `Employee costs at ${formatPercent(metrics.costs.laborPercent)} are above the ${laborBenchmark.healthyMin}-${laborBenchmark.healthyMax}% range.`,
          recommendations: [
            'Cross-train staff to improve flexibility',
            'Use part-time staff during off-peak hours',
            'Consider automation (self-ordering kiosks, prep equipment)',
          ],
        });
      }
    }
  }

  // Marketing %
  const mktBenchmark = getBenchmark('marketing_percent', businessType);
  if (mktBenchmark && metrics.costs.marketingPercent > 0) {
    const severity = checkSeverity(metrics.costs.marketingPercent, mktBenchmark.warningThreshold, mktBenchmark.criticalThreshold, false);
    if (severity !== 'healthy') {
      alerts.push({
        id: 'marketing_high',
        category: 'marketing_percent',
        severity,
        value: metrics.costs.marketingPercent,
        benchmark: mktBenchmark.warningThreshold,
        message: `Marketing spend at ${formatPercent(metrics.costs.marketingPercent)} is above the ${mktBenchmark.healthyMin}-${mktBenchmark.healthyMax}% healthy range.`,
        recommendations: [
          'Measure ROI per channel and cut underperformers',
          'Focus on organic/referral channels',
          'Negotiate lower platform commission rates',
        ],
      });
    }
  }

  // Net Margin
  const netBenchmark = getBenchmark('net_margin_percent', businessType);
  if (netBenchmark) {
    const severity = checkSeverity(metrics.profitability.netMarginPercent, netBenchmark.warningThreshold, netBenchmark.criticalThreshold, true);
    if (severity !== 'healthy') {
      alerts.push({
        id: 'net_margin_low',
        category: 'net_margin_percent',
        severity,
        value: metrics.profitability.netMarginPercent,
        benchmark: netBenchmark.warningThreshold,
        message: `Net profit margin is ${formatPercent(metrics.profitability.netMarginPercent)} — healthy range is ${netBenchmark.healthyMin}-${netBenchmark.healthyMax}%.`,
        recommendations: [
          'Review your largest cost categories for savings',
          'Consider raising prices if demand supports it',
          'Reduce waste and optimize operations',
        ],
      });
    }
  }

  // Wastage
  const wastageBenchmark = getBenchmark('wastage_percent', businessType);
  if (wastageBenchmark && data.sectionD.wastagePercent > 0) {
    const severity = checkSeverity(data.sectionD.wastagePercent, wastageBenchmark.warningThreshold, wastageBenchmark.criticalThreshold, false);
    if (severity !== 'healthy') {
      alerts.push({
        id: 'wastage_high',
        category: 'wastage_percent',
        severity,
        value: data.sectionD.wastagePercent,
        benchmark: wastageBenchmark.warningThreshold,
        message: `Wastage at ${formatPercent(data.sectionD.wastagePercent)} = ${formatCurrency(metrics.costs.wastageCost)}/month in lost ingredients.`,
        recommendations: [
          'Implement demand forecasting for production planning',
          'Make smaller batches more frequently',
          'Repurpose day-old items (discounted bundles, etc.)',
        ],
      });
    }
  }

  // Capacity Utilization
  const capBenchmark = getBenchmark('capacity_utilization', businessType);
  if (capBenchmark && metrics.costs.capacityUtilization > 0) {
    const severity = checkSeverity(metrics.costs.capacityUtilization, capBenchmark.warningThreshold, capBenchmark.criticalThreshold, true);
    if (severity !== 'healthy') {
      alerts.push({
        id: 'capacity_low',
        category: 'capacity_utilization',
        severity,
        value: metrics.costs.capacityUtilization,
        benchmark: capBenchmark.warningThreshold,
        message: `Capacity utilization is only ${formatPercent(metrics.costs.capacityUtilization)}. You have unused capacity.`,
        recommendations: [
          'Increase marketing to drive more orders',
          'Add delivery/catering channels',
          'Optimize shift scheduling to match demand',
        ],
      });
    }
  }

  // Margin of Safety
  const mosBenchmark = getBenchmark('margin_of_safety', businessType);
  if (mosBenchmark) {
    const severity = checkSeverity(metrics.breakEven.marginOfSafety, mosBenchmark.warningThreshold, mosBenchmark.criticalThreshold, true);
    if (severity !== 'healthy') {
      alerts.push({
        id: 'margin_of_safety_low',
        category: 'margin_of_safety',
        severity,
        value: metrics.breakEven.marginOfSafety,
        benchmark: mosBenchmark.warningThreshold,
        message: `You're only ${formatPercent(metrics.breakEven.marginOfSafety)} above break-even. One bad month could mean a loss.`,
        recommendations: [
          'Build a larger revenue cushion above break-even',
          'Reduce fixed costs to lower the break-even point',
          'Diversify revenue streams',
        ],
      });
    }
  }

  // Sell-out rate high (positive signal)
  if (metrics.revenue.sellOutRate > 80 && metrics.revenue.demandFulfillmentRate > 90) {
    alerts.push({
      id: 'demand_exceeds_supply',
      category: 'demand',
      severity: 'warning',
      value: metrics.revenue.sellOutRate,
      benchmark: 80,
      message: `You're selling out regularly (${formatPercent(metrics.revenue.sellOutRate)} sell-out rate) — demand exceeds supply. This is a growth signal.`,
      recommendations: [
        'Raise prices — customers are already buying everything you make',
        'Increase production capacity',
        'Test premium product tiers',
      ],
    });
  }

  // Burn rate
  if (metrics.trends.burnRate > 0) {
    const runway = metrics.breakEven.marginOfSafety < 0 ? Math.abs(safeDiv(revenue * 3, metrics.trends.burnRate)) : 0;
    alerts.push({
      id: 'burning_cash',
      category: 'burn_rate',
      severity: 'critical',
      value: metrics.trends.burnRate,
      benchmark: 0,
      message: `At current losses of ${formatCurrency(metrics.trends.burnRate)}/month, you need immediate cost reduction.`,
      recommendations: [
        'Identify and cut your largest unnecessary expense',
        'Focus on reaching break-even before growth',
        'Consider pivoting to a lower-cost model',
      ],
    });
  }

  return alerts;
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}
