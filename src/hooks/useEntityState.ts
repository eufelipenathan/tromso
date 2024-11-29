import { useState, useCallback } from 'react';
import { useOptimisticState } from './useOptimisticState';
import { SupportedEntity } from '@/lib/entity-management/types';

interface EntityStateOptions<T> {
  onSuccess?: (entity: T) => void;
  onError?: (error: Error) => void;
  onStateChange?: (entity: T) => void;
}

export function useEntityState<T extends SupportedEntity>(
  initialEntity: T | null,
  options: EntityStateOptions<T> = {}
) {
  const {
    state: entity,
    error,
    updateState: setEntity,
    optimisticUpdate
  } = useOptimisticState<T>(initialEntity, options);

  const [isLoading, setIsLoading] = useState(false);

  const updateEntity = useCallback(async (
    updateFn: () => Promise<void>,
    optimisticValue: T
  ) => {
    setIsLoading(true);
    try {
      await optimisticUpdate(updateFn, optimisticValue);
    } finally {
      setIsLoading(false);
    }
  }, [optimisticUpdate]);

  return {
    entity,
    error,
    isLoading,
    setEntity,
    updateEntity
  };
}