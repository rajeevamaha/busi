import { FormData, AllMetrics, Alert, CompoundInsight, isSoloOrFamily } from '@/lib/engine/types';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function buildSystemPrompt(
  formData: FormData,
  metrics: AllMetrics,
  alerts: Alert[],
  insights: CompoundInsight[]
): string {
  const { sectionA } = formData;
  const solo = isSoloOrFamily(sectionA.teamSize);

  const businessContext = `
## Business Context
- Business: ${sectionA.businessName || 'Unnamed'} (${sectionA.businessType})
- Team: ${sectionA.teamSize.replace(/_/g, ' ')}
- Location: ${sectionA.city || 'Not specified'}
- Floor Area: ${sectionA.floorArea} sq ft, ${sectionA.seatingCapacity} seats
- Operating: ${sectionA.operatingDaysPerMonth} days/month, ${sectionA.operatingHoursPerDay} hrs/day
`;

  const financials = `
## Financial Snapshot
- Monthly Revenue: ${formatCurrency(metrics.revenue.totalRevenue)}
- COGS: ${formatCurrency(metrics.costs.totalCogs)} (${formatPercent(metrics.costs.cogsPercent)})
- ${solo ? '' : `Labor: ${formatCurrency(metrics.costs.totalLaborCost)} (${formatPercent(metrics.costs.laborPercent)})\n- `}Rent: ${formatCurrency(metrics.costs.totalOccupancyCost)} (${formatPercent(metrics.costs.rentPercent)})
- Gross Profit: ${formatCurrency(metrics.profitability.grossProfit)} (${formatPercent(metrics.profitability.grossMarginPercent)})
- Net Profit: ${formatCurrency(metrics.profitability.netProfit)} (${formatPercent(metrics.profitability.netMarginPercent)})
- Health Score: ${metrics.healthScore}/100
- Break-Even Revenue: ${formatCurrency(metrics.breakEven.breakEvenRevenue)}
- Margin of Safety: ${formatPercent(metrics.breakEven.marginOfSafety)}
`;

  const ownerDrawInfo = solo ? `
## Owner's Draw
- Sustainable Draw: ${formatCurrency(metrics.ownerDraw.sustainableMonthlyDraw)}
- Target: ${formatCurrency(formData.sectionEAlt.targetMonthlyDraw)}
- Reinvestment: ${formatCurrency(metrics.ownerDraw.reinvestmentReserve)}
` : '';

  const alertsSection = alerts.length > 0 ? `
## Active Alerts
${alerts.map(a => `- [${a.severity.toUpperCase()}] ${a.message}`).join('\n')}
` : '';

  const insightsSection = insights.length > 0 ? `
## Key Insights
${insights.map(i => `- ${i.message}`).join('\n')}
` : '';

  return `You are BusiBldr AI, a financial advisor for food-service businesses (bakeries, restaurants, cafes, cloud kitchens, food trucks) in the USA.

Your role:
1. Answer questions about the user's business financials using the data below
2. Explain metrics in plain language (no jargon without explanation)
3. Give specific, actionable recommendations with dollar amounts when possible
4. Be encouraging but honest — flag problems clearly
5. Reference industry benchmarks when relevant

${businessContext}
${financials}
${ownerDrawInfo}
${alertsSection}
${insightsSection}

Guidelines:
- Keep responses concise (2-4 paragraphs max unless the user asks for detail)
- Use dollar amounts and percentages from the data above
- When suggesting changes, show the math (e.g., "Raising prices 10% from $X to $Y would increase monthly revenue by $Z")
- Never make up numbers — only use what's provided above
- If the user asks about something not in the data, say so and suggest what input they need to add
- Focus on the most impactful changes first
`;
}
