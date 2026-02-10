'use client';

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
import { useScenarioMetrics } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function DashboardPanel() {
  const scenarioMetrics = useBusinessPlanStore((s) => s.scenarioMetrics);
  const activeMetrics = useScenarioMetrics();

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

        <div className="flex gap-3 items-stretch">
          <HealthScoreGauge />
          <InsightsCarousel />
        </div>

        <Separator />

        <Card className="py-3 gap-2">
          <CardHeader className="pb-0 px-4">
            <CardTitle className="text-xs">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <CostDonutChart />
          </CardContent>
        </Card>

        <Card className="py-3 gap-2">
          <CardContent className="px-4">
            <PnlTable />
          </CardContent>
        </Card>

        <Card className="py-3 gap-2">
          <CardHeader className="pb-0 px-4">
            <CardTitle className="text-xs">Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <BenchmarkGrid />
          </CardContent>
        </Card>

        <Card className="py-3 gap-2">
          <CardContent className="px-4">
            <BreakEvenBar />
          </CardContent>
        </Card>

        <OwnersDrawCard />

        <Card className="py-3 gap-2">
          <CardContent className="px-4">
            <ScenarioSliders />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
