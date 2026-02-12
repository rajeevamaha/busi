import { create } from 'zustand';

type ActivePanel = 'form' | 'dashboard' | 'chat';
type LayoutMode = 'standard' | 'onboarding';

interface UIState {
  activePanel: ActivePanel;
  isMobile: boolean;
  chatOpen: boolean;
  sidebarOpen: boolean;
  layoutMode: LayoutMode;

  setActivePanel: (panel: ActivePanel) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'form',
  isMobile: false,
  chatOpen: false,
  sidebarOpen: false,
  layoutMode: 'standard',

  setActivePanel: (panel) => set({ activePanel: panel }),
  setIsMobile: (isMobile) => set({ isMobile }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
  setLayoutMode: (layoutMode) => set({ layoutMode }),
}));
