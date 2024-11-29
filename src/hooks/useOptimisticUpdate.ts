import { useCallback } from 'react';
import { useUI } from './useUI';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  loadingKey?: string;
}

export function useOptimisticUpdate<T>() {
  const [previousValue, setPreviousValue] = useState<T | null>(null);
  const { startLoading, stopLoading } = useUI();

  const execute = useCallback(async <R>(
    updateFn: () => Promise<R>,
    optimisticValue: T,
    currentValue: T,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    console.log('[useOptimisticUpdate] Starting optimistic update:', {
      optimisticValue,
      currentValue
    });

    const { onSuccess, onError, loadingKey } = options;

    // Store previous value for rollback
    setPreviousValue(currentValue);
    console.log('[useOptimisticUpdate] Stored previous value for rollback');

    if (loadingKey) {
      startLoading(loadingKey);
      console.log('[useOptimisticUpdate] Started loading state:', loadingKey);
    }

    try {
      // Execute the update
      console.log('[useOptimisticUpdate] Executing update function');
      const result = await updateFn();
      console.log('[useOptimisticUpdate] Update successful:', result);

      // Call success callback
      if (onSuccess) {
        console.log('[useOptimisticUpdate] Calling success callback');
        onSuccess(optimisticValue);
      }

      return result;
    } catch (error) {
      console.error('[useOptimisticUpdate] Error during update:', error);
      
      // Rollback on error
      if (previousValue) {
        console.log('[useOptimisticUpdate] Rolling back to previous value');
        onError?.(error as Error);
      }

      // Re-throw for caller handling
      throw error;
    } finally {
      if (loadingKey) {
        stopLoading(loadingKey);
        console.log('[useOptimisticUpdate] Stopped loading state:', loadingKey);
      }
      setPreviousValue(null);
      console.log('[useOptimisticUpdate] Cleanup complete');
    }
  }, [startLoading, stopLoading]);

  return {
    execute,
    previousValue
  };
}