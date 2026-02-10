'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#6b7280', '#22c55e'];

export function CostDonutChart() {
  const metrics = useMetrics();

  const data = [
    { name: 'COGS', value: metrics.costs.totalCogs + metrics.costs.wastageCost },
    { name: 'Labor', value: metrics.costs.totalLaborCost },
    { name: 'Rent & Occupancy', value: metrics.costs.totalOccupancyCost },
    { name: 'Marketing', value: metrics.costs.marketingPercent > 0
      ? metrics.revenue.totalRevenue * metrics.costs.marketingPercent / 100
      : 0 },
    { name: 'Other', value: Math.max(0, metrics.costs.totalOperatingCosts - metrics.costs.totalCogs - metrics.costs.wastageCost - metrics.costs.totalLaborCost - metrics.costs.totalOccupancyCost - (metrics.revenue.totalRevenue * metrics.costs.marketingPercent / 100)) },
    { name: 'Profit', value: Math.max(0, metrics.profitability.netProfit) },
  ].filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || metrics.revenue.totalRevenue === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
        Enter revenue data to see cost breakdown
      </div>
    );
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={42}
            outerRadius={68}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry) => {
              const pct = total > 0 ? ((entry.payload?.value ?? 0) / total * 100).toFixed(1) : '0';
              return <span className="text-xs">{value} {pct}%</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
