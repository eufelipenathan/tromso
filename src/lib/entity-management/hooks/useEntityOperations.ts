import { useState } from 'react';
import { createEntity, updateEntity, deleteEntity } from '../core/operations';
import { EntityManagementConfig, SupportedEntity } from '../types';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

export function useEntityOperations<T extends SupportedEntity>(config: EntityManagementConfig<T>) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { execute } = useOptimisticUpdate<T>();

  const saveEntity = async (data: Partial<T>): Promise<{ id: string; entity: T } | null> => {
    try {
      setError(null);
      setLoading(true);

      if (data.id) {
        return await execute(
          () => updateEntity(config, data.id!, data),
          data as T,
          data as T,
          {
            loadingKey: `save-${config.collectionName}-${data.id}`
          }
        );
      } else {
        return await createEntity(config, data);
      }
    } catch (error) {
      setError(`Error saving ${config.collectionName}. Please try again.`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeEntity = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      return await deleteEntity(config, id);
    } catch (error) {
      setError(`Error deleting ${config.collectionName}. Please try again.`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveEntity,
    removeEntity,
    error,
    loading
  };
}