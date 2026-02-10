'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useMemo } from 'react';

export function ChatPanel() {
  const planId = useBusinessPlanStore((s) => s.planId);

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

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2">
        <h2 className="text-lg font-semibold">AI Advisor</h2>
        <p className="text-xs text-muted-foreground">Powered by Claude</p>
      </div>

      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
