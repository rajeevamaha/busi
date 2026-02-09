'use client';

import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { isSoloOrFamily } from '@/lib/engine/types';

function Row({ label, value, bold, indent, highlight }: {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
  highlight?: 'green' | 'red';
}) {
  return (
    <div className={`flex justify-between py-1.5 px-2 ${bold ? 'font-semibold' : ''} ${indent ? 'pl-6' : ''} ${highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-600' : ''}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function PnlTable() {
  const metrics = useMetrics();
  const formData = useFormData();
  const solo = isSoloOrFamily(formData.sectionA.teamSize);

  return (
    <div className="space-y-0.5">
      <h3 className="text-sm font-semibold mb-2">Profit & Loss Summary</h3>
      <Row label="Revenue" value={formatCurrency(metrics.revenue.totalRevenue)} bold />
      <div className="border-t my-1" />
      <Row label="COGS" value={`(${formatCurrency(metrics.costs.totalCogs)})`} indent />
      <Row label="Wastage" value={`(${formatCurrency(metrics.costs.wastageCost)})`} indent />
      <div className="border-t my-1" />
      <Row
        label="Gross Profit"
        value={formatCurrency(metrics.profitability.grossProfit)}
        bold
        highlight={metrics.profitability.grossProfit >= 0 ? 'green' : 'red'}
      />
      <Row label={`Gross Margin: ${formatPercent(metrics.profitability.grossMarginPercent)}`} value="" />
      <div className="border-t my-1" />
      {!solo && (
        <Row label="Labor" value={`(${formatCurrency(metrics.costs.totalLaborCost)})`} indent />
      )}
      <Row label="Rent & Occupancy" value={`(${formatCurrency(metrics.costs.totalOccupancyCost)})`} indent />
      <Row label="Marketing" value={`(${formatCurrency(metrics.revenue.totalRevenue * metrics.costs.marketingPercent / 100)})`} indent />
      <Row
        label="Other Operating"
        value={`(${formatCurrency(
          metrics.costs.totalOperatingCosts -
          metrics.costs.totalCogs - metrics.costs.wastageCost -
          metrics.costs.totalLaborCost - metrics.costs.totalOccupancyCost -
          (metrics.revenue.totalRevenue * metrics.costs.marketingPercent / 100)
        )})`}
        indent
      />
      <div className="border-t my-1" />
      <Row
        label="Net Profit"
        value={formatCurrency(metrics.profitability.netProfit)}
        bold
        highlight={metrics.profitability.netProfit >= 0 ? 'green' : 'red'}
      />
      <Row label={`Net Margin: ${formatPercent(metrics.profitability.netMarginPercent)}`} value="" />
    </div>
  );
}
