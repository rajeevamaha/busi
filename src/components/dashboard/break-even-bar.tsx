'use client';

import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function BreakEvenBar() {
  const metrics = useMetrics();
  const { breakEvenRevenue, marginOfSafety } = metrics.breakEven;
  const revenue = metrics.revenue.totalRevenue;

  if (revenue <= 0 && breakEvenRevenue <= 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Enter revenue and cost data to see break-even analysis
      </div>
    );
  }

  const maxVal = Math.max(revenue, breakEvenRevenue) * 1.2;
  const revenueWidth = Math.min((revenue / maxVal) * 100, 100);
  const breakEvenWidth = Math.min((breakEvenRevenue / maxVal) * 100, 100);
  const isProfitable = revenue >= breakEvenRevenue;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Break-Even Analysis</h3>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Revenue</span>
            <span className="font-medium">{formatCurrency(revenue)}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isProfitable ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${revenueWidth}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Break-Even</span>
            <span className="font-medium">{formatCurrency(breakEvenRevenue)}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all duration-500"
              style={{ width: `${breakEvenWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
        Margin of Safety: {formatPercent(marginOfSafety)}
        {isProfitable ? ' above break-even' : ' below break-even'}
      </div>

      <div className="text-xs text-muted-foreground">
        Break-even at {formatCurrency(metrics.breakEven.breakEvenRevenue)} ({Math.ceil(metrics.breakEven.breakEvenUnits)} units)
      </div>
    </div>
  );
}
