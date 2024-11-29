import { useState, useCallback } from 'react';

interface OptimisticStateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onStateChange?: (data: T) => void;
}

export function useOptimisticState<T>(
  initialState: T | null,
  options: OptimisticStateOptions<T> = {}
) {
  const [state, setState] = useState<T | null>(initialState);
  const [previousState, setPreviousState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateState = useCallback((newState: T) => {
    setState(newState);
    options.onStateChange?.(newState);
  }, [options]);

  const optimisticUpdate = useCallback(async (
    updateFn: () => Promise<void>,
    optimisticValue: T
  ) => {
    // Store current state for rollback
    setPreviousState(state);
    setError(null);

    // Update state optimistically
    updateState(optimisticValue);

    try {
      await updateFn();
      options.onSuccess?.(optimisticValue);
    } catch (error) {
      // Rollback on error
      if (previousState) {
        updateState(previousState);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update';
      setError(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setPreviousState(null);
    }
  }, [state, previousState, updateState, options]);

  return {
    state,
    error,
    updateState,
    optimisticUpdate
  };
}