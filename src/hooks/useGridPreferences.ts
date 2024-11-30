import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { GridPreferences } from '@/types/grid';
import { useUI } from './useUI';

export function useGridPreferences(pageId: string) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<GridPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useUI();

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, pageId]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'gridPreferences'),
        where('userId', '==', user.uid),
        where('pageId', '==', pageId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const data = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as GridPreferences;
        setPreferences(data);
      } else {
        setPreferences(null);
      }
    } catch (error) {
      console.error('Error loading grid preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<GridPreferences>) => {
    if (!user) return;

    const loadingKey = 'save-grid-preferences';
    try {
      startLoading(loadingKey);

      // Clean up preferences data for Firestore
      const cleanPreferences = {
        ...newPreferences,
        userId: user.uid,
        pageId,
        updatedAt: serverTimestamp()
      };

      // Clean up columns data
      if (cleanPreferences.columns) {
        cleanPreferences.columns = cleanPreferences.columns.map(col => ({
          key: col.key,
          visible: Boolean(col.visible),
          order: Number(col.order) || 0,
          width: col.width ? Number(col.width) : null
        }));
      }

      // Clean up sortBy data
      if (cleanPreferences.sortBy) {
        cleanPreferences.sortBy = {
          key: String(cleanPreferences.sortBy.key),
          direction: cleanPreferences.sortBy.direction === 'asc' ? 'asc' : 'desc'
        };
      }

      // Clean up filters data
      if (cleanPreferences.filters) {
        cleanPreferences.filters = cleanPreferences.filters.map(filter => ({
          key: String(filter.key),
          operator: String(filter.operator),
          value: String(filter.value)
        }));
      }

      // If there's an existing document
      if (preferences?.id) {
        // If no preferences to save, delete the document
        if (Object.keys(newPreferences).length === 0) {
          await deleteDoc(doc(db, 'gridPreferences', preferences.id));
          setPreferences(null);
        } else {
          // Update existing document
          await updateDoc(doc(db, 'gridPreferences', preferences.id), cleanPreferences);
        }
      } else if (Object.keys(newPreferences).length > 0) {
        // Create new document only if there are preferences to save
        const docRef = await addDoc(collection(db, 'gridPreferences'), {
          ...cleanPreferences,
          createdAt: serverTimestamp()
        });
        
        // Update local state with new ID
        setPreferences({
          id: docRef.id,
          userId: user.uid,
          pageId,
          ...newPreferences
        } as GridPreferences);
      }

      // Reload preferences to ensure synchronization
      await loadPreferences();
    } catch (error) {
      console.error('Error saving grid preferences:', error);
    } finally {
      stopLoading(loadingKey);
    }
  };

  return {
    preferences,
    loading,
    savePreferences
  };
}