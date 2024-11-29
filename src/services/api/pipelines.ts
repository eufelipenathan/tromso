import { pipelineRepository } from '@/repositories';
import { Pipeline } from '@/types/pipeline';

export const pipelineService = {
  async getAll() {
    return pipelineRepository.getAll();
  },

  async getById(id: string) {
    return pipelineRepository.getById(id);
  },

  async create(pipeline: Partial<Pipeline>) {
    return pipelineRepository.create(pipeline);
  },

  async update(id: string, pipeline: Partial<Pipeline>) {
    await pipelineRepository.update(id, pipeline);
  },

  async delete(id: string) {
    await pipelineRepository.delete(id);
  },

  async updateOrder(pipelines: { id: string; order: number }[]) {
    await pipelineRepository.updateOrder(pipelines);
  },

  async updateStages(id: string, stages: Pipeline['stages']) {
    await pipelineRepository.updateStages(id, stages);
  },

  async updateLossReasons(id: string, lossReasons: Pipeline['lossReasons']) {
    await pipelineRepository.updateLossReasons(id, lossReasons);
  }
};