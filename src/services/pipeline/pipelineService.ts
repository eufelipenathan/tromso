import { collection, doc, addDoc, updateDoc, writeBatch, serverTimestamp, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import { CreatePipelineData, UpdatePipelineData } from './types';

const convertTimestamp = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : timestamp;
};

const cleanDataForFirestore = (data: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      cleaned[key] = null;
      return;
    }
    if (value instanceof Date) {
      cleaned[key] = serverTimestamp();
      return;
    }
    if (typeof value === 'string') {
      cleaned[key] = value.trim();
      return;
    }
    cleaned[key] = value;
  });

  return cleaned;
};

export const pipelineService = {
  async getAll(): Promise<Pipeline[]> {
    try {
      const pipelinesQuery = query(
        collection(db, 'pipelines'),
        where('isDeleted', '==', false)
      );
      
      const pipelinesSnap = await getDocs(pipelinesQuery);
      
      const stagesQuery = query(
        collection(db, 'stages'),
        where('isDeleted', '==', false)
      );
      
      const stagesSnap = await getDocs(stagesQuery);
      
      const stagesByPipeline = stagesSnap.docs.reduce((acc, doc) => {
        const stage = {
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        };
        
        if (!acc[stage.pipelineId]) {
          acc[stage.pipelineId] = [];
        }
        acc[stage.pipelineId].push(stage);
        return acc;
      }, {} as Record<string, PipelineStage[]>);
      
      return pipelinesSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          icon: data.icon || 'Banknote',
          order: data.order || 0,
          stages: (stagesByPipeline[doc.id] || []).sort((a, b) => a.order - b.order),
          lossReasons: data.lossReasons || [],
          isDeleted: false,
          deletedAt: convertTimestamp(data.deletedAt),
          createdAt: convertTimestamp(data.createdAt) || new Date(),
          updatedAt: convertTimestamp(data.updatedAt) || new Date()
        } as Pipeline;
      });
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Pipeline | null> {
    try {
      if (!id) {
        throw new Error('Pipeline ID is required');
      }

      const pipelineRef = doc(db, 'pipelines', id);
      const pipelineSnap = await getDoc(pipelineRef);
      
      if (!pipelineSnap.exists()) {
        return null;
      }

      const stagesQuery = query(
        collection(db, 'stages'),
        where('pipelineId', '==', id),
        where('isDeleted', '==', false)
      );
      
      const stagesSnap = await getDocs(stagesQuery);
      const stages = stagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as PipelineStage[];

      const data = pipelineSnap.data();
      return {
        id: pipelineSnap.id,
        name: data.name,
        description: data.description,
        icon: data.icon || 'Banknote',
        order: data.order || 0,
        stages: stages.sort((a, b) => a.order - b.order),
        lossReasons: data.lossReasons || [],
        isDeleted: false,
        deletedAt: convertTimestamp(data.deletedAt),
        createdAt: convertTimestamp(data.createdAt) || new Date(),
        updatedAt: convertTimestamp(data.updatedAt) || new Date()
      } as Pipeline;
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      throw error;
    }
  },

  async create(data: CreatePipelineData): Promise<string> {
    try {
      if (!data.name?.trim()) {
        throw new Error('Pipeline name is required');
      }

      const pipelineData = cleanDataForFirestore({
        name: data.name,
        description: data.description,
        icon: data.icon || 'Banknote',
        order: data.order,
        lossReasons: [],
        isDeleted: false,
        deletedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docRef = await addDoc(collection(db, 'pipelines'), pipelineData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  },

  async update(id: string, data: UpdatePipelineData): Promise<void> {
    try {
      if (!id) {
        throw new Error('Pipeline ID is required');
      }

      const updateData = cleanDataForFirestore({
        ...data,
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'pipelines', id), updateData);
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw error;
    }
  },

  async reorder(pipelines: { id: string; order: number }[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      pipelines.forEach(({ id, order }) => {
        const pipelineRef = doc(db, 'pipelines', id);
        batch.update(pipelineRef, {
          order,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering pipelines:', error);
      throw error;
    }
  },

  async softDelete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Valid pipeline ID is required');
      }

      const batch = writeBatch(db);

      const pipelineRef = doc(db, 'pipelines', id);
      batch.update(pipelineRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const stagesQuery = query(
        collection(db, 'stages'),
        where('pipelineId', '==', id),
        where('isDeleted', '==', false)
      );
      const stagesSnap = await getDocs(stagesQuery);

      stagesSnap.docs.forEach(stageDoc => {
        batch.update(stageDoc.ref, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      const dealsQuery = query(
        collection(db, 'deals'),
        where('pipelineId', '==', id),
        where('isDeleted', '==', false)
      );
      const dealsSnap = await getDocs(dealsQuery);

      dealsSnap.docs.forEach(dealDoc => {
        batch.update(dealDoc.ref, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error soft deleting pipeline:', error);
      throw error;
    }
  },

  async createStage(pipelineId: string, stage: Partial<PipelineStage>): Promise<string> {
    try {
      if (!pipelineId) {
        throw new Error('Pipeline ID is required');
      }

      if (!stage.name?.trim()) {
        throw new Error('Stage name is required');
      }

      const pipelineRef = doc(db, 'pipelines', pipelineId);
      const pipelineSnap = await getDoc(pipelineRef);
      
      if (!pipelineSnap.exists()) {
        throw new Error('Pipeline not found');
      }

      const stagesQuery = query(
        collection(db, 'stages'),
        where('pipelineId', '==', pipelineId),
        where('isDeleted', '==', false)
      );
      const stagesSnap = await getDocs(stagesQuery);
      
      const normalizedName = stage.name.trim().toLowerCase();
      if (stagesSnap.docs.some(doc => 
        doc.data().name.toLowerCase() === normalizedName
      )) {
        throw new Error('A stage with this name already exists in this pipeline');
      }

      const stageData = {
        name: stage.name.trim(),
        pipelineId,
        order: stagesSnap.size,
        isDeleted: false,
        deletedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const stageRef = await addDoc(collection(db, 'stages'), stageData);
      return stageRef.id;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  },

  async updateStage(id: string, stage: Partial<PipelineStage>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Stage ID is required');
      }

      if (stage.name !== undefined && !stage.name.trim()) {
        throw new Error('Stage name cannot be empty');
      }

      const stageRef = doc(db, 'stages', id);
      const stageSnap = await getDoc(stageRef);
      
      if (!stageSnap.exists()) {
        throw new Error('Stage not found');
      }

      const currentStage = stageSnap.data();

      if (stage.name) {
        const normalizedName = stage.name.trim().toLowerCase();
        const stagesQuery = query(
          collection(db, 'stages'),
          where('pipelineId', '==', currentStage.pipelineId),
          where('isDeleted', '==', false)
        );
        const stagesSnap = await getDocs(stagesQuery);
        
        const duplicate = stagesSnap.docs.find(doc => 
          doc.id !== id && 
          doc.data().name.toLowerCase() === normalizedName
        );

        if (duplicate) {
          throw new Error('A stage with this name already exists in this pipeline');
        }
      }

      const updateData = cleanDataForFirestore({
        ...stage,
        name: stage.name?.trim(),
        updatedAt: serverTimestamp()
      });

      await updateDoc(stageRef, updateData);
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  },

  async deleteStage(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Stage ID is required');
      }

      const batch = writeBatch(db);

      const stageRef = doc(db, 'stages', id);
      batch.update(stageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const dealsQuery = query(
        collection(db, 'deals'),
        where('stageId', '==', id),
        where('isDeleted', '==', false)
      );
      
      const dealsSnap = await getDocs(dealsQuery);
      
      if (!dealsSnap.empty) {
        const stageData = (await getDoc(stageRef)).data();
        const fallbackStageQuery = query(
          collection(db, 'stages'),
          where('pipelineId', '==', stageData.pipelineId),
          where('isDeleted', '==', false),
          where('id', '!=', id)
        );
        
        const fallbackStageSnap = await getDocs(fallbackStageQuery);
        const fallbackStage = fallbackStageSnap.docs[0];

        if (fallbackStage) {
          dealsSnap.docs.forEach(dealDoc => {
            batch.update(dealDoc.ref, {
              stageId: fallbackStage.id,
              updatedAt: serverTimestamp()
            });
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  },

  async reorderStages(pipelineId: string, stageIds: string[]): Promise<void> {
    try {
      if (!pipelineId) {
        throw new Error('Pipeline ID is required');
      }

      if (!Array.isArray(stageIds) || stageIds.length === 0) {
        throw new Error('Valid stage IDs array is required');
      }

      const batch = writeBatch(db);

      stageIds.forEach((id, index) => {
        const stageRef = doc(db, 'stages', id);
        batch.update(stageRef, {
          order: index,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering stages:', error);
      throw error;
    }
  }
};