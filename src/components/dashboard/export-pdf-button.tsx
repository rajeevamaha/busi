'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useMetrics, useFormData } from '@/hooks/use-calculations';
import { isSoloOrFamily } from '@/lib/engine/types';

export function ExportPdfButton() {
  const planName = useBusinessPlanStore((s) => s.planName);
  const metrics = useMetrics();
  const formData = useFormData();
  const alerts = useBusinessPlanStore((s) => s.alerts);
  const insights = useBusinessPlanStore((s) => s.insights);
  const solo = isSoloOrFamily(formData.sectionA.teamSize);

  async function handleExport() {
    // Dynamic imports to keep bundle size small
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    function fmt(n: number) {
      return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    function pct(n: number) {
      return n.toFixed(1) + '%';
    }

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Plan Report', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(planName || 'Untitled Plan', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0);
    y += 12;

    // Business Overview
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Overview', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Business Name', formData.sectionA.businessName || 'N/A'],
        ['Business Type', formData.sectionA.businessType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())],
        ['Team Size', formData.sectionA.teamSize.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())],
        ['Location', formData.sectionA.city || 'N/A'],
        ['Floor Area', `${formData.sectionA.floorArea} sq ft`],
        ['Operating Days/Month', `${formData.sectionA.operatingDaysPerMonth}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12;

    // Health Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Health Score', 14, y);
    y += 8;

    const score = metrics.healthScore ?? 0;
    const scoreLabel = score >= 75 ? 'Healthy' : score >= 50 ? 'Needs Attention' : 'Critical';
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(score >= 75 ? 34 : score >= 50 ? 180 : 220, score >= 75 ? 139 : score >= 50 ? 140 : 38, score >= 75 ? 34 : score >= 50 ? 0 : 38);
    doc.text(`${score}`, 14, y);
    doc.setFontSize(12);
    doc.text(`/ 100 — ${scoreLabel}`, 38, y);
    doc.setTextColor(0);
    y += 14;

    // P&L Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Profit & Loss Summary', 14, y);
    y += 8;

    const marketingCost = metrics.revenue.totalRevenue * metrics.costs.marketingPercent / 100;
    const otherOpex = metrics.costs.totalOperatingCosts - metrics.costs.totalCogs - metrics.costs.wastageCost - metrics.costs.totalLaborCost - metrics.costs.totalOccupancyCost - marketingCost;

    const pnlBody: string[][] = [
      ['Revenue', fmt(metrics.revenue.totalRevenue), '100%'],
      ['(-) COGS', fmt(metrics.costs.totalCogs), pct(metrics.costs.cogsPercent)],
      ['(-) Wastage', fmt(metrics.costs.wastageCost), pct(formData.sectionD.wastagePercent)],
      ['Gross Profit', fmt(metrics.profitability.grossProfit), pct(metrics.profitability.grossMarginPercent)],
    ];
    if (!solo) {
      pnlBody.push(['(-) Labor', fmt(metrics.costs.totalLaborCost), pct(metrics.costs.laborPercent)]);
    }
    pnlBody.push(
      ['(-) Rent & Occupancy', fmt(metrics.costs.totalOccupancyCost), pct(metrics.costs.rentPercent)],
      ['(-) Marketing', fmt(marketingCost), pct(metrics.costs.marketingPercent)],
      ['(-) Other Operating', fmt(otherOpex), ''],
      ['Net Profit', fmt(metrics.profitability.netProfit), pct(metrics.profitability.netMarginPercent)],
    );

    autoTable(doc, {
      startY: y,
      head: [['Line Item', 'Amount', '% of Revenue']],
      body: pnlBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      didParseCell(data) {
        if (data.row.index === 3 || data.row.index === pnlBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12;

    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Benchmarks
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Benchmark Comparison', 14, y);
    y += 8;

    const benchmarkRows: string[][] = [
      ['Rent %', pct(metrics.costs.rentPercent), '5-15%'],
      ['COGS %', pct(metrics.costs.cogsPercent), '25-35%'],
    ];
    if (!solo) {
      benchmarkRows.push(['Labor %', pct(metrics.costs.laborPercent), '20-30%']);
    }
    benchmarkRows.push(
      ['Marketing %', pct(metrics.costs.marketingPercent), '3-8%'],
      ['Net Margin', pct(metrics.profitability.netMarginPercent), '10-20%'],
      ['Wastage %', pct(formData.sectionD.wastagePercent), '2-5%'],
      ['Capacity Utilization', pct(metrics.costs.capacityUtilization), '70-90%'],
      ['Margin of Safety', pct(metrics.breakEven.marginOfSafety), '> 25%'],
    );

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Your Value', 'Healthy Range']],
      body: benchmarkRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Break-Even
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Break-Even Analysis', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Break-Even Units/Month', `${metrics.breakEven.breakEvenUnits.toLocaleString()}`],
        ['Break-Even Revenue', fmt(metrics.breakEven.breakEvenRevenue)],
        ['Contribution Margin', fmt(metrics.breakEven.contributionMargin)],
        ['Margin of Safety', pct(metrics.breakEven.marginOfSafety)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 12;

    // Key Insights
    if (alerts.length > 0 || insights.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Insights & Alerts', 14, y);
      y += 8;

      const insightRows: string[][] = [];
      alerts.forEach((a) => {
        insightRows.push([a.severity.toUpperCase(), a.message]);
      });
      insights.forEach((i) => {
        insightRows.push([String(i.priority || 'INFO'), i.message]);
      });

      autoTable(doc, {
        startY: y,
        head: [['Severity', 'Insight']],
        body: insightRows.slice(0, 10),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellWidth: 'wrap' },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 'auto' } },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated by BusiBldr | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${(planName || 'business-plan').replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="text-xs h-7">
      <Download className="size-3.5 mr-1" />
      Export PDF
    </Button>
  );
}
