import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EntityCreationHook, EntityCreationResult, EntityManagementConfig, SupportedEntity } from '../types';

export function useEntityCreation<T extends SupportedEntity>(
  config: EntityManagementConfig<T>
): EntityCreationHook<T> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createEntity = async (data: Partial<T>): Promise<EntityCreationResult<T> | null> => {
    console.log(`[useEntityCreation] Creating ${config.collectionName}:`, data);
    
    try {
      setError(null);
      setLoading(true);

      if (!config.validateEntity(data)) {
        throw new Error('Invalid entity data');
      }

      const formattedData = config.formatEntity(data);
      const searchTokens = config.generateSearchTokens(formattedData);

      const entityData = {
        ...formattedData,
        searchTokens,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log(`[useEntityCreation] Saving to Firestore:`, entityData);
      
      const docRef = await addDoc(collection(db, config.collectionName), entityData);
      
      const result = {
        id: docRef.id,
        entity: { ...entityData, id: docRef.id } as T
      };

      console.log(`[useEntityCreation] Entity created:`, result);
      return result;
    } catch (error) {
      console.error(`[useEntityCreation] Error:`, error);
      setError(`Error creating ${config.collectionName}. Please try again.`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEntity,
    error,
    loading
  };
}