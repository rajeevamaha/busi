import { create } from 'zustand';

type ActivePanel = 'form' | 'dashboard' | 'chat';

interface UIState {
  activePanel: ActivePanel;
  isMobile: boolean;
  chatOpen: boolean;
  sidebarOpen: boolean;

  setActivePanel: (panel: ActivePanel) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'form',
  isMobile: false,
  chatOpen: false,
  sidebarOpen: false,

  setActivePanel: (panel) => set({ activePanel: panel }),
  setIsMobile: (isMobile) => set({ isMobile }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
}));
