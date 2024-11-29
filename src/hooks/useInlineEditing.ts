import { useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useOptimisticUpdate } from './useOptimisticUpdate';

interface InlineEditingOptions<T> {
  onSuccess?: (entity: T) => void;
  onError?: (error: Error) => void;
  onStateChange?: (entity: T) => void;
}

export function useInlineEditing<T extends { id?: string }>(
  collection: string, 
  initialEntity: T | null,
  options: InlineEditingOptions<T> = {}
) {
  const [entity, setEntity] = useState<T | null>(initialEntity);
  const [error, setError] = useState<string | null>(null);
  const { execute } = useOptimisticUpdate<T>();

  const updateLocalState = useCallback((field: string, value: any) => {
    if (!entity) return null;

    let updatedEntity: T;

    if (field.startsWith('customFields.')) {
      const fieldKey = field.split('.')[1];
      updatedEntity = {
        ...entity,
        customFields: {
          ...(entity.customFields || {}),
          [fieldKey]: value
        }
      };
    } else {
      updatedEntity = {
        ...entity,
        [field]: value
      };
    }

    setEntity(updatedEntity);
    options.onStateChange?.(updatedEntity);
    return updatedEntity;
  }, [entity, options]);

  const saveField = useCallback(async (
    field: string,
    value: any,
    previousValue: any
  ): Promise<boolean> => {
    if (!entity?.id) return false;

    const loadingKey = `save-${collection}-${field}-${entity.id}`;

    try {
      setError(null);

      // Update local state first (optimistic update)
      const updatedEntity = updateLocalState(field, value);
      if (!updatedEntity) return false;

      // Prepare update data
      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (field.startsWith('customFields.')) {
        const fieldKey = field.split('.')[1];
        updateData.customFields = {
          ...(entity.customFields || {}),
          [fieldKey]: value
        };
      } else {
        updateData[field] = value;
      }

      // Execute update with optimistic handling
      await execute(
        async () => {
          const docRef = doc(db, collection, entity.id!);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            throw new Error('Entity not found');
          }

          await updateDoc(docRef, updateData);
        },
        updatedEntity,
        entity,
        {
          loadingKey,
          onSuccess: (updated) => {
            options.onSuccess?.(updated);
          },
          onError: (error) => {
            // Revert local state
            updateLocalState(field, previousValue);
            setError(error.message);
            options.onError?.(error);
          }
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }, [collection, entity, options, execute, updateLocalState]);

  return {
    entity,
    setEntity,
    error,
    saveField
  };
}