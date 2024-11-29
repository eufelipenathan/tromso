import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
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

      // Se não houver preferências para salvar e não existir documento,
      // não precisa fazer nada
      if (Object.keys(newPreferences).length === 0 && !preferences?.id) {
        return;
      }

      // Remove undefined values and empty arrays
      const cleanPreferences = Object.entries(newPreferences).reduce((acc, [key, value]) => {
        if (value === undefined) return acc;
        if (Array.isArray(value) && value.length === 0) return acc;
        return { ...acc, [key]: value };
      }, {});

      // Se houver um documento existente
      if (preferences?.id) {
        // Se não houver preferências para salvar, exclui o documento
        if (Object.keys(cleanPreferences).length === 0) {
          await deleteDoc(doc(db, 'gridPreferences', preferences.id));
          setPreferences(null);
        } else {
          // Atualiza o documento existente
          await updateDoc(doc(db, 'gridPreferences', preferences.id), {
            ...cleanPreferences,
            userId: user.uid,
            pageId
          });
        }
      } else if (Object.keys(cleanPreferences).length > 0) {
        // Cria um novo documento apenas se houver preferências para salvar
        const docRef = await addDoc(collection(db, 'gridPreferences'), {
          ...cleanPreferences,
          userId: user.uid,
          pageId
        });
        
        // Atualiza o estado com o novo ID
        setPreferences({
          id: docRef.id,
          userId: user.uid,
          pageId,
          ...cleanPreferences
        } as GridPreferences);
      }

      // Recarrega as preferências para garantir sincronização
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