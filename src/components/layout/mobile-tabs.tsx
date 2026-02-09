'use client';

import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ClipboardList, BarChart3, MessageSquare } from 'lucide-react';

export function MobileTabs() {
  const { activePanel, setActivePanel, isMobile } = useUIStore();

  if (!isMobile) return null;

  const tabs = [
    { id: 'form' as const, label: 'Form', icon: ClipboardList },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="flex h-12">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activePanel === tab.id ? 'default' : 'ghost'}
            className="flex-1 rounded-none h-full gap-1"
            onClick={() => setActivePanel(tab.id)}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
