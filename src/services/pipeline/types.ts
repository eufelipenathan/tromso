import { Pipeline, PipelineStage } from '@/types/pipeline';

export interface CreatePipelineData {
  name: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface UpdatePipelineData {
  name?: string;
  description?: string;
  icon?: string;
  order?: number;
  stages?: PipelineStage[];
  lossReasons?: Pipeline['lossReasons'];
  isDeleted?: boolean;
  deletedAt?: Date | null;
  updatedAt?: Date;
}