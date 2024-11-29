import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // User Preferences
  preferences: {
    defaultPipelineId?: string;
    compactMode: boolean;
    showMinimap: boolean;
  };
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // User Preferences
      preferences: {
        compactMode: false,
        showMinimap: true
      },
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences
          }
        }))
    }),
    {
      name: 'app-state'
    }
  )
);