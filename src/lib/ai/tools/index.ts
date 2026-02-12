import { createUpdateBusinessPlan } from './update-business-plan';
import { createGetMetrics } from './get-metrics';
import { createRunScenario } from './run-scenario';
import { createSearchBenchmarks } from './search-benchmarks';
import { createGetAlerts } from './get-alerts';
import { createSuggestPricing } from './suggest-pricing';
import { createAnalyzeRecipes } from './analyze-recipes';

export {
  createUpdateBusinessPlan,
  createGetMetrics,
  createRunScenario,
  createSearchBenchmarks,
  createGetAlerts,
  createSuggestPricing,
  createAnalyzeRecipes,
};

export type AgentRole = 'ceo' | 'cfo' | 'chef' | 'manager';

export function createToolsForRole(planId: string, userId: string, role: AgentRole) {
  const updateBusinessPlan = createUpdateBusinessPlan(planId, userId);
  const getMetrics = createGetMetrics(planId, userId);
  const runScenario = createRunScenario(planId, userId);
  const searchBenchmarks = createSearchBenchmarks(planId, userId);
  const getAlerts = createGetAlerts(planId, userId);
  const suggestPricing = createSuggestPricing(planId, userId);
  const analyzeRecipes = createAnalyzeRecipes(planId, userId);

  const toolSets: Record<AgentRole, Record<string, unknown>> = {
    ceo: { updateBusinessPlan, getMetrics, runScenario, searchBenchmarks, getAlerts, suggestPricing },
    cfo: { updateBusinessPlan, getMetrics, runScenario, searchBenchmarks, getAlerts, suggestPricing },
    chef: { updateBusinessPlan, getMetrics, analyzeRecipes, suggestPricing },
    manager: { updateBusinessPlan, getMetrics, getAlerts, searchBenchmarks },
  };

  return toolSets[role] || toolSets.ceo;
}

export function createAllTools(planId: string, userId: string) {
  return {
    updateBusinessPlan: createUpdateBusinessPlan(planId, userId),
    getMetrics: createGetMetrics(planId, userId),
    runScenario: createRunScenario(planId, userId),
    searchBenchmarks: createSearchBenchmarks(planId, userId),
    getAlerts: createGetAlerts(planId, userId),
    suggestPricing: createSuggestPricing(planId, userId),
    analyzeRecipes: createAnalyzeRecipes(planId, userId),
  };
}
