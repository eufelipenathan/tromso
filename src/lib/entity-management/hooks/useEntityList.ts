import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUI } from '@/hooks/useUI';
import { useEntityOperations } from './useEntityOperations';
import { EntityManagementConfig, SupportedEntity } from '../types';

interface UseEntityListProps<T extends SupportedEntity> {
  config: EntityManagementConfig<T>;
  filters?: Record<string, any>;
  orderByField?: keyof T;
  orderDirection?: 'asc' | 'desc';
}

export function useEntityList<T extends SupportedEntity>({
  config,
  filters,
  orderByField,
  orderDirection = 'asc'
}: UseEntityListProps<T>) {
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useUI();
  const { removeEntity } = useEntityOperations(config);

  const loadEntities = async () => {
    try {
      setLoading(true);
      
      let q = collection(db, config.collectionName);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          q = query(q, where(field, '==', value));
        });
      }

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.toString(), orderDirection));
      }

      const querySnapshot = await getDocs(q);
      const entitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      setEntities(entitiesData);
    } catch (error) {
      console.error(`Error loading ${config.collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const handleDelete = async (id: string) => {
    const loadingKey = `delete-${config.collectionName}-${id}`;
    startLoading(loadingKey);

    try {
      const success = await removeEntity(id);
      if (success) {
        setEntities(prev => prev.filter(entity => entity.id !== id));
      }
      return success;
    } finally {
      stopLoading(loadingKey);
    }
  };

  const handleCreate = (entity: T) => {
    setEntities(prev => [...prev, entity]);
  };

  const handleUpdate = (id: string, updatedEntity: T) => {
    setEntities(prev => prev.map(entity => 
      entity.id === id ? updatedEntity : entity
    ));
  };

  return {
    entities,
    loading,
    handleDelete,
    handleCreate,
    handleUpdate,
    refresh: loadEntities
  };
}