import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import LoadingState from '@/components/LoadingState';

interface UIContextType {
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  showGlobalLoading: (options?: { title?: string; description?: string }) => void;
  hideGlobalLoading: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [globalLoading, setGlobalLoading] = useState<{
    show: boolean;
    title?: string;
    description?: string;
  }>({
    show: false
  });

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);

  const showGlobalLoading = useCallback((options?: { title?: string; description?: string }) => {
    setGlobalLoading({
      show: true,
      title: options?.title,
      description: options?.description
    });
  }, []);

  const hideGlobalLoading = useCallback(() => {
    setGlobalLoading({ show: false });
  }, []);

  const contextValue = useMemo(() => ({
    startLoading,
    stopLoading,
    isLoading,
    showGlobalLoading,
    hideGlobalLoading
  }), [
    startLoading,
    stopLoading,
    isLoading,
    showGlobalLoading,
    hideGlobalLoading
  ]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
      {globalLoading.show && (
        <LoadingState 
          fullPage 
          title={globalLoading.title}
          description={globalLoading.description}
        />
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}