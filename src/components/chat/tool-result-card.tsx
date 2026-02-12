'use client';

import { CheckCircle2, AlertTriangle, TrendingUp, BarChart3, Target, BookOpen } from 'lucide-react';

const toolIcons: Record<string, typeof CheckCircle2> = {
  updateBusinessPlan: CheckCircle2,
  getMetrics: BarChart3,
  runScenario: TrendingUp,
  searchBenchmarks: Target,
  getAlerts: AlertTriangle,
  suggestPricing: TrendingUp,
  analyzeRecipes: BookOpen,
};

const toolTitles: Record<string, string> = {
  updateBusinessPlan: 'Plan Updated',
  getMetrics: 'Metrics',
  runScenario: 'Scenario Analysis',
  searchBenchmarks: 'Benchmarks',
  getAlerts: 'Alerts',
  suggestPricing: 'Pricing Analysis',
  analyzeRecipes: 'Recipe Analysis',
};

interface ToolResultCardProps {
  toolName: string;
  result: Record<string, unknown>;
}

export function ToolResultCard({ toolName, result }: ToolResultCardProps) {
  const Icon = toolIcons[toolName] || CheckCircle2;
  const title = toolTitles[toolName] || toolName;

  // For updateBusinessPlan, show a compact summary
  if (toolName === 'updateBusinessPlan' && result.success) {
    return (
      <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>
          Updated {String(result.updatedSection)} &middot; Health: {String(result.healthScore)}/100 &middot; Net: {String(result.netProfitFormatted)}
        </span>
      </div>
    );
  }

  // For scenario, show compact comparison
  if (toolName === 'runScenario' && result.impact) {
    const impact = result.impact as Record<string, string>;
    return (
      <div className="text-xs py-1.5 px-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 font-medium mb-1">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span>{title}</span>
        </div>
        <div className="flex gap-3">
          <span>Revenue: {impact.revenueChange}</span>
          <span>Profit: {impact.profitChange}</span>
          <span>Score: {Number(impact.healthScoreChange) > 0 ? '+' : ''}{impact.healthScoreChange}</span>
        </div>
      </div>
    );
  }

  // For alerts, show count
  if (toolName === 'getAlerts') {
    return (
      <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-800">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>Found {String(result.alertCount)} alert(s) &middot; Health: {String(result.healthScore)}/100</span>
      </div>
    );
  }

  // Generic: show title only (AI will explain the results in text)
  return (
    <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 bg-muted/50 rounded-md border">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{title} complete</span>
    </div>
  );
}
