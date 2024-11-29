import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LossReason, Pipeline } from '@/types/pipeline';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useUI } from './useUI';

export function useLossReasons() {
  const [reasons, setReasons] = useState<LossReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useOptimisticUpdate<LossReason[]>();
  const { startLoading, stopLoading } = useUI();

  const fetchReasons = useCallback(async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, 'lossReasons'),
        where('deletedAt', '==', null)
      );
      const snapshot = await getDocs(q);
      const reasonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        deletedAt: doc.data().deletedAt?.toDate()
      })) as LossReason[];
      
      setReasons(reasonsData.sort((a, b) => a.order - b.order));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReason = useCallback(async (data: Partial<LossReason>) => {
    const loadingKey = 'create-reason';
    const newReason: LossReason = {
      ...data,
      order: reasons.length,
      createdAt: new Date(),
      deletedAt: null,
      isDeleted: false
    } as LossReason;

    // Optimistically update local state
    const previousReasons = [...reasons];
    setReasons(prev => [...prev, newReason]);

    try {
      startLoading(loadingKey);
      const docRef = await addDoc(collection(db, 'lossReasons'), {
        ...newReason,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update local state with the real ID
      setReasons(prev => 
        prev.map(r => r === newReason ? { ...newReason, id: docRef.id } : r)
      );

      return { ...newReason, id: docRef.id };
    } catch (error) {
      // Revert on error
      setReasons(previousReasons);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  }, [reasons, startLoading, stopLoading]);

  const updateReason = useCallback(async (id: string, updates: Partial<LossReason>) => {
    const loadingKey = `update-reason-${id}`;
    const reasonIndex = reasons.findIndex(r => r.id === id);
    if (reasonIndex === -1) return;

    const previousReasons = [...reasons];
    const updatedReason = { ...reasons[reasonIndex], ...updates };

    // Optimistically update local state
    setReasons(prev => prev.map(r => r.id === id ? updatedReason : r));

    try {
      startLoading(loadingKey);
      await updateDoc(doc(db, 'lossReasons', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // Revert on error
      setReasons(previousReasons);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  }, [reasons, startLoading, stopLoading]);

  const deleteReason = useCallback(async (id: string) => {
    const loadingKey = `delete-reason-${id}`;
    const previousReasons = [...reasons];

    // Optimistically update local state
    setReasons(prev => prev.filter(r => r.id !== id));

    try {
      startLoading(loadingKey);
      
      // Start a batch write
      const batch = writeBatch(db);

      // Mark the reason as deleted
      const reasonRef = doc(db, 'lossReasons', id);
      batch.update(reasonRef, {
        deletedAt: serverTimestamp(),
        isDeleted: true,
        updatedAt: serverTimestamp()
      });

      // Get all pipelines that reference this loss reason
      const pipelinesSnapshot = await getDocs(collection(db, 'pipelines'));
      const pipelines = pipelinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pipeline[];

      // Remove the loss reason from all pipelines that reference it
      pipelines.forEach(pipeline => {
        if (pipeline.lossReasons?.some(r => r.reasonId === id)) {
          const pipelineRef = doc(db, 'pipelines', pipeline.id!);
          batch.update(pipelineRef, {
            lossReasons: pipeline.lossReasons.filter(r => r.reasonId !== id),
            updatedAt: serverTimestamp()
          });
        }
      });

      // Commit all changes atomically
      await batch.commit();
    } catch (error) {
      // Revert on error
      setReasons(previousReasons);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  }, [reasons, startLoading, stopLoading]);

  const reorderReasons = useCallback(async (newOrder: LossReason[]) => {
    const loadingKey = 'reorder-reasons';
    const previousReasons = [...reasons];

    // Optimistically update local state
    setReasons(newOrder);

    try {
      startLoading(loadingKey);
      const batch = writeBatch(db);
      
      newOrder.forEach((reason, index) => {
        const reasonRef = doc(db, 'lossReasons', reason.id!);
        batch.update(reasonRef, { 
          order: index,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      // Revert on error
      setReasons(previousReasons);
      throw error;
    } finally {
      stopLoading(loadingKey);
    }
  }, [reasons, startLoading, stopLoading]);

  return {
    reasons,
    isLoading,
    fetchReasons,
    createReason,
    updateReason,
    deleteReason,
    reorderReasons
  };
}