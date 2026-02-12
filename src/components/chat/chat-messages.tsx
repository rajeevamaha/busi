'use client';

import { useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import { ToolActivity } from './tool-activity';
import { ToolResultCard } from './tool-result-card';

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Ask me anything about your business plan.
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>&ldquo;Set my monthly rent to $2000&rdquo;</p>
            <p>&ldquo;What if I raise prices by 10%?&rdquo;</p>
            <p>&ldquo;Show me my alerts&rdquo;</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === 'user' ? (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground">
                <div className="whitespace-pre-wrap">
                  {m.parts
                    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
                    .map((p) => p.text)
                    .join('')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-start">
              <div className="max-w-[85%] space-y-2">
                {m.parts.map((part, i) => {
                  if (part.type === 'text' && 'text' in part && part.text) {
                    return (
                      <div key={i} className="bg-muted rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  }
                  if (part.type === 'tool-invocation' && 'toolInvocation' in part) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const inv = (part as any).toolInvocation;
                    if (inv.state === 'result') {
                      return (
                        <ToolResultCard
                          key={i}
                          toolName={inv.toolName}
                          result={inv.result as Record<string, unknown>}
                        />
                      );
                    }
                    return (
                      <ToolActivity
                        key={i}
                        toolName={inv.toolName}
                        state={inv.state}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg px-3 py-2 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
