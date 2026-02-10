'use client';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertSeverity } from '@/lib/engine/types';

interface CalculatedFieldProps {
  label: string;
  value: string;
  severity?: AlertSeverity;
  suffix?: string;
}

const severityColors: Record<AlertSeverity, string> = {
  healthy: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

export function CalculatedField({ label, value, severity, suffix }: CalculatedFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
      <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        {suffix && <p className="text-xs text-muted-foreground/70">{suffix}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {severity && severity !== 'healthy' && (
          <Badge variant="outline" className={severityColors[severity]}>
            {severity}
          </Badge>
        )}
      </div>
    </div>
  );
}
