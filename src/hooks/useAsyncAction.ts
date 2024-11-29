import { useCallback } from 'react';
import { useUI } from './useUI';

interface AsyncActionOptions<T> {
  loadingKey?: string;
  useGlobalLoading?: boolean;
  globalLoadingOptions?: {
    title?: string;
    description?: string;
  };
  onSuccess?: (result: T) => void;
  onError?: (error: any) => void;
}

export function useAsyncAction() {
  const { 
    startLoading, 
    stopLoading, 
    showGlobalLoading, 
    hideGlobalLoading 
  } = useUI();

  const executeAction = useCallback(async <T,>(
    action: () => Promise<T>,
    options: AsyncActionOptions<T> = {}
  ) => {
    const {
      loadingKey,
      useGlobalLoading = false,
      globalLoadingOptions,
      onSuccess,
      onError
    } = options;

    try {
      if (loadingKey) {
        startLoading(loadingKey);
      }
      if (useGlobalLoading) {
        showGlobalLoading(globalLoadingOptions);
      }
      
      const result = await action();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      if (loadingKey) {
        stopLoading(loadingKey);
      }
      if (useGlobalLoading) {
        hideGlobalLoading();
      }
    }
  }, [startLoading, stopLoading, showGlobalLoading, hideGlobalLoading]);

  return executeAction;
}