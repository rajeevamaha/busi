'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FormData } from '@/lib/engine/types';

interface AgentChatPanelProps {
  initialMessage?: string;
}

export function AgentChatPanel({ initialMessage }: AgentChatPanelProps) {
  const planId = useBusinessPlanStore((s) => s.planId);
  const role = useBusinessPlanStore((s) => s.role);
  const setFormData = useBusinessPlanStore((s) => s.setFormData);
  const sentInitial = useRef(false);

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/agent/chat',
    headers: () => ({
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`,
    }),
    body: { planId, role },
  }), [planId, role]);

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onError: (err) => {
      console.error('[Agent Chat Error]', err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Refetch plan data from server after tool calls modify it
  const refetchPlan = useCallback(async () => {
    if (!planId) return;
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const plan = await res.json();
        if (plan.formData) {
          setFormData(plan.formData as FormData);
        }
      }
    } catch {
      // Silently fail — form will catch up on next auto-save
    }
  }, [planId, setFormData]);

  // Watch for tool results — when updateBusinessPlan completes, refetch plan
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;

    const hasToolResult = lastMsg.parts.some((p) => {
      if (p.type !== 'tool-invocation' || !('toolInvocation' in p)) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inv = (p as any).toolInvocation;
      return inv.state === 'result' && inv.toolName === 'updateBusinessPlan';
    });

    if (hasToolResult) {
      refetchPlan();
    }
  }, [messages, refetchPlan]);

  // Send initial message for onboarding
  useEffect(() => {
    if (initialMessage && !sentInitial.current && messages.length === 0) {
      sentInitial.current = true;
      sendMessage({ text: initialMessage });
    }
  }, [initialMessage, messages.length, sendMessage]);

  function handleSend(content: string) {
    sendMessage({ text: content });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">AI Agent</h2>
        <p className="text-[10px] text-muted-foreground">
          I can update your plan, run scenarios, and analyze your business
        </p>
      </div>

      <ChatMessages messages={messages} isLoading={isLoading} />
      {error && (
        <div className="mx-4 mb-2 p-2 rounded bg-red-50 border border-red-200 text-xs text-red-600">
          Error: {error.message || 'Something went wrong. Please try again.'}
        </div>
      )}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
