'use client';

import { Loader2 } from 'lucide-react';

const toolLabels: Record<string, string> = {
  updateBusinessPlan: 'Updating your business plan...',
  getMetrics: 'Fetching your metrics...',
  runScenario: 'Running scenario analysis...',
  searchBenchmarks: 'Looking up benchmarks...',
  getAlerts: 'Checking alerts...',
  suggestPricing: 'Analyzing pricing...',
  analyzeRecipes: 'Analyzing recipes...',
};

interface ToolActivityProps {
  toolName: string;
  state: 'partial-call' | 'call' | 'result';
}

export function ToolActivity({ toolName, state }: ToolActivityProps) {
  if (state === 'result') return null;

  const label = toolLabels[toolName] || `Running ${toolName}...`;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 bg-muted/50 rounded-md">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
