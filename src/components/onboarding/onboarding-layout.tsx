'use client';

import { ReactNode, useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { SectionProgress } from './section-progress';

interface OnboardingLayoutProps {
  chatPanel: ReactNode;
  dashboardPanel: ReactNode;
  formPanel: ReactNode;
  onExitOnboarding: () => void;
}

export function OnboardingLayout({ chatPanel, dashboardPanel, formPanel, onExitOnboarding }: OnboardingLayoutProps) {
  const { isMobile, setIsMobile, activePanel, setActivePanel } = useUIStore();
  const showForm = useUIStore((s) => s.chatOpen); // repurpose chatOpen for form toggle in onboarding

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b">
          <button
            onClick={() => setActivePanel('chat')}
            className={`flex-1 px-3 py-2 text-xs font-medium ${activePanel === 'chat' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setActivePanel('dashboard')}
            className={`flex-1 px-3 py-2 text-xs font-medium ${activePanel === 'dashboard' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActivePanel('form')}
            className={`flex-1 px-3 py-2 text-xs font-medium ${activePanel === 'form' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          >
            Manual Entry
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activePanel === 'chat' && chatPanel}
          {activePanel === 'dashboard' && dashboardPanel}
          {activePanel === 'form' && formPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat Panel - 60% */}
      <div className="flex flex-col" style={{ width: showForm ? '40%' : '60%' }}>
        <div className="border-b px-3 py-1.5 flex items-center justify-between">
          <SectionProgress />
        </div>
        <div className="flex-1 overflow-hidden">{chatPanel}</div>
      </div>

      {/* Form Panel - shown conditionally */}
      {showForm && (
        <div className="w-[380px] border-l overflow-hidden">
          {formPanel}
        </div>
      )}

      {/* Dashboard Panel - 40% */}
      <div className="flex-1 min-w-[300px] border-l overflow-hidden flex flex-col">
        <div className="border-b px-3 py-1.5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => useUIStore.getState().setChatOpen(!showForm)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showForm ? 'Hide Manual Entry' : 'Manual Entry'}
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={onExitOnboarding}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Exit Onboarding
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{dashboardPanel}</div>
      </div>
    </div>
  );
}
