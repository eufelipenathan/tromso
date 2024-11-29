import { DatabaseService } from '@/services/database';
import { Deal } from '@/types/pipeline';

class DealRepository {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService('deals');
  }

  async getAll(): Promise<Deal[]> {
    return this.db.getAll<Deal>();
  }

  async getById(id: string): Promise<Deal | null> {
    return this.db.getById<Deal>(id);
  }

  async getByPipeline(pipelineId: string): Promise<Deal[]> {
    return this.db.getAll<Deal>({
      where: [['pipelineId', '==', pipelineId]],
      orderBy: [['createdAt', 'desc']]
    });
  }

  async create(deal: Partial<Deal>): Promise<string> {
    return this.db.create<Deal>(deal);
  }

  async update(id: string, deal: Partial<Deal>): Promise<void> {
    await this.db.update<Deal>(id, deal);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(id);
  }

  async updateStage(id: string, stageId: string): Promise<void> {
    await this.db.update<Deal>(id, {
      stageId,
      updatedAt: new Date()
    });
  }

  async updateStatus(id: string, status: Deal['status'], lossReasonId?: string): Promise<void> {
    await this.db.update<Deal>(id, {
      status,
      lossReasonId,
      updatedAt: new Date()
    });
  }
}

export const dealRepository = new DealRepository();