import { dealRepository } from '@/repositories';
import { Deal } from '@/types/pipeline';

export const dealService = {
  async getAll() {
    return dealRepository.getAll();
  },

  async getById(id: string) {
    return dealRepository.getById(id);
  },

  async getByPipeline(pipelineId: string) {
    return dealRepository.getByPipeline(pipelineId);
  },

  async create(deal: Partial<Deal>) {
    return dealRepository.create(deal);
  },

  async update(id: string, deal: Partial<Deal>) {
    await dealRepository.update(id, deal);
  },

  async delete(id: string) {
    await dealRepository.delete(id);
  },

  async updateStage(id: string, stageId: string) {
    await dealRepository.updateStage(id, stageId);
  },

  async updateStatus(id: string, status: Deal['status'], lossReasonId?: string) {
    await dealRepository.updateStatus(id, status, lossReasonId);
  }
};