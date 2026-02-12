'use client';

import { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HealthScoreGauge } from './health-score-gauge';
import { InsightsCarousel } from './insights-carousel';
import { CostDonutChart } from './cost-donut-chart';
import { PnlTable } from './pnl-table';
import { BenchmarkGrid } from './benchmark-grid';
import { BreakEvenBar } from './break-even-bar';
import { OwnersDrawCard } from './owners-draw-card';
import { ScenarioSliders } from './scenario-sliders';
import { ExportPdfButton } from './export-pdf-button';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { formatCurrency } from '@/lib/utils';

type CardId = 'healthScore' | 'costs' | 'pnl' | 'benchmarks' | 'breakEven' | 'ownerDraw' | 'scenario';

const cardComponents: Record<CardId, () => ReactNode> = {
  healthScore: () => (
    <div className="flex gap-3 items-stretch">
      <HealthScoreGauge />
      <InsightsCarousel />
    </div>
  ),
  costs: () => (
    <Card className="py-3 gap-2">
      <CardHeader className="pb-0 px-4">
        <CardTitle className="text-xs">Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <CostDonutChart />
      </CardContent>
    </Card>
  ),
  pnl: () => (
    <Card className="py-3 gap-2">
      <CardContent className="px-4">
        <PnlTable />
      </CardContent>
    </Card>
  ),
  benchmarks: () => (
    <Card className="py-3 gap-2">
      <CardHeader className="pb-0 px-4">
        <CardTitle className="text-xs">Benchmarks</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <BenchmarkGrid />
      </CardContent>
    </Card>
  ),
  breakEven: () => (
    <Card className="py-3 gap-2">
      <CardContent className="px-4">
        <BreakEvenBar />
      </CardContent>
    </Card>
  ),
  ownerDraw: () => <OwnersDrawCard />,
  scenario: () => (
    <Card className="py-3 gap-2">
      <CardContent className="px-4">
        <ScenarioSliders />
      </CardContent>
    </Card>
  ),
};

// Default card order
const defaultOrder: CardId[] = ['healthScore', 'costs', 'pnl', 'benchmarks', 'breakEven', 'ownerDraw', 'scenario'];

// Role-based order: highlighted cards first
const roleCardOrder: Record<string, CardId[]> = {
  ceo: ['healthScore', 'pnl', 'breakEven', 'costs', 'benchmarks', 'ownerDraw', 'scenario'],
  cfo: ['benchmarks', 'breakEven', 'costs', 'pnl', 'healthScore', 'ownerDraw', 'scenario'],
  chef: ['costs', 'pnl', 'healthScore', 'breakEven', 'benchmarks', 'ownerDraw', 'scenario'],
  manager: ['costs', 'benchmarks', 'healthScore', 'pnl', 'breakEven', 'ownerDraw', 'scenario'],
};

export function DashboardPanel() {
  const scenarioMetrics = useBusinessPlanStore((s) => s.scenarioMetrics);
  const role = useBusinessPlanStore((s) => s.role);

  const cardOrder = roleCardOrder[role] || defaultOrder;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-8 space-y-3">
        <div className="flex items-center justify-between border-b pb-3 -mx-4 px-4 mb-1">
          <h2 className="text-sm font-semibold">Dashboard</h2>
          <ExportPdfButton />
        </div>

        {scenarioMetrics && (
          <Card className="border-blue-200 bg-blue-50 py-2 gap-0">
            <CardContent className="px-3">
              <p className="text-[10px] font-medium text-blue-600">
                Showing scenario results. Adjust sliders below or reset.
              </p>
              <div className="flex gap-3 mt-1 text-xs">
                <span>Net Profit: <strong>{formatCurrency(scenarioMetrics.profitability.netProfit)}</strong></span>
                <span>Score: <strong>{scenarioMetrics.healthScore}</strong></span>
              </div>
            </CardContent>
          </Card>
        )}

        {cardOrder.map((cardId, index) => (
          <div key={cardId}>
            {index === 1 && <Separator />}
            {cardComponents[cardId]()}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
