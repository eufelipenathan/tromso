import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EntityManagementConfig, SupportedEntity } from '../types';

export async function createEntity<T extends SupportedEntity>(
  config: EntityManagementConfig<T>,
  data: Partial<T>
): Promise<{ id: string; entity: T } | null> {
  try {
    if (!config.validateEntity(data)) {
      throw new Error('Invalid entity data');
    }

    const formattedData = config.formatEntity(data);
    const searchTokens = config.generateSearchTokens(formattedData);

    // Remove undefined values
    const cleanData = Object.entries(formattedData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const entityData = {
      ...cleanData,
      searchTokens,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, config.collectionName), entityData);
    
    return {
      id: docRef.id,
      entity: { ...entityData, id: docRef.id, createdAt: new Date() } as T
    };
  } catch (error) {
    console.error(`Error creating ${config.collectionName}:`, error);
    return null;
  }
}

export async function updateEntity<T extends SupportedEntity>(
  config: EntityManagementConfig<T>,
  id: string,
  data: Partial<T>
): Promise<{ id: string; entity: T } | null> {
  try {
    if (!config.validateEntity(data)) {
      throw new Error('Invalid entity data');
    }

    const formattedData = config.formatEntity(data);
    const searchTokens = config.generateSearchTokens(formattedData);

    // Remove undefined values
    const cleanData = Object.entries(formattedData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const entityData = {
      ...cleanData,
      searchTokens,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, config.collectionName, id), entityData);
    
    return {
      id,
      entity: { ...entityData, id } as T
    };
  } catch (error) {
    console.error(`Error updating ${config.collectionName}:`, error);
    return null;
  }
}

export async function deleteEntity<T extends SupportedEntity>(
  config: EntityManagementConfig<T>,
  id: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, config.collectionName, id), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error(`Error deleting ${config.collectionName}:`, error);
    return false;
  }
}