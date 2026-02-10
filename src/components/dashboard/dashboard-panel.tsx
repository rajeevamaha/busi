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
      <div className="p-4 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <ExportPdfButton />
        </div>

        {scenarioMetrics && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-blue-600">
                Showing scenario results. Adjust sliders below or reset.
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>Net Profit: <strong>{formatCurrency(scenarioMetrics.profitability.netProfit)}</strong></span>
                <span>Score: <strong>{scenarioMetrics.healthScore}</strong></span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 items-stretch">
          <HealthScoreGauge />
          <InsightsCarousel />
        </div>

        <Separator />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CostDonutChart />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <PnlTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <BenchmarkGrid />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <BreakEvenBar />
          </CardContent>
        </Card>

        <OwnersDrawCard />

        <Card>
          <CardContent className="pt-4">
            <ScenarioSliders />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
