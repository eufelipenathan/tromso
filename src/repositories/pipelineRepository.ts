import { DatabaseService } from '@/services/database';
import { Pipeline } from '@/types/pipeline';

class PipelineRepository {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService('pipelines');
  }

  async getAll(): Promise<Pipeline[]> {
    return this.db.getAll<Pipeline>({
      orderBy: [['order', 'asc']]
    });
  }

  async getById(id: string): Promise<Pipeline | null> {
    return this.db.getById<Pipeline>(id);
  }

  async create(pipeline: Partial<Pipeline>): Promise<string> {
    return this.db.create<Pipeline>(pipeline);
  }

  async update(id: string, pipeline: Partial<Pipeline>): Promise<void> {
    await this.db.update<Pipeline>(id, pipeline);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(id);
  }

  async updateOrder(pipelines: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of pipelines) {
      await this.db.update<Pipeline>(id, { order });
    }
  }

  async updateStages(id: string, stages: Pipeline['stages']): Promise<void> {
    await this.db.update<Pipeline>(id, { stages });
  }

  async updateLossReasons(id: string, lossReasons: Pipeline['lossReasons']): Promise<void> {
    await this.db.update<Pipeline>(id, { lossReasons });
  }
}

export const pipelineRepository = new PipelineRepository();