import { useState, useCallback } from 'react';
import { EntitySelectionHook, SupportedEntity } from '../types';

export function useEntitySelection<T extends SupportedEntity>(): EntitySelectionHook<T> {
  const [selectedEntity, setSelectedEntity] = useState<T | null>(null);

  const handleEntityCreated = useCallback(async (id: string, entity: T): Promise<T> => {
    console.log('[useEntitySelection] Entity created:', { id, entity });
    setSelectedEntity(entity);
    return entity;
  }, []);

  const handleEntitySelected = useCallback((id: string) => {
    console.log('[useEntitySelection] Entity selected:', id);
  }, []);

  const clearSelection = useCallback(() => {
    console.log('[useEntitySelection] Selection cleared');
    setSelectedEntity(null);
  }, []);

  return {
    selectedEntity,
    setSelectedEntity,
    handleEntityCreated,
    handleEntitySelected,
    clearSelection
  };
}