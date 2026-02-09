'use client';

import { Alert, CompoundInsight } from '@/lib/engine/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InsightCardProps {
  alert?: Alert;
  insight?: CompoundInsight;
}

export function InsightCard({ alert, insight }: InsightCardProps) {
  if (alert) {
    const severityClass = alert.severity === 'critical'
      ? 'border-red-300 bg-red-50'
      : 'border-yellow-300 bg-yellow-50';

    return (
      <Card className={`p-3 ${severityClass} border mb-2`}>
        <div className="flex items-start gap-2">
          <Badge variant="outline" className={
            alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }>
            {alert.severity}
          </Badge>
          <div>
            <p className="text-sm">{alert.message}</p>
            {alert.recommendations.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {alert.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {'\u2022'} {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (insight) {
    return (
      <Card className="p-3 border-blue-300 bg-blue-50 border mb-2">
        <div className="flex items-start gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            insight
          </Badge>
          <p className="text-sm">{insight.message}</p>
        </div>
      </Card>
    );
  }

  return null;
}
