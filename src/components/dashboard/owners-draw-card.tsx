'use client';

import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { isSoloOrFamily } from '@/lib/engine/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OwnersDrawCard() {
  const metrics = useMetrics();
  const formData = useFormData();

  if (!isSoloOrFamily(formData.sectionA.teamSize)) return null;

  const { ownerDraw } = metrics;
  const targetDraw = formData.sectionEAlt.targetMonthlyDraw;
  const canMeetTarget = ownerDraw.sustainableMonthlyDraw >= targetDraw && targetDraw > 0;

  return (
    <Card className={`py-3 gap-2 ${canMeetTarget ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardHeader className="pb-0 px-4">
        <CardTitle className="text-xs">Owner&apos;s Draw</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 px-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Sustainable Draw</span>
          <span className="font-bold text-sm">{formatCurrency(ownerDraw.sustainableMonthlyDraw)}</span>
        </div>
        {targetDraw > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Your Target</span>
            <span>{formatCurrency(targetDraw)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Reinvestment Reserve</span>
          <span>{formatCurrency(ownerDraw.reinvestmentReserve)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Draw % of Revenue</span>
          <span>{formatPercent(ownerDraw.drawPercentOfRevenue)}</span>
        </div>
        {ownerDraw.monthsToLivingWage > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            ~{ownerDraw.monthsToLivingWage} months to reach your target draw
          </p>
        )}
      </CardContent>
    </Card>
  );
}
