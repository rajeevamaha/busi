import { AllMetrics, FormData, HealthScoreBreakdown, isSoloOrFamily } from './types';
import { clamp } from '../utils';

// Score a metric on 0-100 scale based on healthy range
function scoreMetric(value: number, healthyMin: number, healthyMax: number, lowerIsWorse: boolean): number {
  if (lowerIsWorse) {
    // Higher is better (net margin, capacity, margin of safety)
    if (value >= healthyMax) return 100;
    if (value >= healthyMin) {
      return 70 + 30 * ((value - healthyMin) / (healthyMax - healthyMin));
    }
    if (value > 0) return Math.max(0, 70 * (value / healthyMin));
    return 0;
  } else {
    // Lower is better (rent%, cogs%, labor%)
    if (value <= healthyMin) return 100;
    if (value <= healthyMax) {
      return 70 + 30 * ((healthyMax - value) / (healthyMax - healthyMin));
    }
    // Past healthy max: degrade to 0
    const overshoot = value - healthyMax;
    const degradeRange = healthyMax * 0.5; // degrades over 50% of healthy max
    return Math.max(0, 70 * (1 - overshoot / degradeRange));
  }
}

export function calculateHealthScore(data: FormData, metrics: AllMetrics): { score: number; breakdown: HealthScoreBreakdown } {
  const solo = isSoloOrFamily(data.sectionA.teamSize);

  // Individual scores
  const netMarginScore = scoreMetric(metrics.profitability.netMarginPercent, 10, 20, true);
  const cogsScore = scoreMetric(metrics.costs.cogsPercent, 25, 35, false);
  const laborScore = solo ? 0 : scoreMetric(metrics.costs.laborPercent, 20, 30, false);
  const rentScore = scoreMetric(metrics.costs.rentPercent, 5, 15, false);
  const capacityScore = scoreMetric(metrics.costs.capacityUtilization, 70, 90, true);
  const revenueTrendScore = metrics.trends.threeMonthRevenueTrend >= 0 ? 80 : Math.max(0, 80 + metrics.trends.threeMonthRevenueTrend);

  // Owner draw sustainability (solo only)
  let ownerDrawScore = 0;
  if (solo && data.sectionEAlt.targetMonthlyDraw > 0) {
    const drawRatio = metrics.ownerDraw.sustainableMonthlyDraw / data.sectionEAlt.targetMonthlyDraw;
    ownerDrawScore = clamp(drawRatio * 100, 0, 100);
  } else if (solo) {
    ownerDrawScore = metrics.profitability.netProfit > 0 ? 70 : 20;
  }

  const breakdown: HealthScoreBreakdown = {
    netMarginScore,
    cogsScore,
    laborScore,
    rentScore,
    capacityScore,
    revenueTrendScore,
    ownerDrawScore,
  };

  let score: number;
  if (solo) {
    // Solo/Family weights (no labor)
    score =
      netMarginScore * 0.25 +
      cogsScore * 0.20 +
      rentScore * 0.15 +
      ownerDrawScore * 0.15 +
      capacityScore * 0.15 +
      revenueTrendScore * 0.10;
  } else {
    // Team weights
    score =
      netMarginScore * 0.25 +
      cogsScore * 0.20 +
      laborScore * 0.15 +
      rentScore * 0.15 +
      capacityScore * 0.15 +
      revenueTrendScore * 0.10;
  }

  return { score: Math.round(clamp(score, 0, 100)), breakdown };
}
