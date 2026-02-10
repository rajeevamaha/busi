'use client';

import { useState } from 'react';
import { useAlerts, useInsights } from '@/hooks/use-insights';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function InsightsCarousel() {
  const alerts = useAlerts();
  const insights = useInsights();
  const [index, setIndex] = useState(0);

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  type Item =
    | { type: 'alert'; severity: 'critical' | 'warning'; message: string; recommendations: string[] }
    | { type: 'insight'; message: string };

  const items: Item[] = [
    ...criticalAlerts.map((a) => ({ type: 'alert' as const, severity: a.severity as 'critical' | 'warning', message: a.message, recommendations: a.recommendations })),
    ...warningAlerts.map((a) => ({ type: 'alert' as const, severity: a.severity as 'critical' | 'warning', message: a.message, recommendations: a.recommendations })),
    ...insights.map((i) => ({ type: 'insight' as const, message: i.message })),
  ];

  if (items.length === 0) {
    return (
      <Card className="flex-1 flex items-center justify-center p-4 border-green-200 bg-green-50">
        <p className="text-sm text-green-700">No issues detected. Looking good!</p>
      </Card>
    );
  }

  const current = items[index];
  const total = items.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const bgClass = current.type === 'alert'
    ? current.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
    : 'border-blue-200 bg-blue-50';

  const badgeClass = current.type === 'alert'
    ? current.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
    : 'bg-blue-100 text-blue-700';

  const badgeLabel = current.type === 'alert' ? current.severity : 'insight';

  return (
    <Card className={`flex-1 flex flex-col ${bgClass} border overflow-hidden`}>
      <div className="flex items-center justify-between px-3 pt-2">
        <Badge variant="outline" className={badgeClass}>{badgeLabel}</Badge>
        <span className="text-xs text-muted-foreground">{index + 1} / {total}</span>
      </div>
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-sm">{current.message}</p>
        {current.type === 'alert' && current.recommendations.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {current.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-muted-foreground">{'\u2022'} {rec}</li>
            ))}
          </ul>
        )}
      </div>
      {total > 1 && (
        <div className="flex items-center justify-center gap-3 px-3 pb-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-foreground/60' : 'w-1.5 bg-foreground/20'}`}
              />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
