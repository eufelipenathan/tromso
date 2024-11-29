import { useState } from 'react';

export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const startLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  };

  const stopLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;

  return { startLoading, stopLoading, isLoading };
}