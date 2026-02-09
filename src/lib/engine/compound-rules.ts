import { AllMetrics, CompoundInsight, FormData, isSoloOrFamily } from './types';
import { formatCurrency, formatPercent } from '../utils';

export function runCompoundRules(data: FormData, metrics: AllMetrics): CompoundInsight[] {
  const insights: CompoundInsight[] = [];
  const solo = isSoloOrFamily(data.sectionA.teamSize);
  const revenue = metrics.revenue.totalRevenue;

  if (revenue <= 0) return insights;

  // High labor + low capacity = scheduling problem
  if (!solo && metrics.costs.laborPercent > 30 && metrics.costs.capacityUtilization < 60) {
    insights.push({
      id: 'scheduling_problem',
      triggers: ['labor_percent', 'capacity_utilization'],
      message: 'This looks like a scheduling problem, not a hiring problem. Your labor costs are high but capacity utilization is low. Restructure shifts to match demand patterns before cutting staff.',
      priority: 1,
    });
  }

  // High COGS + high sell-out = raise prices
  if (metrics.costs.cogsPercent > 35 && metrics.revenue.sellOutRate > 80) {
    insights.push({
      id: 'raise_prices',
      triggers: ['cogs_percent', 'sell_out_rate'],
      message: 'Ingredients cost too much but demand is strong — you\'re selling out at current prices. Raise prices. Customers are already buying everything you make.',
      priority: 1,
    });
  }

  // Low margin of safety + declining revenue = runway warning
  if (metrics.breakEven.marginOfSafety < 10 && metrics.trends.threeMonthRevenueTrend < 0) {
    insights.push({
      id: 'runway_warning',
      triggers: ['margin_of_safety', 'revenue_trend'],
      message: `Your cushion above break-even is thin (${formatPercent(metrics.breakEven.marginOfSafety)}) and revenue is declining. This is a 2-3 month runway warning. Take immediate action.`,
      priority: 1,
    });
  }

  // High rent but good revenue per sqft = negotiate lease
  if (metrics.costs.rentPercent > 15 && metrics.costs.revenuePerSqFt > 50) {
    insights.push({
      id: 'negotiate_lease',
      triggers: ['rent_percent', 'revenue_per_sqft'],
      message: 'Rent is high but you\'re maximizing the space well. Consider negotiating a longer lease at a locked rate rather than moving — moving costs can be 3-6 months of rent.',
      priority: 2,
    });
  }

  // Low AOV + high traffic = upsell opportunity
  if (metrics.revenue.avgOrderValue > 0 && metrics.revenue.avgOrderValue < 15 && data.sectionB.ordersPerDay > 50) {
    insights.push({
      id: 'upsell_opportunity',
      triggers: ['aov', 'order_volume'],
      message: `You have good traffic (${data.sectionB.ordersPerDay} orders/day) but low ticket size (${formatCurrency(metrics.revenue.avgOrderValue)}). Add combos, upsells, or premium menu options to increase AOV.`,
      priority: 2,
    });
  }

  // High total operating cost + decent gross margin = overhead problem
  if (metrics.costs.totalOperatingCostPercent > 85 && metrics.profitability.grossMarginPercent > 55) {
    insights.push({
      id: 'overhead_problem',
      triggers: ['total_operating_cost', 'gross_margin'],
      message: 'Your gross margin is healthy but operating overhead is eating into profits. Focus on reducing fixed costs (rent, insurance, loan payments) rather than ingredient costs.',
      priority: 2,
    });
  }

  // ===== Owner's Draw Insights (Solo/Family Only) =====
  if (solo) {
    const netProfit = metrics.profitability.netProfit;
    const targetDraw = data.sectionEAlt.targetMonthlyDraw;

    if (netProfit < 0) {
      insights.push({
        id: 'no_draw_possible',
        triggers: ['net_profit_negative'],
        message: 'You can\'t take a draw right now — the business isn\'t covering its costs yet. Focus on reaching break-even first before paying yourself.',
        priority: 1,
      });
    } else if (netProfit > 0 && metrics.ownerDraw.sustainableMonthlyDraw < targetDraw && targetDraw > 0) {
      insights.push({
        id: 'draw_below_target',
        triggers: ['owner_draw', 'target_draw'],
        message: `You can safely take ${formatCurrency(metrics.ownerDraw.sustainableMonthlyDraw)}/month without hurting the business, but it's below your target of ${formatCurrency(targetDraw)}. Increase revenue or reduce costs to close the gap.`,
        priority: 1,
      });
    } else if (netProfit > 0 && metrics.ownerDraw.sustainableMonthlyDraw >= targetDraw && targetDraw > 0) {
      insights.push({
        id: 'draw_sustainable',
        triggers: ['owner_draw', 'reinvestment'],
        message: `You can pay yourself ${formatCurrency(metrics.ownerDraw.sustainableMonthlyDraw)}/month and still reinvest ${formatCurrency(metrics.ownerDraw.reinvestmentReserve)} for growth. This is sustainable.`,
        priority: 3,
      });
    }

    if (metrics.ownerDraw.drawPercentOfRevenue > 15 && netProfit > 0) {
      insights.push({
        id: 'draw_too_high',
        triggers: ['draw_percent'],
        message: `You're taking ${formatPercent(metrics.ownerDraw.drawPercentOfRevenue)} of revenue as a draw. The business needs cash to grow. Consider capping your draw at ${formatCurrency(metrics.ownerDraw.ownerDrawBudget * 0.8)}.`,
        priority: 2,
      });
    }
  }

  // Sort by priority (1 = highest)
  return insights.sort((a, b) => a.priority - b.priority);
}
