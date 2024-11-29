import { useAppStore } from '@/stores/appStore';

export function useApp() {
  const {
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    preferences,
    updatePreferences
  } = useAppStore();

  return {
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    preferences,
    updatePreferences
  };
}