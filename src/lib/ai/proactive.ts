import { FormData, AllMetrics, Alert, CompoundInsight, isSoloOrFamily } from '@/lib/engine/types';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function generateLoginSummary(
  formData: FormData,
  metrics: AllMetrics,
  alerts: Alert[],
  insights: CompoundInsight[]
): string {
  const { sectionA } = formData;
  const name = sectionA.businessName || 'your business';
  const score = metrics.healthScore;

  // Find the most critical alert
  const criticalAlert = alerts.find(a => a.severity === 'critical');
  const warningAlert = alerts.find(a => a.severity === 'warning');
  const topInsight = insights[0];

  let summary = '';

  if (criticalAlert) {
    summary = `Welcome back! ${name}'s health score is ${score}/100. `;
    summary += criticalAlert.message.split('.')[0] + '. ';
    summary += 'Let\'s work on fixing this.';
  } else if (warningAlert) {
    summary = `Welcome back! ${name} is at ${score}/100 health score. `;
    summary += warningAlert.message.split('.')[0] + '. ';
    summary += 'Want to explore ways to improve?';
  } else if (topInsight) {
    summary = `Welcome back! ${name} is looking healthy at ${score}/100. `;
    summary += topInsight.message.split('.')[0] + '.';
  } else if (metrics.revenue.totalRevenue > 0) {
    const solo = isSoloOrFamily(sectionA.teamSize);
    summary = `Welcome back! ${name} is at ${score}/100 health score with ${formatCurrency(metrics.profitability.netProfit)} monthly net profit (${formatPercent(metrics.profitability.netMarginPercent)} margin). `;
    if (solo && metrics.ownerDraw.sustainableMonthlyDraw > 0) {
      summary += `You can sustainably draw ${formatCurrency(metrics.ownerDraw.sustainableMonthlyDraw)}/month.`;
    } else {
      summary += 'Things are looking good!';
    }
  } else {
    summary = `Welcome! Let's start building your business plan. Tell me about your business and I'll help you fill in the details.`;
  }

  return summary;
}
