'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useAlerts, useInsights } from '@/hooks/use-insights';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { InsightCard } from './insight-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

export function ChatPanel() {
  const planId = useBusinessPlanStore((s) => s.planId);
  const alerts = useAlerts();
  const insights = useInsights();

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
  const showInsights = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h2 className="text-lg font-semibold">AI Advisor</h2>
        <p className="text-xs text-muted-foreground">Powered by Claude</p>
      </div>

      {showInsights && (criticalAlerts.length > 0 || warningAlerts.length > 0 || insights.length > 0) && (
        <ScrollArea className="max-h-[300px] border-b">
          <div className="p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Auto-detected issues:
            </p>
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

      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
