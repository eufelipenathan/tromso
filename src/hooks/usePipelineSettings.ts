import { useState, useCallback } from 'react';
import { useUI } from './useUI';
import { 
  fetchPipelinesFromDB,
  createPipelineInDB,
  updatePipelineInDB,
  deletePipelineFromDB,
  updatePipelineStagesInDB,
  updatePipelineOrderInDB
} from '@/services/pipelineService';
import { Pipeline, PipelineStage } from '@/types/pipeline';

export function usePipelineSettings() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const { startLoading, stopLoading } = useUI();

  const fetchPipelines = useCallback(async () => {
    try {
      startLoading('fetch-pipelines');
      const pipelinesData = await fetchPipelinesFromDB();
      setPipelines(pipelinesData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      return pipelinesData;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    } finally {
      stopLoading('fetch-pipelines');
    }
  }, [startLoading, stopLoading]);

  const createPipeline = useCallback(async (pipeline: Partial<Pipeline>) => {
    const previousPipelines = [...pipelines];
    const tempId = Math.random().toString(36).substr(2, 9);
    
    try {
      const newPipeline = {
        ...pipeline,
        id: tempId,
        stages: [],
        lossReasons: [],
        order: pipelines.length,
        createdAt: new Date()
      } as Pipeline;
      
      setPipelines(prev => [...prev, newPipeline]);
      const id = await createPipelineInDB(newPipeline);
      
      setPipelines(prev => prev.map(p => 
        p.id === tempId ? { ...p, id } : p
      ));

      return id;
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines]);

  const updatePipeline = useCallback(async (id: string, updates: Partial<Pipeline>) => {
    const previousPipelines = [...pipelines];
    
    try {
      setPipelines(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ));

      await updatePipelineInDB(id, updates);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines]);

  const deletePipeline = useCallback(async (id: string) => {
    const previousPipelines = [...pipelines];
    
    try {
      setPipelines(prev => prev.filter(p => p.id !== id));
      await deletePipelineFromDB(id);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines]);

  const reorderPipelines = useCallback(async (newPipelines: Pipeline[]) => {
    const previousPipelines = [...pipelines];
    
    try {
      setPipelines(newPipelines);
      await updatePipelineOrderInDB(newPipelines);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines]);

  const updateStages = useCallback(async (pipelineId: string, stages: PipelineStage[]) => {
    const previousPipelines = [...pipelines];
    
    try {
      setPipelines(prev => prev.map(p => 
        p.id === pipelineId ? { ...p, stages, updatedAt: new Date() } : p
      ));

      await updatePipelineStagesInDB(pipelineId, stages);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines]);

  const addStage = useCallback(async (pipelineId: string, stage: Partial<PipelineStage>) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    const stages = pipeline.stages || [];
    
    try {
      const newStage = {
        id: Math.random().toString(36).substr(2, 9),
        name: stage.name!.trim(),
        order: stages.length,
        pipelineId,
        createdAt: new Date()
      };

      const newStages = [...stages, newStage];
      await updateStages(pipelineId, newStages);
      return newStage;
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines, updateStages]);

  const updateStage = useCallback(async (pipelineId: string, stageId: string, updates: Partial<PipelineStage>) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    
    try {
      const newStages = pipeline.stages.map(stage => 
        stage.id === stageId ? { ...stage, ...updates, updatedAt: new Date() } : stage
      );

      await updateStages(pipelineId, newStages);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines, updateStages]);

  const deleteStage = useCallback(async (pipelineId: string, stageId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    
    try {
      const newStages = pipeline.stages
        .filter(s => s.id !== stageId)
        .map((s, index) => ({ ...s, order: index }));

      await updateStages(pipelineId, newStages);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines, updateStages]);

  const reorderStages = useCallback(async (pipelineId: string, newStages: PipelineStage[]) => {
    const previousPipelines = [...pipelines];
    
    try {
      await updateStages(pipelineId, newStages);
    } catch (error) {
      setPipelines(previousPipelines);
      throw error;
    }
  }, [pipelines, updateStages]);

  return {
    pipelines,
    fetchPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    reorderPipelines,
    updateStages,
    addStage,
    updateStage,
    deleteStage,
    reorderStages
  };
}