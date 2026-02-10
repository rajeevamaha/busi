'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useAlerts, useInsights } from '@/hooks/use-insights';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { InsightCard } from './insight-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ChatPanel() {
  const planId = useBusinessPlanStore((s) => s.planId);
  const alerts = useAlerts();
  const insights = useInsights();
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    headers: () => ({
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
    }),
    body: { planId },
  }), [planId]);

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === 'submitted' || status === 'streaming';

  function handleSend(content: string) {
    sendMessage({ text: content });
  }

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const hasInsights = criticalAlerts.length > 0 || warningAlerts.length > 0 || insights.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h2 className="text-lg font-semibold">AI Advisor</h2>
        <p className="text-xs text-muted-foreground">Powered by Claude</p>
      </div>

      <ChatMessages messages={messages} isLoading={isLoading} />

      {hasInsights && (
        <div className="border-t">
          <button
            onClick={() => setInsightsCollapsed(!insightsCollapsed)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
          >
            <span>Auto-detected issues ({criticalAlerts.length + warningAlerts.length + insights.length})</span>
            {insightsCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {!insightsCollapsed && (
            <ScrollArea className="max-h-[250px]">
              <div className="px-3 pb-2 space-y-1">
                {criticalAlerts.map((a) => (
                  <InsightCard key={a.id} alert={a} />
                ))}
                {warningAlerts.map((a) => (
                  <InsightCard key={a.id} alert={a} />
                ))}
                {insights.map((i) => (
                  <InsightCard key={i.id} insight={i} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
