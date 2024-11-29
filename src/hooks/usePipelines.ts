import { useState, useCallback } from 'react';
import { Pipeline, PipelineStage } from '@/types/pipeline';
import { pipelineService } from '@/services/pipeline/pipelineService';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { useUI } from './useUI';

export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const { execute } = useOptimisticUpdate<Pipeline[]>();
  const { startLoading, stopLoading } = useUI();

  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pipelineService.getAll();
      setPipelines(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error loading pipelines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPipeline = useCallback(async (data: Partial<Pipeline>) => {
    const previousPipelines = [...pipelines];
    const tempId = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    
    const newPipeline: Pipeline = {
      id: tempId,
      name: data.name || '',
      description: data.description,
      icon: data.icon || 'Banknote',
      order: pipelines.length,
      stages: [],
      lossReasons: [],
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const updatedPipelines = [...pipelines, newPipeline];
    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          const id = await pipelineService.create({
            name: newPipeline.name,
            description: newPipeline.description,
            icon: newPipeline.icon,
            order: newPipeline.order
          });

          setPipelines(prev => prev.map(p => 
            p.id === tempId ? { ...p, id } : p
          ));

          return id;
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: 'new-pipeline' }
      );
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const updatePipeline = useCallback(async (id: string, data: Partial<Pipeline>) => {
    if (!id) {
      console.error('Pipeline ID is required for update');
      return;
    }

    const previousPipelines = [...pipelines];
    const updatedPipelines = pipelines.map(p => 
      p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
    );

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.update(id, data);
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `update-pipeline-${id}` }
      );
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const deletePipeline = useCallback(async (pipeline: Pipeline) => {
    if (!pipeline?.id) {
      console.error('Valid pipeline object with ID is required for deletion');
      return;
    }

    const previousPipelines = [...pipelines];
    const updatedPipelines = pipelines.filter(p => p.id !== pipeline.id);

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.softDelete(pipeline.id!);
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `delete-pipeline-${pipeline.id}` }
      );
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const reorderPipelines = useCallback(async (newPipelines: Pipeline[]) => {
    const previousPipelines = [...pipelines];
    const updatedPipelines = newPipelines.map((pipeline, index) => ({
      ...pipeline,
      order: index
    }));

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.reorder(
            updatedPipelines.map((p, index) => ({
              id: p.id!,
              order: index
            }))
          );
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: 'reorder-pipelines' }
      );
    } catch (error) {
      console.error('Error reordering pipelines:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const createStage = useCallback(async (pipelineId: string, stage: Partial<PipelineStage>) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    const tempId = Math.random().toString(36).substr(2, 9);
    const now = new Date();

    const newStage: PipelineStage = {
      id: tempId,
      name: stage.name!,
      order: pipeline.stages.length,
      pipelineId,
      createdAt: now,
      updatedAt: now
    };

    const updatedPipelines = pipelines.map(p =>
      p.id === pipelineId
        ? { ...p, stages: [...p.stages, newStage] }
        : p
    );

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          const id = await pipelineService.createStage(pipelineId, stage);
          setPipelines(prev => prev.map(p =>
            p.id === pipelineId
              ? {
                  ...p,
                  stages: p.stages.map(s =>
                    s.id === tempId ? { ...s, id } : s
                  )
                }
              : p
          ));
          return id;
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `new-stage-${pipelineId}` }
      );
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const updateStage = useCallback(async (stageId: string, stage: Partial<PipelineStage>) => {
    const pipeline = pipelines.find(p => 
      p.stages.some(s => s.id === stageId)
    );
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    const updatedPipelines = pipelines.map(p =>
      p.id === pipeline.id
        ? {
            ...p,
            stages: p.stages.map(s =>
              s.id === stageId
                ? { ...s, ...stage, updatedAt: new Date() }
                : s
            )
          }
        : p
    );

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.updateStage(stageId, stage);
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `update-stage-${stageId}` }
      );
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const deleteStage = useCallback(async (stageId: string) => {
    const pipeline = pipelines.find(p => 
      p.stages.some(s => s.id === stageId)
    );
    if (!pipeline) return;

    const previousPipelines = [...pipelines];
    const updatedPipelines = pipelines.map(p =>
      p.id === pipeline.id
        ? {
            ...p,
            stages: p.stages
              .filter(s => s.id !== stageId)
              .map((s, index) => ({ ...s, order: index }))
          }
        : p
    );

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.deleteStage(stageId);
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `delete-stage-${stageId}` }
      );
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  }, [pipelines, execute]);

  const reorderStages = useCallback(async (pipelineId: string, stages: PipelineStage[]) => {
    const previousPipelines = [...pipelines];
    const updatedPipelines = pipelines.map(p =>
      p.id === pipelineId
        ? { ...p, stages: stages.map((s, index) => ({ ...s, order: index })) }
        : p
    );

    setPipelines(updatedPipelines);

    try {
      await execute(
        async () => {
          await pipelineService.reorderStages(
            pipelineId,
            stages.map(s => s.id!)
          );
        },
        updatedPipelines,
        previousPipelines,
        { loadingKey: `reorder-stages-${pipelineId}` }
      );
    } catch (error) {
      console.error('Error reordering stages:', error);
      throw error;
    }
  }, [pipelines, execute]);

  return {
    pipelines,
    loading,
    loadPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    reorderPipelines,
    createStage,
    updateStage,
    deleteStage,
    reorderStages
  };
}