import { FormData, ScenarioOverrides, AllMetrics } from './types';
import { calculateMetrics } from './calculations';
import { calculateHealthScore } from './health-score';
import { runRules } from './rules';
import { runCompoundRules } from './compound-rules';

export function applyScenario(data: FormData, overrides: ScenarioOverrides): FormData {
  const modified = JSON.parse(JSON.stringify(data)) as FormData;

  if (overrides.priceChange !== undefined && overrides.priceChange !== 0) {
    const multiplier = 1 + overrides.priceChange / 100;
    modified.sectionB.avgSellingPrice = data.sectionB.avgSellingPrice * multiplier;
    modified.sectionB.avgOrderValue = data.sectionB.avgOrderValue * multiplier;
  }

  if (overrides.volumeChange !== undefined && overrides.volumeChange !== 0) {
    const multiplier = 1 + overrides.volumeChange / 100;
    modified.sectionB.unitsSoldPerDay = Math.round(data.sectionB.unitsSoldPerDay * multiplier);
    modified.sectionB.ordersPerDay = Math.round(data.sectionB.ordersPerDay * multiplier);
  }

  if (overrides.cogsChange !== undefined && overrides.cogsChange !== 0) {
    const multiplier = 1 + overrides.cogsChange / 100;
    modified.sectionD.ingredientCostPerUnit = data.sectionD.ingredientCostPerUnit * multiplier;
    modified.sectionD.monthlyRawMaterialCost = data.sectionD.monthlyRawMaterialCost * multiplier;
  }

  if (overrides.laborChange !== undefined && overrides.laborChange !== 0) {
    const multiplier = 1 + overrides.laborChange / 100;
    modified.sectionE.totalMonthlySalaries = data.sectionE.totalMonthlySalaries * multiplier;
    modified.sectionE.avgHourlyRate = data.sectionE.avgHourlyRate * multiplier;
  }

  if (overrides.rentChange !== undefined && overrides.rentChange !== 0) {
    modified.sectionC.monthlyRent = Math.max(0, data.sectionC.monthlyRent + overrides.rentChange);
  }

  return modified;
}

export function calculateScenario(data: FormData, overrides: ScenarioOverrides) {
  const modifiedData = applyScenario(data, overrides);
  const metrics = calculateMetrics(modifiedData);
  const { score, breakdown } = calculateHealthScore(modifiedData, metrics);
  const alerts = runRules(modifiedData, metrics);
  const insights = runCompoundRules(modifiedData, metrics);

  return {
    metrics: { ...metrics, healthScore: score, healthScoreBreakdown: breakdown },
    alerts,
    insights,
    modifiedData,
  };
}
