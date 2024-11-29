import { useCallback } from 'react';
import { useUI } from './useUI';

interface GlobalLoadingOptions {
  title?: string;
  description?: string;
}

export function useGlobalLoading() {
  const { showGlobalLoading, hideGlobalLoading } = useUI();

  const withLoading = useCallback(async <T,>(
    action: () => Promise<T>,
    options?: GlobalLoadingOptions
  ) => {
    try {
      showGlobalLoading(options);
      return await action();
    } finally {
      hideGlobalLoading();
    }
  }, [showGlobalLoading, hideGlobalLoading]);

  return {
    withLoading
  };
}