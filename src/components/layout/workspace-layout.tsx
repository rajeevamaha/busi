'use client';

import { ReactNode, useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

interface WorkspaceLayoutProps {
  formPanel: ReactNode;
  dashboardPanel: ReactNode;
  chatPanel: ReactNode;
}

export function WorkspaceLayout({ formPanel, dashboardPanel, chatPanel }: WorkspaceLayoutProps) {
  const { isMobile, setIsMobile, activePanel } = useUIStore();

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
      <div className="h-full">
        {activePanel === 'form' && formPanel}
        {activePanel === 'dashboard' && dashboardPanel}
        {activePanel === 'chat' && chatPanel}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Form Panel */}
      <div className="w-[380px] min-w-[320px] border-r overflow-hidden">
        {formPanel}
      </div>
      {/* Dashboard Panel */}
      <div className="flex-1 min-w-[300px] border-r overflow-hidden">
        {dashboardPanel}
      </div>
      {/* Chat Panel */}
      <div className="w-[360px] min-w-[280px] overflow-hidden">
        {chatPanel}
      </div>
    </div>
  );
}
