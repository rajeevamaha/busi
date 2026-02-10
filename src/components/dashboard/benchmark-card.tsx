'use client';

import { AlertSeverity } from '@/lib/engine/types';
import { formatPercent } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface BenchmarkCardProps {
  label: string;
  value: number;
  healthyRange: string;
  severity: AlertSeverity;
}

const severityStyles: Record<AlertSeverity, { bg: string; border: string; dot: string }> = {
  healthy: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
};

export function BenchmarkCard({ label, value, healthyRange, severity }: BenchmarkCardProps) {
  const styles = severityStyles[severity];

  return (
    <Card className={`p-2.5 ${styles.bg} ${styles.border} border gap-0`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold">{formatPercent(value)}</p>
      <p className="text-[10px] text-muted-foreground">Healthy: {healthyRange}</p>
    </Card>
  );
}
