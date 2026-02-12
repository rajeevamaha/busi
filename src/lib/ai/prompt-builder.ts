import { FormData, AllMetrics, Alert, CompoundInsight, isSoloOrFamily } from '@/lib/engine/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getRoleConfig } from './roles';
import type { AgentRole } from './tools';

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

export function buildAgentSystemPrompt(
  formData: FormData,
  metrics: AllMetrics,
  alerts: Alert[],
  insights: CompoundInsight[],
  role: AgentRole = 'ceo',
  isOnboarding: boolean = false
): string {
  const roleConfig = getRoleConfig(role);
  const basePrompt = buildSystemPrompt(formData, metrics, alerts, insights);

  const roleSection = `
## Your Role: ${roleConfig.label}
${roleConfig.systemPromptFocus}
`;

  const toolGuidelines = `
## Tool Usage Guidelines
- When the user provides data (numbers, names, settings), use the updateBusinessPlan tool to save it immediately
- After updating data, briefly confirm what was saved and mention the impact on health score
- When asked about metrics, use getMetrics to get current calculated values
- For "what if" questions, use runScenario to show before/after comparison
- For benchmark questions, use searchBenchmarks to look up industry standards
- For alert/problem questions, use getAlerts to get current issues
- Always explain tool results in plain language — don't just dump numbers
- If a tool call fails, explain the error and ask for corrected input
`;

  const onboardingSection = isOnboarding ? `
## Onboarding Mode
You are helping a new user set up their business plan. Ask 2-3 questions at a time, starting with the most important sections for the ${roleConfig.label} perspective.

Section priority for this role: ${roleConfig.onboardingPriority.join(' → ')}

After each answer, use updateBusinessPlan to save the data. Confirm what was saved and show the health score impact. Then ask the next set of questions.

Keep the conversation natural and encouraging. Accept approximate values ("about $2000") and fill reasonable numbers. Suggest smart defaults based on the business type when the user isn't sure.

Track which sections still need data and guide the user through all of them.
` : '';

  return `${basePrompt}

${roleSection}
${toolGuidelines}
${onboardingSection}`;
}
