import { create } from 'zustand';
import { Pipeline } from '@/types/pipeline';

interface PipelineState {
  pipelines: Pipeline[];
  setPipelines: (pipelines: Pipeline[]) => void;
  addPipeline: (pipeline: Pipeline) => void;
  updatePipeline: (id: string, pipeline: Partial<Pipeline>) => void;
  removePipeline: (id: string) => void;
  getPipeline: (id: string) => Pipeline | undefined;
  reorderPipelines: (pipelineIds: string[]) => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  pipelines: [],

  setPipelines: (pipelines) => set({ pipelines }),

  addPipeline: (pipeline) => set((state) => ({
    pipelines: [...state.pipelines, pipeline]
  })),

  updatePipeline: (id, updates) => set((state) => ({
    pipelines: state.pipelines.map((pipeline) =>
      pipeline.id === id ? { ...pipeline, ...updates } : pipeline
    )
  })),

  removePipeline: (id) => set((state) => ({
    pipelines: state.pipelines.filter((pipeline) => pipeline.id !== id)
  })),

  getPipeline: (id) => get().pipelines.find((pipeline) => pipeline.id === id),

  reorderPipelines: (pipelineIds) => set((state) => {
    const orderedPipelines = pipelineIds
      .map((id, index) => {
        const pipeline = state.pipelines.find(p => p.id === id);
        return pipeline ? { ...pipeline, order: index } : null;
      })
      .filter((p): p is Pipeline => p !== null);

    return { pipelines: orderedPipelines };
  })
}));