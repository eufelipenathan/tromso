import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pipeline, PipelineStage } from '@/types/pipeline';

export async function fetchPipelinesFromDB() {
  const querySnapshot = await getDocs(collection(db, 'pipelines'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Pipeline[];
}

export async function createPipelineInDB(pipeline: Pipeline) {
  const { id, ...pipelineData } = pipeline;
  const docRef = await addDoc(collection(db, 'pipelines'), pipelineData);
  return docRef.id;
}

export async function updatePipelineInDB(id: string, updates: Partial<Pipeline>) {
  await updateDoc(doc(db, 'pipelines', id), {
    ...updates,
    updatedAt: new Date()
  });
}

export async function deletePipelineFromDB(id: string) {
  await deleteDoc(doc(db, 'pipelines', id));
}

export async function updatePipelineStagesInDB(pipelineId: string, stages: PipelineStage[]) {
  await updateDoc(doc(db, 'pipelines', pipelineId), {
    stages,
    updatedAt: new Date()
  });
}

export async function updatePipelineOrderInDB(pipelines: Pipeline[]) {
  const batch = writeBatch(db);
  
  pipelines.forEach((pipeline, index) => {
    const pipelineRef = doc(db, 'pipelines', pipeline.id!);
    batch.update(pipelineRef, { 
      order: index,
      updatedAt: new Date()
    });
  });

  await batch.commit();
}